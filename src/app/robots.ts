import type { MetadataRoute } from 'next';

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return 'http://localhost:3000';
  const stripped = raw.replace(/\/$/, '');
  if (/^https?:\/\//i.test(stripped)) return stripped;
  if (stripped.startsWith('//')) return `https:${stripped}`;
  return `https://${stripped}`;
}

export default function robots(): MetadataRoute.Robots {
  const host = siteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/editor'],
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
