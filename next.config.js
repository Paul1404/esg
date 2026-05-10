/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,

  images: {
    // Image element is only used by the editor previews on uploaded /i/<key>
    // URLs and external user-supplied URLs (logos pasted in by hand). Keep
    // the protocol restricted; we cap actual fetches via the proxy route and
    // re-encode all uploads through sharp.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },

  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ];

    return [
      // Default: security headers everywhere.
      { source: '/:path*', headers: security },

      // Landing page is statically generated; help any CDN cache it for a
      // long time, and tell browsers to revalidate quietly in the background.
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800' },
          ...security,
        ],
      },

      // Public favicon / icons.
      {
        source: '/icon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' }],
      },

      // OpenGraph image: cache aggressively, regenerated on deploys.
      {
        source: '/opengraph-image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800' },
        ],
      },

      // Sitemap and robots: cacheable for a few hours.
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }],
      },
      {
        source: '/robots.txt',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }],
      },

      // Editor: dynamic but not personal; allow short shared cache.
      {
        source: '/editor',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' },
          ...security,
        ],
      },

      // Shared signature pages and image proxy: never indexed, never CDN-cached
      // by default. Image proxy itself sets long Cache-Control inline.
      {
        source: '/s/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          ...security,
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          ...security,
        ],
      },
    ];
  },
};

module.exports = nextConfig;
