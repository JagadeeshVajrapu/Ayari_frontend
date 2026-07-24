'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HERO_IMAGE } from '@/lib/placeholder-image';

function HeroImage() {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-5xl bg-cream-dark shadow-premium">
      <Image
        src={HERO_IMAGE}
        alt="Handcrafted Ayari décor — mandala plate, candles, and artisan gifts"
        fill
        priority
        quality={75}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep first paint identical on server + client; animate only after mount.
  const enter = (delay = 0) =>
    mounted && !reduceMotion
      ? {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay },
        }
      : {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
        };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-gradient-hero dark:bg-gradient-hero-dark">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-champagne/10 blur-3xl" />
        <div className="absolute bottom-0 -left-1/4 h-[500px] w-[500px] rounded-full bg-champagne-light/15 blur-3xl" />
      </div>

      <div className="container-premium relative flex min-h-[100svh] flex-col justify-center py-16 pb-24 md:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <motion.div {...enter(0.1)}>
              <Badge variant="default" className="mb-6">
                Spring / Summer 2026
              </Badge>
            </motion.div>

            <motion.h1
              {...enter(0.15)}
              className="font-display text-display-xl text-ink"
            >
              Redefine
              <br />
              <span className="text-brand">Elegance</span>
            </motion.h1>

            <motion.p
              {...enter(0.25)}
              className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg"
            >
              Discover a curated world of exceptional craftsmanship. Where timeless design
              meets contemporary sophistication.
            </motion.p>

            <motion.div {...enter(0.35)} className="mt-10 flex flex-wrap gap-4">
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
              {...enter(0.45)}
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

          <motion.div {...enter(0.2)} className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <HeroImage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
