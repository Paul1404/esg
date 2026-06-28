import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GUIDE_SEO, absoluteUrl } from '@/lib/seo';

type Props = { params: Promise<{ guide: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return GUIDE_SEO.map((guide) => ({ guide: guide.slug }));
}

function getGuide(slug: string) {
  return GUIDE_SEO.find((guide) => guide.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guide: slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: `${guide.title} · ESG`,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${guide.title} · ESG`,
      description: guide.description,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { guide: slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const relatedGuides = GUIDE_SEO.filter((item) => item.slug !== guide.slug);

  const howToStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.h1,
    description: guide.description,
    totalTime: 'PT5M',
    tool: [{ '@type': 'HowToTool', name: 'ESG free email signature generator' }],
    step: guide.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step,
    })),
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: absoluteUrl('/guides') },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: absoluteUrl(`/guides/${guide.slug}`),
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([howToStructuredData, faqStructuredData, breadcrumbStructuredData]),
        }}
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
            <Link href="/guides" className="btn-ghost text-sm hidden sm:inline-flex">Guides</Link>
            <Link href="/editor" className="btn-primary">Build signature</Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-14">
        <div className="text-sm text-text-dim mb-4">
          <Link href="/guides" className="hover:text-accent transition">Guides</Link>
          <span className="mx-2">/</span>
          <span>{guide.client}</span>
        </div>
        <span className="pill-accent mb-5">{guide.client} signature setup</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">{guide.h1}</h1>
        <p className="mt-5 text-lg text-text-muted leading-relaxed">{guide.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/editor" className="btn-primary text-base px-5 py-2.5">
            Create free signature
          </Link>
          <Link href="/templates" className="btn-ghost text-base px-5 py-2.5">
            Browse templates
          </Link>
        </div>

        <section className="mt-12" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="section-title mb-5">Step-by-step setup</h2>
          <ol className="space-y-3">
            {guide.steps.map((step, index) => (
              <li key={step} className="card p-5 flex gap-4">
                <span className="h-7 w-7 shrink-0 rounded-full bg-accent text-white grid place-items-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-text-muted leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12" aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="section-title mb-5">{guide.client} signature tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.tips.map((tip) => (
              <div key={tip} className="card p-5 text-sm text-text-muted leading-relaxed">
                {tip}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="section-title mb-5">Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.faq.map((item) => (
              <article key={item.q} className="card p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title mb-5">More setup guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedGuides.map((item) => (
              <Link key={item.slug} href={`/guides/${item.slug}`} className="card-hover p-5 group">
                <div className="pill mb-4">{item.client}</div>
                <h3 className="font-semibold group-hover:text-accent transition">{item.title}</h3>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
