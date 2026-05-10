import Link from 'next/link';
import { TEMPLATE_LIST, type TemplateId } from '@/lib/types';

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

// Visual "sparkline" for each template: a few accent-colored bars in
// roughly the proportions of that template's primary visual rhythm.
const TEMPLATE_SPARK: Record<TemplateId, number[]> = {
  modern: [70, 40, 55],
  classic: [50, 80, 40],
  minimal: [80, 60, 45],
  corporate: [90, 60, 70, 35],
  creative: [85, 50],
  horizontal: [100],
  'photo-card': [60, 80, 50],
  compact: [70, 50],
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border sticky top-0 z-30 bg-bg/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center font-bold text-sm shadow-soft transition group-hover:scale-105">
              e
            </div>
            <span className="font-semibold tracking-tight">ESG</span>
            <span className="pill ml-1">v1</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Paul1404/esg"
              target="_blank"
              rel="noopener"
              className="btn-ghost text-sm hidden sm:inline-flex"
            >
              GitHub
            </a>
            <Link href="/editor" className="btn-primary">Open editor →</Link>
          </div>
        </div>
      </header>

      <section className="hero-halo">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24">
          <div className="max-w-3xl">
            <span className="pill-accent mb-5">Email Signature Generator</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Signatures that survive every email client.
            </h1>
            <p className="mt-6 text-lg text-text-muted leading-relaxed max-w-2xl">
              Outlook on Windows uses Word as its rendering engine. Gmail strips your{' '}
              <code className="text-accent bg-accent-soft px-1.5 py-0.5 rounded text-base font-mono">
                &lt;style&gt;
              </code>{' '}
              tag. Apple Mail auto-inverts colors in dark mode. ESG handles all of it so you don&apos;t have to.
            </p>
            <div className="mt-9 flex items-center gap-3 flex-wrap">
              <Link href="/editor" className="btn-primary text-base px-5 py-2.5">
                Build a signature →
              </Link>
              <a href="#templates" className="btn-ghost text-base px-5 py-2.5">
                See templates
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-text-dim flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                No account required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Drafts saved locally
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Free &amp; open source
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="section-title mb-1">Templates</h2>
            <p className="text-sm text-text-muted">Eight starting points. Tweak any of them in the editor.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_LIST.map((t) => (
            <Link
              key={t.id}
              href={`/editor?template=${t.id}`}
              className="card-hover p-5 group flex flex-col gap-4"
            >
              <div className="flex items-end gap-1 h-8" aria-hidden="true">
                {TEMPLATE_SPARK[t.id].map((h, i) => (
                  <span
                    key={i}
                    className="w-full bg-accent/30 group-hover:bg-accent/60 transition rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div>
                <div className="font-semibold group-hover:text-accent transition">{t.name}</div>
                <div className="text-sm text-text-muted mt-1 leading-relaxed">{t.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-5">
          <h2 className="section-title mb-1">What it handles</h2>
          <p className="text-sm text-text-muted">The fiddly stuff, so you can stop testing in three clients at once.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="font-semibold">{f.title}</div>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2 text-text-dim">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center text-[10px] font-bold">
              e
            </div>
            <span>ESG · email signature generator</span>
          </div>
          <div className="flex items-center gap-5 text-text-dim">
            <a href="https://github.com/Paul1404/esg" target="_blank" rel="noopener" className="hover:text-text transition">
              GitHub
            </a>
            <Link href="/editor" className="hover:text-accent transition">Editor →</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
