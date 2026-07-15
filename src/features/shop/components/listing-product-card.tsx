'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, GitCompareArrows, Heart, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './star-rating';
import { ProductPrice } from '@/components/common/product-price';
import { useShopStore } from '@/features/shop/stores/shop.store';
import type { ListingProduct } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface ListingProductCardProps {
  product: ListingProduct;
  index: number;
  onQuickView: (product: ListingProduct) => void;
}

export function ListingProductCard({ product, index, onQuickView }: ListingProductCardProps) {
  const { toggleWishlist, isInWishlist, toggleCompare, isInCompare, addToCart } = useShopStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const wished = isInWishlist(product.slug);
  const compared = isInCompare(product.slug);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product.slug);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-3xl bg-cream-dark shadow-soft transition-all duration-500 group-hover:shadow-premium dark:bg-surface">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              loading="lazy"
              quality={75}
              unoptimized={
                product.image.includes('localhost') || product.image.includes('/uploads/')
              }
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="image-zoom object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {product.discountPercent && (
              <span className="absolute top-3 left-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold tracking-wider text-champagne uppercase">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && !product.discountPercent && (
              <Badge className="absolute top-3 left-3">New</Badge>
            )}
            {!product.inStock && (
              <span className="absolute top-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-medium tracking-wider text-cream uppercase backdrop-blur-sm">
                Sold Out
              </span>
            )}
          </div>
        </Link>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => toggleWishlist(product.slug)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full glass transition-all hover:scale-110',
              wished && 'bg-champagne/20',
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4', wished && 'fill-champagne text-champagne')} />
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => toggleCompare(product.slug)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full glass transition-all hover:scale-110',
              compared && 'bg-champagne/20',
            )}
            aria-label="Compare"
          >
            <GitCompareArrows className={cn('h-4 w-4', compared && 'text-champagne')} />
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => onQuickView(product)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass transition-all hover:scale-110"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute right-3 bottom-3 left-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            suppressHydrationWarning
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium tracking-wider uppercase transition-all',
              product.inStock
                ? 'bg-ink text-cream hover:scale-[1.02]'
                : 'cursor-not-allowed bg-muted text-ink-faint',
              addedToCart && 'bg-green-700 text-cream',
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {addedToCart ? 'Added!' : product.inStock ? 'Add to Bag' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 px-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.15em] text-ink-faint uppercase">
            {product.brand}
          </p>
          <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} />
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-base text-foreground transition-colors hover:text-champagne-dark md:text-lg">
            {product.name}
          </h3>
        </Link>
        <ProductPrice
          size="sm"
          price={product.price}
          mrp={product.originalPrice}
          discountPercent={product.discountPercent}
        />
      </div>
    </motion.article>
  );
}
