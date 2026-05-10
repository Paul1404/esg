import type { MetadataRoute } from 'next';
import { TEMPLATE_LIST } from '@/lib/types';

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return 'http://localhost:3000';
  const stripped = raw.replace(/\/$/, '');
  if (/^https?:\/\//i.test(stripped)) return stripped;
  if (stripped.startsWith('//')) return `https:${stripped}`;
  return `https://${stripped}`;
}

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
    ...TEMPLATE_LIST.map((t) => ({
      url: `${host}/editor?template=${t.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
