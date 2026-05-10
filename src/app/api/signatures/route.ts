import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { flattenError } from 'zod';
import { prisma } from '@/lib/db';
import { SaveSignaturePayload } from '@/lib/validation';
import { clientKey, rateLimitMulti } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 10;

const slugId = customAlphabet('abcdefghijkmnopqrstuvwxyz23456789', 10);
const noStore = { 'Cache-Control': 'no-store' };

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(req: Request) {
  const ip = clientKey(req);
  const limit = rateLimitMulti(
    `share:${ip}`,
    { suffix: 'burst', limit: 2, windowMs: 10 * 1000 },
    { suffix: 'minute', limit: 4, windowMs: 60 * 1000 },
    { suffix: 'hour', limit: 10, windowMs: 60 * 60 * 1000 },
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You are creating share links too quickly. Try again in a few minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds), ...noStore },
      },
    );
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Payload too large.' },
      { status: 413, headers: noStore },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = SaveSignaturePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: flattenError(parsed.error) },
      { status: 400, headers: noStore },
    );
  }
  try {
    const slug = slugId();
    const sig = await prisma.signature.create({
      data: {
        slug,
        name: parsed.data.name,
        template: parsed.data.template,
        data: parsed.data.data as object,
      },
    });
    return NextResponse.json({ id: sig.id, slug: sig.slug }, { headers: noStore });
  } catch {
    return NextResponse.json(
      { error: 'Sharing is unavailable right now.' },
      { status: 503, headers: noStore },
    );
  }
}
