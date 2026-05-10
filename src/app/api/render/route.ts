import { NextResponse } from 'next/server';
import { renderTemplate } from '@/templates';
import { SignatureSchema, TemplateIdSchema } from '@/lib/validation';
import { z } from 'zod';

export const runtime = 'nodejs';

const Body = z.object({
  template: TemplateIdSchema,
  data: SignatureSchema,
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const html = renderTemplate(parsed.data.template, parsed.data.data);
  return NextResponse.json({ html });
}
