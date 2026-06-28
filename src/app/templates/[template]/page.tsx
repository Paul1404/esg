import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DEFAULT_SIGNATURE, type TemplateId } from '@/lib/types';
import { renderTemplate } from '@/templates';
import { TEMPLATE_SEO, absoluteUrl } from '@/lib/seo';

type Props = { params: Promise<{ template: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return TEMPLATE_SEO.map((template) => ({ template: template.slug }));
}

function getTemplate(slug: string) {
  return TEMPLATE_SEO.find((template) => template.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { template: slug } = await params;
  const template = getTemplate(slug);
  if (!template) return {};

  return {
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    alternates: { canonical: `/templates/${template.slug}` },
    openGraph: {
      title: `${template.title} · ESG`,
      description: template.description,
      url: `/templates/${template.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${template.title} · ESG`,
      description: template.description,
    },
  };
}

export default async function TemplatePage({ params }: Props) {
  const { template: slug } = await params;
  const template = getTemplate(slug);
  if (!template) notFound();

  const relatedTemplates = TEMPLATE_SEO.filter((item) => item.id !== template.id).slice(0, 3);
  const previewHtml = renderTemplate(template.id as TemplateId, DEFAULT_SIGNATURE);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: template.title,
    description: template.description,
    url: absoluteUrl(`/templates/${template.slug}`),
    isPartOf: {
      '@type': 'WebApplication',
      name: 'ESG',
      url: absoluteUrl('/'),
    },
    about: ['email signature', 'HTML email', 'Outlook signature', 'Gmail signature'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Templates', item: absoluteUrl('/templates') },
      {
        '@type': 'ListItem',
        position: 3,
        name: template.title,
        item: absoluteUrl(`/templates/${template.slug}`),
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([structuredData, breadcrumbStructuredData]) }}
      />

      <header className="border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="ESG home">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center font-bold text-sm shadow-soft transition group-hover:scale-105">
              e
            </div>
            <span className="font-semibold tracking-tight">ESG</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary">
            <Link href="/templates" className="btn-ghost text-sm hidden sm:inline-flex">Templates</Link>
            <Link href={`/editor?template=${template.id}`} className="btn-primary">Use template</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:py-18 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px] gap-10 items-start">
        <div>
          <div className="text-sm text-text-dim mb-4">
            <Link href="/templates" className="hover:text-accent transition">Templates</Link>
            <span className="mx-2">/</span>
            <span>{template.name}</span>
          </div>
          <span className="pill-accent mb-5">Free HTML template</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            {template.title}
          </h1>
          <p className="mt-5 text-lg text-text-muted leading-relaxed max-w-2xl">
            {template.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/editor?template=${template.id}`} className="btn-primary text-base px-5 py-2.5">
              Customize in editor
            </Link>
            <Link href="/templates" className="btn-ghost text-base px-5 py-2.5">
              Browse templates
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            <section className="card p-5" aria-labelledby="best-for-heading">
              <h2 id="best-for-heading" className="font-semibold">Best for</h2>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {template.bestFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="card p-5" aria-labelledby="includes-heading">
              <h2 id="includes-heading" className="font-semibold">Includes</h2>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {template.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <aside className="card overflow-hidden" aria-label={`${template.name} email signature preview`}>
          <div className="px-5 py-3 border-b border-border text-sm text-text-muted">
            Live sample
          </div>
          <div className="bg-white p-5 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16" aria-labelledby="how-it-works-heading">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="card p-5">
            <h2 id="how-it-works-heading" className="font-semibold">Pick the template</h2>
            <p className="text-sm text-text-muted mt-2 leading-relaxed">
              Open this template in the editor with the right structure already selected.
            </p>
          </article>
          <article className="card p-5">
            <h2 className="font-semibold">Customize every field</h2>
            <p className="text-sm text-text-muted mt-2 leading-relaxed">
              Add contact details, colors, logo, photo, CTA, pronouns, disclaimer, and social links.
            </p>
          </article>
          <article className="card p-5">
            <h2 className="font-semibold">Export safely</h2>
            <p className="text-sm text-text-muted mt-2 leading-relaxed">
              Copy rich text, raw HTML, a standalone file, a vCard, or a plain-text fallback.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" aria-labelledby="related-heading">
        <h2 id="related-heading" className="section-title mb-5">Related templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedTemplates.map((item) => (
            <Link key={item.id} href={`/templates/${item.slug}`} className="card-hover p-5 group">
              <h3 className="font-semibold group-hover:text-accent transition">{item.title}</h3>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
