import type { Metadata, Viewport } from 'next';
import { fontClassNames } from './fonts';
import { Providers } from './providers';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { SkipToContent } from '@/components/a11y/SkipToContent';
import { site } from '@/content/data/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1018',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <SkipToContent />
          <Nav />
          <main id="content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
