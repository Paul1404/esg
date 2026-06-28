import Link from 'next/link';
import type { Metadata } from 'next';
import { GUIDE_SEO, absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Email Signature Setup Guides',
  description:
    'Step-by-step email signature setup guides for Gmail, Outlook, Microsoft 365, and Apple Mail using a free HTML email signature generator.',
  alternates: { canonical: '/guides' },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Email signature setup guides',
  itemListElement: GUIDE_SEO.map((guide, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: guide.title,
    url: absoluteUrl(`/guides/${guide.slug}`),
  })),
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="ESG home">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center font-bold text-sm shadow-soft transition group-hover:scale-105">
              e
            </div>
            <span className="font-semibold tracking-tight">ESG</span>
          </Link>
          <Link href="/editor" className="btn-primary">Open editor</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <span className="pill-accent mb-5">Setup guides</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Install your email signature in Gmail, Outlook, or Apple Mail.
          </h1>
          <p className="mt-5 text-lg text-text-muted leading-relaxed">
            Build the signature once, then use the guide for your email client to copy, paste, test,
            and ship a professional HTML signature without coding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {GUIDE_SEO.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="card-hover p-5 group">
              <div className="pill mb-4">{guide.client}</div>
              <h2 className="font-semibold group-hover:text-accent transition">{guide.title}</h2>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
