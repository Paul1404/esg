import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { isS3Configured, uploadObject } from '@/lib/s3';
import { prisma } from '@/lib/db';
import {
  acquireSlot,
  clientKey,
  GLOBAL_HEAVY_MAX,
  GLOBAL_HEAVY_POOL,
  rateLimitMulti,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 20;

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_BYTES = 4 * 1024 * 1024;

const noStore = { 'Cache-Control': 'no-store' };

// Limit sharp's internal thread pool. Default lets each call use as many
// threads as CPU cores, which on a small Railway instance can pin the box
// when several uploads land at once.
sharp.concurrency(1);
sharp.cache({ memory: 64, files: 0, items: 64 });

export async function POST(req: Request) {
  if (!isS3Configured) {
    return NextResponse.json(
      { error: 'Image uploads are unavailable right now.' },
      { status: 503, headers: noStore },
    );
  }

  const ip = clientKey(req);
  const limit = rateLimitMulti(
    `upload:${ip}`,
    { suffix: 'burst', limit: 3, windowMs: 10 * 1000 },
    { suffix: 'minute', limit: 6, windowMs: 60 * 1000 },
    { suffix: 'hour', limit: 20, windowMs: 60 * 60 * 1000 },
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You are uploading too quickly. Try again in a few minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds), ...noStore },
      },
    );
  }

  // Reject huge bodies before we read them. Saves bandwidth and CPU.
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength && contentLength > MAX_BYTES + 1024) {
    return NextResponse.json(
      { error: 'File too large (max 4MB)' },
      { status: 413, headers: noStore },
    );
  }

  const release = acquireSlot(GLOBAL_HEAVY_POOL, GLOBAL_HEAVY_MAX);
  if (!release) {
    return NextResponse.json(
      { error: 'Server busy. Try again in a moment.' },
      { status: 503, headers: { 'Retry-After': '5', ...noStore } },
    );
  }

  try {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400, headers: noStore });

    const file = form.get('file');
    const kind = String(form.get('kind') ?? 'photo');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400, headers: noStore });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415, headers: noStore });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 413, headers: noStore });
    }

    const buf = Buffer.from(await file.arrayBuffer());

    let processed: Buffer;
    let outputType = 'image/png';
    let width: number | undefined;
    let height: number | undefined;

    try {
      const cap = kind === 'banner' ? 1600 : kind === 'logo' ? 600 : 600;
      const resized = sharp(buf, { animated: false, limitInputPixels: 64_000_000 }).rotate().resize({
        width: cap,
        height: kind === 'banner' ? Math.round(cap * 0.4) : cap,
        fit: 'inside',
        withoutEnlargement: true,
      });
      if (file.type === 'image/jpeg') {
        processed = await resized.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
        outputType = 'image/jpeg';
      } else {
        processed = await resized.png({ compressionLevel: 9 }).toBuffer();
        outputType = 'image/png';
      }
      const out = await sharp(processed).metadata();
      width = out.width;
      height = out.height;
    } catch {
      return NextResponse.json({ error: 'Could not process image' }, { status: 422, headers: noStore });
    }

    const ext = outputType === 'image/jpeg' ? 'jpg' : 'png';
    const key = `signatures/${kind}/${new Date().toISOString().slice(0, 10)}/${nanoid(16)}.${ext}`;
    await uploadObject({ key, body: processed, contentType: outputType });

    const appOrigin = resolveAppOrigin(req);
    const url = `${appOrigin}/i/${key}`;

    try {
      await prisma.asset.create({
        data: { key, url, mimeType: outputType, size: processed.length, width, height },
      });
    } catch {
      /* DB optional */
    }

    return NextResponse.json(
      { url, key, width, height, size: processed.length },
      { headers: noStore },
    );
  } finally {
    release();
  }
}

// Operators frequently set NEXT_PUBLIC_APP_URL to a bare host like
// "esg.example.net" without a scheme, so img src ends up resolved relative
// to the host document. Force https:// when the scheme is missing.
function resolveAppOrigin(req: Request): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return new URL(req.url).origin;
  const stripped = raw.replace(/\/$/, '');
  if (/^https?:\/\//i.test(stripped)) return stripped;
  if (stripped.startsWith('//')) return `https:${stripped}`;
  return `https://${stripped}`;
}
