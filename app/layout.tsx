import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Order tracking · Rovex',
  description:
    'Mobile-first e-commerce order tracking screen covering on-time, delayed, delivered-but-not-received and tracking-unavailable orders.',
  applicationName: 'Rovex order tracking',
  openGraph: {
    title: 'Order tracking · Rovex',
    description:
      'A polished mobile order tracking screen built with Next.js, TypeScript and Tailwind CSS.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f1f5f9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
