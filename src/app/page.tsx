import Link from 'next/link';
import type { Metadata } from 'next';
import { TEMPLATE_LIST, type TemplateId } from '@/lib/types';
import { GUIDE_SEO } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Free Email Signature Generator for Outlook, Gmail, Apple Mail',
  description:
    'Build a professional HTML email signature in your browser. Eleven templates that render correctly in Outlook, Gmail, Apple Mail, and dark mode. No login.',
  alternates: { canonical: '/' },
};

export const revalidate = 86400;

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Works in every email client',
    body: 'Table layouts, inline CSS, MSO conditionals, and VML buttons. Renders correctly in Outlook 2007 and later on Windows, Gmail, Apple Mail, Outlook.com, and Yahoo.',
  },
  {
    title: 'Dark mode aware',
    body: 'Color, contrast, and divider tones are tested against the clients that auto-invert in dark mode, including Apple Mail and Outlook iOS.',
  },
  {
    title: 'Image hosting built in',
    body: 'Upload photos, logos, and banners. We re-encode them, strip EXIF, and serve them over a stable HTTPS URL ready to paste into any client.',
  },
  {
    title: 'Multiple export formats',
    body: 'Copy rich text into Gmail or Outlook. Export raw HTML for IT teams. Download a vCard. Get a plain text fallback for Slack and terminals.',
  },
  {
    title: 'Live multi-client preview',
    body: 'See how the signature renders in Gmail Light, Gmail Dark, Outlook Desktop, Apple Mail, and on mobile widths before you ship it.',
  },
  {
    title: 'Shareable signatures',
    body: 'Save to a slug-based URL anyone in the company can open and copy from. No login required.',
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is ESG free to use?',
    a: 'Yes. ESG is free and open source. There is no account, no paywall, and no email collection.',
  },
  {
    q: 'Does it work with Outlook on Windows?',
    a: 'Yes. Templates use table layouts, inline CSS, MSO conditional comments, and VML for rounded buttons so they render correctly in Outlook 2007 and later, which use Microsoft Word as the email renderer.',
  },
  {
    q: 'How do I install the signature in Gmail?',
    a: 'Open the editor, build your signature, click Copy as rich text, then paste it into Gmail settings under Signature. Step by step guides for Gmail, Outlook, Apple Mail, and Outlook on the web are included in the app.',
  },
  {
    q: 'Does the signature work in dark mode?',
    a: 'Yes. Templates pick colors that survive the auto-invert behavior used by Apple Mail and Outlook iOS, and include a Gmail Dark preview so you can verify before sending.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Drafts are stored in your browser. You can optionally generate a recovery code if you want to load your signature on another device.',
  },
  {
    q: 'Can I use this as a free HTML email signature generator?',
    a: 'Yes. ESG generates copyable rich text and raw HTML signatures, with table-based markup and inline CSS designed for real email clients.',
  },
];

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const TEMPLATE_SPARK: Record<TemplateId, number[]> = {
  modern: [70, 40, 55],
  classic: [50, 80, 40],
  minimal: [80, 60, 45],
  corporate: [90, 60, 70, 35],
  creative: [85, 50],
  horizontal: [100],
  'photo-card': [60, 80, 50],
  compact: [70, 50],
  'logo-left': [80, 30, 60, 45],
  'logo-bottom': [40, 70, 55, 80],
  centered: [50, 80, 50],
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <header className="border-b border-border sticky top-0 z-30 bg-bg/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="ESG home">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center font-bold text-sm shadow-soft transition group-hover:scale-105">
              e
            </div>
            <span className="font-semibold tracking-tight">ESG</span>
            <span className="pill ml-1">v1</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary">
            <a
              href="https://github.com/Paul1404/esg"
              target="_blank"
              rel="noopener"
              className="btn-ghost text-sm hidden sm:inline-flex"
            >
              GitHub
            </a>
            <Link href="/editor" className="btn-primary">Open editor</Link>
          </nav>
        </div>
      </header>

      <section className="hero-halo">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24">
          <div className="max-w-3xl">
            <span className="pill-accent mb-5">Free Email Signature Generator</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Free email signature generator for Outlook, Gmail, and Apple Mail.
            </h1>
            <p className="mt-6 text-lg text-text-muted leading-relaxed max-w-2xl">
              Create a professional HTML email signature with templates, logo and photo support,
              social links, disclaimers, vCard export, and copy-paste setup guides. Outlook on
              Windows renders email with Word. Gmail strips your{' '}
              <code className="text-accent bg-accent-soft px-1.5 py-0.5 rounded text-base font-mono">
                &lt;style&gt;
              </code>{' '}
              tag. Apple Mail auto-inverts colors in dark mode. ESG handles all of it for you.
            </p>
            <div className="mt-9 flex items-center gap-3 flex-wrap">
              <Link href="/editor" className="btn-primary text-base px-5 py-2.5">
                Build a signature
              </Link>
              <a href="#templates" className="btn-ghost text-base px-5 py-2.5">
                See templates
              </a>
              <a href="#guides" className="btn-ghost text-base px-5 py-2.5">
                Setup guides
              </a>
            </div>
            <ul className="mt-8 flex items-center gap-6 text-xs text-text-dim flex-wrap list-none">
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                No account required
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Drafts saved locally
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Free and open source
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-6 pb-20" aria-labelledby="templates-heading">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 id="templates-heading" className="section-title mb-1">Email signature templates</h2>
            <p className="text-sm text-text-muted">Eleven starting points. Edit any of them in the editor.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_LIST.map((t) => (
            <Link
              key={t.id}
              href={`/templates/${t.id}`}
              className="card-hover p-5 group flex flex-col gap-4"
              aria-label={`View the ${t.name} email signature template`}
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
                <h3 className="font-semibold group-hover:text-accent transition text-base">{t.name}</h3>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24" aria-labelledby="features-heading">
        <div className="mb-5">
          <h2 id="features-heading" className="section-title mb-1">What ESG handles for you</h2>
          <p className="text-sm text-text-muted">The fiddly parts of cross-client HTML, so you can stop testing in three apps at once.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-5">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="guides" className="mx-auto max-w-6xl px-6 pb-24" aria-labelledby="guides-heading">
        <div className="mb-5">
          <h2 id="guides-heading" className="section-title mb-1">Email signature setup guides</h2>
          <p className="text-sm text-text-muted">Copy, paste, and test your free HTML signature in the email client you actually use.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GUIDE_SEO.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="card-hover p-5 group">
              <div className="pill mb-4">{guide.client}</div>
              <h3 className="font-semibold group-hover:text-accent transition">{guide.title}</h3>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24" aria-labelledby="faq-heading">
        <div className="mb-5">
          <h2 id="faq-heading" className="section-title mb-1">Frequently asked questions</h2>
          <p className="text-sm text-text-muted">Quick answers about how ESG works.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((f) => (
            <article key={f.q} className="card p-5">
              <h3 className="font-semibold text-base">{f.q}</h3>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{f.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2 text-text-dim">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center text-[10px] font-bold" aria-hidden="true">
              e
            </div>
            <span>ESG, free email signature generator</span>
          </div>
          <nav className="flex items-center gap-5 text-text-dim" aria-label="Footer">
            <a href="https://github.com/Paul1404/esg" target="_blank" rel="noopener" className="hover:text-text transition">
              GitHub
            </a>
            <Link href="/templates" className="hover:text-accent transition">Templates</Link>
            <Link href="/guides" className="hover:text-accent transition">Guides</Link>
            <Link href="/editor" className="hover:text-accent transition">Editor</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
