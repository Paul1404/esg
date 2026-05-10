import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { renderTemplate } from '@/templates';
import { SignatureSchema, TemplateIdSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import SharedActions from './SharedActions';

export const dynamic = 'force-dynamic';

// Shared signatures contain personal contact info. Keep them out of search
// engines even though the URLs are technically public.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type Props = { params: Promise<{ slug: string }> };

export default async function SharedSignaturePage({ params }: Props) {
  const { slug } = await params;

  // Cheap sanity check on slug shape so we do not hit the DB on garbage paths.
  if (!/^[a-km-z2-9]{4,20}$/.test(slug)) notFound();

  let sig;
  try {
    sig = await prisma.signature.findUnique({ where: { slug } });
    if (sig) {
      // Rate-limit the view-counter write per (IP, slug) so a hot link does
      // not turn into a DB hammer if it is embedded in a busy page.
      const h = await headers();
      const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'anon';
      const ok = rateLimit(`view:${ip}:${slug}`, { limit: 1, windowMs: 30 * 60 * 1000 });
      if (ok.ok) {
        await prisma.signature
          .update({ where: { id: sig.id }, data: { views: { increment: 1 } } })
          .catch(() => {});
      }
    }
  } catch {
    return (
      <div className="p-10 max-w-xl mx-auto text-center">
        <h1 className="text-xl font-semibold">Shared signatures are unavailable</h1>
        <p className="text-text-muted mt-2 text-sm">Try again in a moment, or build a fresh one in the editor.</p>
        <Link href="/editor" className="btn-primary mt-6 inline-flex">Open editor</Link>
      </div>
    );
  }
  if (!sig) notFound();

  const tplParse = TemplateIdSchema.safeParse(sig.template);
  const dataParse = SignatureSchema.safeParse(sig.data);
  if (!tplParse.success || !dataParse.success) notFound();

  const html = renderTemplate(tplParse.data, dataParse.data);

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent text-white grid place-items-center font-bold text-sm">e</div>
            <span className="font-semibold tracking-tight">ESG</span>
          </Link>
          <Link href="/editor" className="btn-ghost text-xs">Open editor</Link>
        </div>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="text-xs text-text-dim">Shared signature</div>
        <h1 className="text-2xl font-semibold tracking-tight">{sig.name}</h1>
        <div className="text-sm text-text-muted mt-1">Template: {sig.template} &middot; {sig.views} view{sig.views === 1 ? '' : 's'}</div>

        <div className="card mt-6 overflow-hidden">
          <div className="bg-white p-6">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>

        <SharedActions html={html} />
      </section>
    </main>
  );
}
