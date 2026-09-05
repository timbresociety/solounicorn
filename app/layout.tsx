import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import PwaRegistration from './pwa-registration';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://one-person-unicorn.pastel-bread-2235.chatgpt.site'),
  title: 'ONE PERSON UNICORN — Build the company. Survive the machine.',
  description: 'A deterministic startup roguelite about scaling a one-person AI company to a $1B valuation.',
  applicationName: 'ONE PERSON UNICORN',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: {
    title: 'ONE PERSON UNICORN',
    description: 'Build the company. Survive the machine. Reach a $1B valuation.',
    images: [{ url: '/og.png', width: 1440, height: 900, alt: 'A monumental pastel ethereal environment' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ONE PERSON UNICORN',
    description: 'Build the company. Survive the machine. Reach a $1B valuation.',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#050607',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}><PwaRegistration />{children}</body></html>;
}
