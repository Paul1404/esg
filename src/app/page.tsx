import Link from 'next/link';
import { TEMPLATE_LIST } from '@/lib/types';

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Cross-client compatibility',
    body: 'Table-based layouts, inline CSS, MSO conditionals, and VML buttons. Renders correctly in Outlook 2007+ on Windows, Gmail, Apple Mail, Outlook.com, and Yahoo.',
  },
  {
    title: 'Dark mode aware',
    body: 'Color choices, contrast, and divider tones are tested against dark-mode-inverting clients (Apple Mail, Outlook iOS).',
  },
  {
    title: 'Image hosting built in',
    body: 'Upload photos, logos, and banners; we re-encode them, strip EXIF, and serve them over a stable HTTPS URL ready to paste into any client.',
  },
  {
    title: 'Multiple export formats',
    body: 'Copy rich-text into Gmail/Outlook compose. Export raw HTML for IT teams. Download a vCard. Get a plain-text fallback.',
  },
  {
    title: 'Live multi-client preview',
    body: 'See how the signature renders in Gmail Light, Gmail Dark, Outlook Desktop (forced 96 DPI), Apple Mail, and on mobile widths.',
  },
  {
    title: 'Shareable signatures',
    body: 'Save to a slug-based URL anyone in the company can open and copy from. No login required.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent text-white grid place-items-center font-bold text-sm">e</div>
            <span className="font-semibold tracking-tight">ESG</span>
            <span className="pill ml-2">v1</span>
          </Link>
          <Link href="/editor" className="btn-primary">Open editor →</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <span className="pill mb-5">Email Signature Generator</span>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.05]">
            Signatures that survive every email client.
          </h1>
          <p className="mt-5 text-lg text-text-muted leading-relaxed">
            Outlook on Windows uses Word as its rendering engine. Gmail strips your{' '}
            <code className="text-accent bg-accent-soft px-1.5 py-0.5 rounded">&lt;style&gt;</code> tag.
            Apple Mail auto-inverts colors in dark mode. ESG handles all of it so you don&apos;t have to.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link href="/editor" className="btn-primary">Build a signature →</Link>
            <a
              href="#templates"
              className="btn-ghost"
            >
              See templates
            </a>
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="section-title">Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_LIST.map((t) => (
            <Link
              key={t.id}
              href={`/editor?template=${t.id}`}
              className="card p-5 hover:border-border-strong transition group"
            >
              <div className="font-semibold group-hover:text-accent transition">{t.name}</div>
              <div className="text-sm text-text-muted mt-1">{t.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="section-title">What it handles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="font-semibold">{f.title}</div>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-text-dim flex items-center justify-between">
          <span>ESG · email signature generator</span>
          <Link href="/editor" className="text-accent hover:underline">Editor →</Link>
        </div>
      </footer>
    </main>
  );
}
