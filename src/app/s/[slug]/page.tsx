import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { renderTemplate } from '@/templates';
import { SignatureSchema, TemplateIdSchema } from '@/lib/validation';
import SharedActions from './SharedActions';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export default async function SharedSignaturePage({ params }: Props) {
  let sig;
  try {
    sig = await prisma.signature.findUnique({ where: { slug: params.slug } });
    if (sig) {
      await prisma.signature.update({ where: { id: sig.id }, data: { views: { increment: 1 } } }).catch(() => {});
    }
  } catch {
    return (
      <div className="p-10 max-w-xl mx-auto text-center">
        <h1 className="text-xl font-semibold">Database not configured</h1>
        <p className="text-text-muted mt-2 text-sm">Set DATABASE_URL on the server to enable shared signatures.</p>
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
        <div className="text-sm text-text-muted mt-1">Template: {sig.template} · {sig.views} view{sig.views === 1 ? '' : 's'}</div>

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
