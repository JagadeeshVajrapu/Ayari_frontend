'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/common/scroll-reveal';
import { placeholderImage } from '@/lib/placeholder-image';

export function EditorialSection() {
  return (
    <section className="section-padding overflow-hidden bg-ink">
      <div className="container-premium">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-4xl">
                <Image
                  src={placeholderImage('editorial-main', 900, 1125)}
                  alt="Editorial fashion shoot"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="absolute -right-6 -bottom-6 hidden aspect-square w-48 overflow-hidden rounded-3xl border-4 border-ink shadow-premium md:block"
              >
                <Image
                  src={placeholderImage('editorial-detail', 400, 400)}
                  alt="Detail shot"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div>
              <p className="mb-4 text-xs font-medium tracking-[0.25em] text-champagne uppercase">
                The Editorial
              </p>
              <h2 className="font-display text-display-md text-cream">
                Where Art Meets
                <br />
                <span className="text-gradient">Fashion</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-cream/60 md:text-lg">
                Step into our world of curated aesthetics. Each piece is a canvas, each
                collection a narrative — crafted for those who appreciate the extraordinary
                in everyday elegance.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  { label: 'Sustainable', desc: 'Ethically sourced materials' },
                  { label: 'Artisan', desc: 'Hand-finished details' },
                  { label: 'Timeless', desc: 'Beyond seasonal trends' },
                  { label: 'Exclusive', desc: 'Limited edition runs' },
                ].map((item) => (
                  <div key={item.label} className="border-l border-champagne/30 pl-4">
                    <p className="text-sm font-medium text-cream">{item.label}</p>
                    <p className="mt-1 text-xs text-cream/50">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Button variant="champagne" size="lg" className="mt-10" asChild>
                <Link href="/editorial">
                  Read the Story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
