'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { designTokens } from '@/lib/design-tokens';
import { HERO_IMAGE } from '@/lib/placeholder-image';
import { useClientReady } from '@/hooks/use-client-ready';

function HeroImage() {
  const ready = useClientReady();

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-5xl bg-cream-dark shadow-premium">
      {ready ? (
        <Image
          src={HERO_IMAGE}
          alt="Handcrafted Ayari décor — mandala plate, candles, and artisan gifts"
          fill
          priority
          quality={75}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-cream-dark" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
    </div>
  );
}

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-gradient-hero dark:bg-gradient-hero-dark md:min-h-[100svh]">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <div className="absolute top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-champagne/10 blur-3xl" />
        <div className="absolute bottom-0 -left-1/4 h-[500px] w-[500px] rounded-full bg-champagne-light/15 blur-3xl" />
      </motion.div>

      <div className="container-premium relative flex min-h-[100svh] flex-col justify-center py-16 pb-24 md:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge variant="default" className="mb-6">
                Spring / Summer 2026
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-display-xl text-ink"
            >
              Redefine
              <br />
              <span className="text-brand">Elegance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg"
            >
              Discover a curated world of exceptional craftsmanship. Where timeless design
              meets contemporary sophistication.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Button variant="default" size="lg" asChild>
                <Link href="/shop">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-10 flex gap-6 border-t border-border/60 pt-6 sm:mt-16 sm:gap-10 sm:pt-8"
            >
              {[
                { value: '200+', label: 'Curated Pieces' },
                { value: '48', label: 'Countries' },
                { value: '4.9', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl text-ink sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-[10px] tracking-wider text-ink-faint uppercase sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <HeroImage />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 md:bottom-8 md:block"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-[0.3em] text-ink-faint uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-10 w-px bg-ink/20"
          />
        </div>
      </motion.div>
    </section>
  );
}
