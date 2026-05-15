import type { Metadata, Viewport } from 'next';
import { fontClassNames } from './fonts';
import { Providers } from './providers';
import { Nav } from '@/components/ui/Nav';
import { Footer } from '@/components/ui/Footer';
import { SceneMount } from '@/components/scene/SceneMount';
import { SkipToContent } from '@/components/a11y/SkipToContent';
import { site } from '@/content/data/site';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
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
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ['/og/default.png'],
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
      <head>
        <noscript>
          <style>{`
            [style*="opacity:0;"], [style*="opacity: 0;"],
            [style$="opacity:0"], [style$="opacity: 0"] { opacity: 1 !important; }
            [style*="transform:"] { transform: none !important; }
            [style*="clip-path:"] { clip-path: none !important; }
          `}</style>
        </noscript>
      </head>
      <body className="font-sans">
        <Providers>
          <SkipToContent />
          <SceneMount />
          <Nav />
          <main id="content" className="relative z-10">
            {children}
          </main>
          <Footer />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
