'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/common/scroll-reveal';

import { placeholderImage } from '@/lib/placeholder-image';

const collections = [
  {
    title: 'The Minimalist',
    image: placeholderImage('collection-minimalist'),
    href: '/collections/minimalist',
  },
  {
    title: 'Evening Wear',
    image: placeholderImage('collection-evening'),
    href: '/collections/evening',
  },
  {
    title: 'Urban Essentials',
    image: placeholderImage('collection-urban'),
    href: '/collections/urban',
  },
];

export function CollectionsBanner() {
  return (
    <section className="section-padding bg-cream-dark">
      <div className="container-premium">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-medium tracking-[0.25em] text-champagne-dark uppercase">
              Curated For You
            </p>
            <h2 className="font-display text-display-md text-ink">Seasonal Collections</h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.href}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={collection.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-4xl shadow-medium transition-shadow duration-500 group-hover:shadow-premium">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="image-zoom object-cover"
                  />
                  <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6">
                    <h3 className="font-display text-xl text-cream md:text-2xl">
                      {collection.title}
                    </h3>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/20 backdrop-blur-sm transition-all duration-500 group-hover:bg-champagne">
                      <ArrowUpRight className="h-4 w-4 text-cream group-hover:text-ink" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
