import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Providers } from '@/providers/theme-provider';
import { SkipToContent } from '@/components/a11y/skip-to-content';
import { JsonLd } from '@/components/seo/json-ld';
import { AppShell } from '@/components/layout/app-shell';
import { ChunkLoadErrorRecovery } from '@/components/system/chunk-load-error-recovery';
import { organizationJsonLd, websiteJsonLd } from '@/lib/structured-data';
import { rootMetadata } from '@/lib/seo';
import '@/styles/globals.css';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SkipToContent />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Providers>
          <ChunkLoadErrorRecovery />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
