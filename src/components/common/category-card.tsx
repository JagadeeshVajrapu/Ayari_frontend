'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { CATEGORY_PLACEHOLDER } from '@/lib/catalog-constants';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  className?: string;
  index?: number;
}

export function CategoryCard({
  title,
  subtitle,
  image,
  href,
  className,
  index = 0,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={cn('group', className)}
    >
      <Link href={href} className="block">
        <div className="relative overflow-hidden rounded-4xl shadow-medium transition-shadow duration-500 group-hover:shadow-premium">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink">
            <SafeImage
              src={image}
              fallback={CATEGORY_PLACEHOLDER}
              alt={`${title} — ${subtitle}`}
              fill
              loading="lazy"
              quality={80}
              sizes="(max-width: 768px) 100vw, 25vw"
              className="image-zoom object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p className="mb-1 text-xs tracking-[0.2em] text-cream/70 uppercase">{subtitle}</p>
            <div className="flex items-end justify-between gap-3">
              <h3 className="font-display text-2xl text-cream md:text-3xl">{title}</h3>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/10 backdrop-blur-sm transition-all duration-500 group-hover:bg-champagne group-hover:text-ink">
                <ArrowUpRight className="h-5 w-5 text-cream transition-colors group-hover:text-ink" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
