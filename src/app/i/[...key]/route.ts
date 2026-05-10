import { NextResponse } from 'next/server';
import { getObject, isS3Configured } from '@/lib/s3';
import {
  acquireSlot,
  clientKey,
  rateLimitMulti,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const ALLOWED_PREFIXES = ['signatures/'];
const ALLOWED_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

// Hard cap on the proxied object size we will serve. Larger objects are
// almost certainly not signature assets (uploads cap at 4 MB after re-encode)
// and shovelling MB at every email open is exactly the bill we are trying to
// avoid.
const MAX_PROXY_BYTES = 6 * 1024 * 1024;

// Cap concurrent image-proxy responses. A burst of webmail-thumbnail fetches
// can otherwise pin the box. Tune via env if you have headroom.
const IMG_POOL = 'img-proxy';
const IMG_POOL_MAX = Number(process.env.ESG_MAX_IMG_CONCURRENCY ?? 12);

type Ctx = { params: Promise<{ key: string[] }> };

const longCache = 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400';

export async function GET(req: Request, ctx: Ctx) {
  if (!isS3Configured) {
    return new NextResponse('Image unavailable', { status: 503 });
  }

  const ip = clientKey(req);
  const limit = rateLimitMulti(
    `imgproxy:${ip}`,
    { suffix: 'burst', limit: 60, windowMs: 10 * 1000 },
    { suffix: 'minute', limit: 240, windowMs: 60 * 1000 },
  );
  if (!limit.ok) {
    return new NextResponse('Too many requests', {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  const { key: parts } = await ctx.params;
  const key = (parts ?? []).join('/');
  if (!key || !ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
    return new NextResponse('Not found', { status: 404 });
  }

  const release = acquireSlot(IMG_POOL, IMG_POOL_MAX);
  if (!release) {
    return new NextResponse('Server busy', {
      status: 503,
      headers: { 'Retry-After': '2' },
    });
  }

  try {
    let obj;
    try {
      obj = await getObject(key);
    } catch {
      return new NextResponse('Not found', { status: 404 });
    }
    if (!obj) return new NextResponse('Not found', { status: 404 });

    if (obj.contentLength > MAX_PROXY_BYTES) {
      return new NextResponse('Asset too large', { status: 413 });
    }

    const contentType =
      obj.contentType && ALLOWED_CONTENT_TYPES.has(obj.contentType)
        ? obj.contentType
        : 'application/octet-stream';

    // Conditional GET: if the client already has the right ETag, skip the body.
    const inm = req.headers.get('if-none-match');
    if (obj.etag && inm && inm === obj.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: obj.etag, 'Cache-Control': longCache },
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': String(obj.contentLength),
      'Cache-Control': longCache,
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    };
    if (obj.etag) headers.ETag = obj.etag;

    return new NextResponse(new Uint8Array(obj.body), { status: 200, headers });
  } finally {
    release();
  }
}
