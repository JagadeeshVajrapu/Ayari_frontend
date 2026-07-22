'use client';

import { useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { cn } from '@/lib/utils';

/**
 * Build alternate Cloudinary delivery URLs to try before falling back.
 * Versioned URLs sometimes 404 while the unversioned public_id still works.
 */
export function alternateImageUrls(url: string): string[] {
  if (!url || !url.includes('res.cloudinary.com')) return [];
  const alts: string[] = [];
  const withoutVersion = url.replace(/\/upload\/v\d+\//, '/upload/');
  if (withoutVersion !== url) alts.push(withoutVersion);
  return alts;
}

type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string | null | undefined;
  fallback?: string;
};

/**
 * Product/media image that never stays broken in the UI.
 * On load failure: try Cloudinary alternates, then a placeholder.
 */
export function SafeImage({
  src,
  fallback = PRODUCT_PLACEHOLDER,
  alt,
  className,
  quality = 75,
  ...props
}: SafeImageProps) {
  const initial = src?.trim() || fallback;
  const [current, setCurrent] = useState(initial);
  const [tried, setTried] = useState<string[]>([initial]);

  useEffect(() => {
    const next = src?.trim() || fallback;
    setCurrent(next);
    setTried([next]);
  }, [src, fallback]);

  const handleError = () => {
    const alternates = alternateImageUrls(current).filter((url) => !tried.includes(url));
    if (alternates.length) {
      const next = alternates[0];
      setTried((prev) => [...prev, next]);
      setCurrent(next);
      return;
    }
    if (current !== fallback) {
      setTried((prev) => [...prev, fallback]);
      setCurrent(fallback);
    }
  };

  const unoptimized =
    Boolean(props.unoptimized) ||
    current.includes('localhost') ||
    current.includes('/uploads/') ||
    current.includes('placehold.co');

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      quality={quality}
      unoptimized={unoptimized}
      className={cn(className)}
      onError={handleError}
    />
  );
}
