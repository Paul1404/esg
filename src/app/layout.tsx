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

export const metadata: Metadata = {
  title: {
    default: 'ESG — Email Signature Generator',
    template: '%s · ESG',
  },
  description:
    'Build pixel-perfect, cross-client email signatures. Templates that survive Outlook, Gmail, Apple Mail, and dark mode.',
  applicationName: 'ESG',
  authors: [{ name: 'ESG' }],
  openGraph: {
    title: 'ESG — Email Signature Generator',
    description: 'Pixel-perfect signatures for Outlook, Gmail, and Apple Mail.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg text-text font-sans antialiased">{children}</body>
    </html>
  );
}
