import { NextResponse } from 'next/server';
import { getObject, isS3Configured } from '@/lib/s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PREFIXES = ['signatures/'];
const ALLOWED_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

type Ctx = { params: Promise<{ key: string[] }> };

export async function GET(req: Request, ctx: Ctx) {
  if (!isS3Configured) {
    return new NextResponse('Image unavailable', { status: 503 });
  }

  const { key: parts } = await ctx.params;
  const key = (parts ?? []).join('/');
  if (!key || !ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
    return new NextResponse('Not found', { status: 404 });
  }

  let obj;
  try {
    obj = await getObject(key);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!obj) return new NextResponse('Not found', { status: 404 });

  const contentType =
    obj.contentType && ALLOWED_CONTENT_TYPES.has(obj.contentType)
      ? obj.contentType
      : 'application/octet-stream';

  // Conditional GET: if the client already has the right ETag, skip the body.
  const inm = req.headers.get('if-none-match');
  if (obj.etag && inm && inm === obj.etag) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: obj.etag, 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Length': String(obj.contentLength),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  };
  if (obj.etag) headers.ETag = obj.etag;

  return new NextResponse(new Uint8Array(obj.body), { status: 200, headers });
}
