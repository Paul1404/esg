import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/editor'],
        // Shared signatures contain personal contact info, and proxied
        // image keys are unguessable per-asset URLs — neither belongs in
        // search indexes.
        disallow: ['/s/', '/i/', '/api/'],
      },
    ],
  };
}
