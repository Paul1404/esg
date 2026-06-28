import type { MetadataRoute } from 'next';
import { GUIDE_SEO, TEMPLATE_SEO, siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const host = siteUrl();
  const now = new Date();

  return [
    {
      url: `${host}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${host}/editor`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${host}/templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...TEMPLATE_SEO.map((t) => ({
      url: `${host}/templates/${t.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${host}/guides`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    ...GUIDE_SEO.map((guide) => ({
      url: `${host}/guides/${guide.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}
