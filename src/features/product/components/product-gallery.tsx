'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  featuredImages?: string[];
  name: string;
}

const SWIPE_THRESHOLD = 50;

export function ProductGallery({ images, featuredImages = [], name }: ProductGalleryProps) {
  const mainImages = images.length > 0 ? images : featuredImages;
  const gallery = useMemo(() => {
    const seen = new Set<string>();
    const combined: Array<{ url: string; kind: 'product' | 'featured' }> = [];
    for (const url of mainImages) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      combined.push({ url, kind: 'product' });
    }
    for (const url of featuredImages) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      combined.push({ url, kind: 'featured' });
    }
    return combined;
  }, [mainImages, featuredImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goTo = useCallback(
    (index: number) => {
      if (!gallery.length) return;
      setActiveIndex(((index % gallery.length) + gallery.length) % gallery.length);
      setIsZoomed(false);
    },
    [gallery.length],
  );

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [name, images, featuredImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gallery.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gallery.length, prev, next]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gallery.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) next();
      else prev();
    }
    touchStartRef.current = null;
  };

  if (!gallery.length) return null;

  const active = gallery[activeIndex];
  const featuredOnly = gallery.filter((item) => item.kind === 'featured');

  return (
    <div className="space-y-4" role="region" aria-label={`${name} image gallery`}>
      <div
        ref={containerRef}
        className={cn(
          'relative aspect-square max-h-[620px] overflow-hidden rounded-4xl bg-cream-dark shadow-medium sm:aspect-[4/5] dark:bg-surface',
          'max-md:touch-pan-y',
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={`Image ${activeIndex + 1} of ${gallery.length}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.url + activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <SafeImage
              src={active.url}
              alt={`${name} — view ${activeIndex + 1} of ${gallery.length}`}
              fill
              priority={activeIndex === 0}
              quality={85}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                'object-contain transition-transform duration-300 ease-out',
                isZoomed && 'scale-[2] max-md:scale-100',
              )}
              style={
                isZoomed
                  ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                  : undefined
              }
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full glass max-md:hidden">
          <ZoomIn className="h-4 w-4" />
        </div>

        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-3 py-1.5 text-xs font-semibold tabular-nums tracking-wide">
            {activeIndex + 1} / {gallery.length}
          </div>
        )}

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition-transform hover:scale-110 dark:bg-ink/80 dark:text-cream"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition-transform hover:scale-110 dark:bg-ink/80 dark:text-cream"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div
          className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {gallery.map((item, i) => (
            <button
              key={`thumb-${item.url}-${i}`}
              ref={(el) => {
                thumbnailRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-20',
                i === activeIndex
                  ? 'border-foreground opacity-100 shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <SafeImage
                src={item.url}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                loading="lazy"
                quality={70}
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {featuredOnly.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium tracking-[0.15em] text-ink-muted uppercase">
            Featured views
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {featuredOnly.map((item) => {
              const index = gallery.findIndex((g) => g.url === item.url && g.kind === 'featured');
              return (
                <button
                  key={`featured-${item.url}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    'relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-24 sm:w-20',
                    index === activeIndex
                      ? 'border-champagne shadow-glow opacity-100'
                      : 'border-border/60 opacity-75 hover:opacity-100',
                  )}
                >
                  <SafeImage
                    src={item.url}
                    alt={`${name} featured`}
                    fill
                    loading="lazy"
                    quality={70}
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
