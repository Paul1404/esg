import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESG — Email Signature Generator',
  description:
    'Build pixel-perfect, cross-client email signatures. Templates that survive Outlook, Gmail, Apple Mail, and dark mode.',
  applicationName: 'ESG',
  authors: [{ name: 'ESG' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-text font-sans antialiased">{children}</body>
    </html>
  );
}
