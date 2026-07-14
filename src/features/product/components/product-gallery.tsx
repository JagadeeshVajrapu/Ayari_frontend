'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const SWIPE_THRESHOLD = 50;

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % images.length) + images.length) % images.length);
      setIsZoomed(false);
    },
    [images.length],
  );

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
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
  }, [images.length, prev, next]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeIndex]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || images.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) next();
      else prev();
    }
    touchStartRef.current = null;
  };

  if (!images.length) return null;

  return (
    <div className="space-y-4" role="region" aria-label={`${name} image gallery`}>
      <div
        ref={containerRef}
        className={cn(
          'relative aspect-[3/4] overflow-hidden rounded-4xl bg-cream-dark shadow-medium dark:bg-surface',
          'max-md:touch-pan-y',
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={`Image ${activeIndex + 1} of ${images.length}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} — view ${activeIndex + 1} of ${images.length}`}
              fill
              priority={activeIndex === 0}
              quality={75}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                'object-cover transition-transform duration-300 ease-out',
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

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-3 py-1 text-xs font-medium tabular-nums">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass transition-transform hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full glass transition-transform hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              ref={(el) => {
                thumbnailRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-24 sm:w-20',
                i === activeIndex
                  ? 'border-champagne shadow-glow opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                loading="lazy"
                quality={60}
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
