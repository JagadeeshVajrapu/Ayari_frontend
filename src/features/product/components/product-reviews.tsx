'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { StarRating } from '@/features/shop/components/star-rating';
import type { ProductReview } from '@/types/product.types';
import type { ListingProduct } from '@/types/product.types';

interface ProductReviewsProps {
  product: ListingProduct;
  reviews: ProductReview[];
}

export function ProductReviews({ product, reviews }: ProductReviewsProps) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    percent: star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : 3,
  }));

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="lg:w-64 shrink-0">
          <h2 className="font-display text-2xl text-foreground">Customer Reviews</h2>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-5xl text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-ink-muted">/ 5</span>
          </div>
          <StarRating rating={product.rating} size="md" className="mt-2" />
          <p className="mt-1 text-sm text-ink-muted">{product.reviewCount} reviews</p>

          <div className="mt-6 space-y-2">
            {distribution.map(({ star, percent }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-ink-muted">{star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                    className="h-full rounded-full bg-champagne"
                  />
                </div>
                <span className="w-8 text-ink-faint">{percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {reviews.map((review, i) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{review.author}</span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-champagne-dark dark:text-champagne">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} className="mt-1" />
                  <h4 className="mt-2 text-sm font-medium text-foreground">{review.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{review.comment}</p>
                  <p className="mt-2 text-xs text-ink-faint">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
