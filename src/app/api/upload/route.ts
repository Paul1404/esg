import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { isS3Configured, uploadObject } from '@/lib/s3';
import { prisma } from '@/lib/db';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!isS3Configured) {
    return NextResponse.json(
      { error: 'Image uploads are unavailable right now.' },
      { status: 503 },
    );
  }

  const limit = rateLimit(`upload:${clientKey(req)}`, { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You’re uploading too quickly. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });

  const file = form.get('file');
  const kind = String(form.get('kind') ?? 'photo');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Normalize: re-encode through sharp to strip EXIF and cap dimensions.
  // This also avoids surprising SVG / animated GIF payloads.
  let processed: Buffer;
  let outputType = 'image/png';
  let width: number | undefined;
  let height: number | undefined;

  try {
    const meta = await sharp(buf, { animated: false }).metadata();
    const cap = kind === 'banner' ? 1600 : kind === 'logo' ? 600 : 600;
    const resized = sharp(buf, { animated: false }).rotate().resize({
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
    void meta;
  } catch {
    return NextResponse.json({ error: 'Could not process image' }, { status: 422 });
  }

  const ext = outputType === 'image/jpeg' ? 'jpg' : 'png';
  const key = `signatures/${kind}/${new Date().toISOString().slice(0, 10)}/${nanoid(16)}.${ext}`;
  await uploadObject({ key, body: processed, contentType: outputType });

  // Always serve through the /i proxy. S3-compatible providers (Tigris, R2,
  // S3 with Block Public Access, Minio with private buckets) silently drop
  // object-level public-read ACLs, so direct {endpoint}/{bucket}/{key} URLs
  // return AccessDenied the moment a recipient opens the email. The proxy
  // uses the app's S3 credentials and works regardless of bucket policy.
  const appOrigin = resolveAppOrigin(req);
  const url = `${appOrigin}/i/${key}`;

  // Best-effort persistence; ignore failure so uploads still work without DB.
  try {
    await prisma.asset.create({
      data: { key, url, mimeType: outputType, size: processed.length, width, height },
    });
  } catch {
    /* DB optional */
  }

  return NextResponse.json({ url, key, width, height, size: processed.length });
}

// Operators frequently set NEXT_PUBLIC_APP_URL to a bare host like
// "esg.example.net" — without a scheme, the resulting img src ends up
// resolved relative to the host document (about:blank in our preview
// iframe), so the image 404s. Force https:// when missing.
function resolveAppOrigin(req: Request): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return new URL(req.url).origin;
  const stripped = raw.replace(/\/$/, '');
  if (/^https?:\/\//i.test(stripped)) return stripped;
  if (stripped.startsWith('//')) return `https:${stripped}`;
  return `https://${stripped}`;
}
