import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { isS3Configured, uploadObject } from '@/lib/s3';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!isS3Configured) {
    return NextResponse.json(
      { error: 'S3 is not configured. Set AWS_* env vars.' },
      { status: 503 },
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
  const url = await uploadObject({ key, body: processed, contentType: outputType });

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
