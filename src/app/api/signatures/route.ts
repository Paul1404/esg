import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { flattenError } from 'zod';
import { prisma } from '@/lib/db';
import { SaveSignaturePayload } from '@/lib/validation';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const slugId = customAlphabet('abcdefghijkmnopqrstuvwxyz23456789', 10);

export async function POST(req: Request) {
  const limit = rateLimit(`share:${clientKey(req)}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You’re creating share links too quickly. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = SaveSignaturePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: flattenError(parsed.error) }, { status: 400 });
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
    return NextResponse.json({ id: sig.id, slug: sig.slug });
  } catch {
    return NextResponse.json(
      { error: 'Sharing is unavailable right now.' },
      { status: 503 },
    );
  }
}
