import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const host = siteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/editor', '/templates', '/templates/', '/guides', '/guides/'],
        disallow: ['/s/', '/i/', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'PerplexityBot', 'Bytespider'],
        disallow: ['/'],
      },
      {
        userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'PetalBot'],
        disallow: ['/'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
