import type { Metadata } from 'next';
import { SEO_DEFAULT_IMAGE } from './placeholder-image';

export const SITE_NAME = 'Ayari Creations';
export const SITE_TAGLINE = 'Curated for the Discerning';
export const SITE_DESCRIPTION =
  'Discover meticulously crafted luxury fashion. Premium ecommerce experience with timeless elegance.';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(
  /\/+$/,
  '',
);

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '',
  image = SEO_DEFAULT_IMAGE,
  noIndex = false,
  type = 'website',
}: PageMetadataOptions): Metadata {
  const normalizedPath = path.startsWith('/') ? path : path ? `/${path}` : '';
  const url = `${SITE_URL}${normalizedPath || '/'}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type,
      locale: 'en_IN',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: '/',
  }),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  keywords: [
    'luxury fashion',
    'premium clothing',
    'designer wear',
    'AYARI',
    'India fashion',
    'curated fashion',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'shopping',
};
