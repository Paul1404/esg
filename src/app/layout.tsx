import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const SITE_NAME = 'ESG';
const SITE_TAGLINE = 'Free Email Signature Generator';
const SITE_TITLE = 'Free Email Signature Generator for Outlook, Gmail, Apple Mail';
const SITE_DESCRIPTION =
  'Free email signature generator. Build HTML signatures that render correctly in Outlook, Gmail, Apple Mail, and dark mode. No login. Eleven templates. Open source.';

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return 'http://localhost:3000';
  const stripped = raw.replace(/\/$/, '');
  if (/^https?:\/\//i.test(stripped)) return stripped;
  if (stripped.startsWith('//')) return `https:${stripped}`;
  return `https://${stripped}`;
}

const SITE_URL = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'email signature generator',
    'free email signature',
    'html email signature',
    'outlook signature',
    'gmail signature',
    'apple mail signature',
    'signature template',
    'corporate email signature',
    'professional email signature',
    'open source email signature',
  ],
  authors: [{ name: 'ESG' }],
  creator: 'ESG',
  publisher: 'ESG',
  category: 'productivity',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d12',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  alternateName: SITE_TAGLINE,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'EmailSignatureGenerator',
  operatingSystem: 'Any',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Eleven cross-client HTML templates',
    'Live multi-client preview',
    'Outlook, Gmail, Apple Mail support',
    'Dark mode aware',
    'Rich text and HTML export',
    'vCard download',
    'No account required',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
