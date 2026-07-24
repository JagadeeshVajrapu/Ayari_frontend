'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { height: 44, width: 172 },
  md: { height: 56, width: 218 },
  lg: { height: 68, width: 265 },
  xl: { height: 80, width: 312 },
} as const;

const LOGO = {
  light: '/images/ayari-logo-light-bg.png',
  dark: '/images/ayari-logo-dark-bg.png',
} as const;

export type BrandLogoTone = 'auto' | 'light' | 'dark';

interface BrandLogoProps {
  href?: string;
  size?: keyof typeof SIZES;
  tone?: BrandLogoTone;
  className?: string;
  priority?: boolean;
}

function resolveLogoSrc(tone: BrandLogoTone, isDarkTheme: boolean) {
  if (tone === 'light') return LOGO.light;
  if (tone === 'dark') return LOGO.dark;
  return isDarkTheme ? LOGO.dark : LOGO.light;
}

export function BrandLogo({
  href = '/',
  size = 'md',
  tone = 'auto',
  className,
  priority = false,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dim = SIZES[size];
  const isDarkTheme = mounted && resolvedTheme === 'dark';
  const src = resolveLogoSrc(tone, isDarkTheme);

  const image = (
    <Image
      key={src}
      src={src}
      alt="Ayari Creations"
      width={dim.width}
      height={dim.height}
      priority={priority}
      className={cn(
        'block object-contain object-left',
        'drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]',
        className,
      )}
      style={{ width: 'auto', height: dim.height }}
    />
  );

  if (!href) {
    return <span className="inline-flex items-center">{image}</span>;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center transition-opacity duration-300 hover:opacity-90"
      aria-label="Ayari Creations — Home"
    >
      {image}
    </Link>
  );
}
