import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import { prisma } from '@/lib/db';
import { SaveSignaturePayload } from '@/lib/validation';

export const runtime = 'nodejs';

const slugId = customAlphabet('abcdefghijkmnopqrstuvwxyz23456789', 10);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = SaveSignaturePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
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
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not save (is DATABASE_URL set?)' },
      { status: 503 },
    );
  }
}
