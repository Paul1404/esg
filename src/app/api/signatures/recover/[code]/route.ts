import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SignatureSchema, TemplateIdSchema } from '@/lib/validation';
import { clientKey, rateLimitMulti } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 10;

const noStore = { 'Cache-Control': 'no-store' };

type Params = { params: Promise<{ code: string }> };

export async function GET(req: Request, { params }: Params) {
  const ip = clientKey(req);
  const limit = rateLimitMulti(
    `recover:${ip}`,
    { suffix: 'burst', limit: 5, windowMs: 10 * 1000 },
    { suffix: 'minute', limit: 30, windowMs: 60 * 1000 },
    { suffix: 'hour', limit: 200, windowMs: 60 * 60 * 1000 },
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many recovery attempts. Wait a moment and try again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds), ...noStore },
      },
    );
  }

  const { code } = await params;
  // The codes we mint are a 10-char nanoid from a 33-char alphabet. Reject
  // anything outside that shape so we do not hammer the DB with garbage.
  if (!/^[a-km-z2-9]{4,20}$/.test(code)) {
    return NextResponse.json(
      { error: 'That code does not look right.' },
      { status: 400, headers: noStore },
    );
  }

  let sig;
  try {
    sig = await prisma.signature.findUnique({ where: { slug: code } });
  } catch {
    return NextResponse.json(
      { error: 'Recovery is unavailable right now.' },
      { status: 503, headers: noStore },
    );
  }
  if (!sig) {
    return NextResponse.json(
      { error: 'No signature found for that code.' },
      { status: 404, headers: noStore },
    );
  }

  const tpl = TemplateIdSchema.safeParse(sig.template);
  const data = SignatureSchema.safeParse(sig.data);
  if (!tpl.success || !data.success) {
    return NextResponse.json(
      { error: 'Saved signature is corrupted.' },
      { status: 422, headers: noStore },
    );
  }

  return NextResponse.json(
    {
      name: sig.name,
      template: tpl.data,
      data: data.data,
    },
    { headers: noStore },
  );
}
