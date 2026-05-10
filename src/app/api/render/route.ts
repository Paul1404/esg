import { NextResponse } from 'next/server';
import { renderTemplate } from '@/templates';
import { SignatureSchema, TemplateIdSchema } from '@/lib/validation';
import { z, flattenError } from 'zod';
import { clientKey, rateLimitMulti } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 10;

const noStore = { 'Cache-Control': 'no-store' };
const MAX_BODY_BYTES = 64 * 1024;

const Body = z.object({
  template: TemplateIdSchema,
  data: SignatureSchema,
});

export async function POST(req: Request) {
  const ip = clientKey(req);
  const limit = rateLimitMulti(
    `render:${ip}`,
    { suffix: 'burst', limit: 10, windowMs: 10 * 1000 },
    { suffix: 'minute', limit: 60, windowMs: 60 * 1000 },
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many render requests. Slow down.' },
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

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: flattenError(parsed.error) },
      { status: 400, headers: noStore },
    );
  }
  const html = renderTemplate(parsed.data.template, parsed.data.data);
  return NextResponse.json({ html }, { headers: noStore });
}
