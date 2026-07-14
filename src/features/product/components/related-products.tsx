'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ListingProductCard } from '@/features/shop/components/listing-product-card';
import type { ListingProduct } from '@/types/product.types';

interface RelatedProductsProps {
  products: ListingProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.25em] text-champagne-dark uppercase dark:text-champagne">
            You May Also Like
          </p>
          <h2 className="mt-2 font-display text-display-md text-foreground">Related Products</h2>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-sm text-ink-muted transition-colors hover:text-foreground sm:flex"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
        {products.map((product, index) => (
          <ListingProductCard
            key={product.id}
            product={product}
            index={index}
            onQuickView={() => {}}
          />
        ))}
      </div>
    </section>
  );
}
