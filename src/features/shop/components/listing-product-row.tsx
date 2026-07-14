'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, GitCompareArrows, Heart, ShoppingBag } from 'lucide-react';
import { StarRating } from './star-rating';
import { formatPrice, useShopStore } from '@/features/shop/stores/shop.store';
import type { ListingProduct } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface ListingProductRowProps {
  product: ListingProduct;
  index: number;
  onQuickView: (product: ListingProduct) => void;
}

export function ListingProductRow({ product, index, onQuickView }: ListingProductRowProps) {
  const { toggleWishlist, isInWishlist, toggleCompare, isInCompare, addToCart } = useShopStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const wished = isInWishlist(product.slug);
  const compared = isInCompare(product.slug);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product.slug);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group flex gap-4 rounded-3xl border border-border/60 bg-surface-elevated p-4 transition-all duration-500 hover:border-champagne/30 hover:shadow-medium sm:gap-6 sm:p-5"
    >
      <Link href={`/products/${product.slug}`} className="relative h-36 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-44 sm:w-36">
        <Image src={product.image} alt={product.name} fill className="image-zoom object-cover" sizes="144px" />
        {product.discountPercent && (
          <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold text-champagne">
            -{product.discountPercent}%
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-[0.15em] text-ink-faint uppercase">
              {product.category} · {product.brand}
            </span>
            {!product.inStock && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                Out of Stock
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="mt-1 font-display text-lg text-foreground transition-colors hover:text-champagne-dark sm:text-xl">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted sm:text-sm">{product.description}</p>
          <div className="mt-2">
            <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-foreground sm:text-lg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-ink-faint">
                  M.R.P: <span className="line-through">{formatPrice(product.originalPrice)}</span>
                </span>
                {product.discountPercent != null && (
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    ({product.discountPercent}% off)
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleWishlist(product.slug)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-border transition-all hover:border-champagne',
                wished && 'border-champagne bg-champagne/10',
              )}
              aria-label="Wishlist"
            >
              <Heart className={cn('h-4 w-4', wished && 'fill-champagne text-champagne')} />
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(product.slug)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-border transition-all hover:border-champagne',
                compared && 'border-champagne bg-champagne/10',
              )}
              aria-label="Compare"
            >
              <GitCompareArrows className={cn('h-4 w-4', compared && 'text-champagne')} />
            </button>
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-all hover:border-champagne"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-wider uppercase transition-all',
                product.inStock
                  ? 'bg-ink text-cream hover:scale-[1.02]'
                  : 'cursor-not-allowed bg-muted text-ink-faint',
                addedToCart && 'bg-green-700',
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {addedToCart ? 'Added' : 'Add to Bag'}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
