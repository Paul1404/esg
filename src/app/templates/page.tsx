import Link from 'next/link';
import type { Metadata } from 'next';
import { TEMPLATE_SEO, absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Email Signature Templates',
  description:
    'Browse free HTML email signature templates for Outlook, Gmail, Apple Mail, corporate teams, creators, compact replies, and branded company signatures.',
  alternates: { canonical: '/templates' },
};

const itemListStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free email signature templates',
  itemListElement: TEMPLATE_SEO.map((template, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: template.title,
    url: absoluteUrl(`/templates/${template.slug}`),
  })),
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListStructuredData) }}
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
          <span className="pill-accent mb-5">HTML email signature templates</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Free email signature templates for every client.
          </h1>
          <p className="mt-5 text-lg text-text-muted leading-relaxed">
            Start from an Outlook-safe, Gmail-ready, Apple Mail-friendly template, then customize
            fonts, colors, contact fields, social links, images, disclaimers, and export format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {TEMPLATE_SEO.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.slug}`}
              className="card-hover p-5 group flex flex-col gap-4"
            >
              <div>
                <h2 className="font-semibold group-hover:text-accent transition">{template.title}</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{template.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto" aria-label={`${template.name} template uses`}>
                {template.bestFor.slice(0, 3).map((item) => (
                  <span key={item} className="pill">{item}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
