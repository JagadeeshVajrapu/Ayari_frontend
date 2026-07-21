'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Heart } from 'lucide-react';
import { formatPrice, useShopStore } from '@/features/shop/stores/shop.store';
import type { CartLineItem } from '@/features/cart/lib/cart-calculations';
import { cn } from '@/lib/utils';

interface CartItemRowProps {
  item: CartLineItem;
  index: number;
}

export function CartItemRow({ item, index }: CartItemRowProps) {
  const { product, quantity, lineTotal, displayName, image, unitPrice, variantId, stockCount } =
    item;
  const { updateCartQuantity, removeFromCart, moveToWishlist } = useShopStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex gap-4 rounded-3xl border border-border/60 bg-surface-elevated p-4 shadow-soft sm:gap-6 sm:p-5"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-28"
      >
        <Image src={image} alt={displayName} fill className="object-cover" sizes="112px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.15em] text-ink-faint uppercase">{product.brand}</p>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-display text-base text-foreground transition-colors hover:text-champagne-dark sm:text-lg">
                {displayName}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-ink-muted">{formatPrice(unitPrice)} each</p>
          </div>
          <button
            type="button"
            onClick={() => removeFromCart(product.slug, variantId)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-border">
              <button
                type="button"
                onClick={() => updateCartQuantity(product.slug, quantity - 1, variantId)}
                className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  updateCartQuantity(product.slug, Math.min(stockCount, quantity + 1), variantId)
                }
                disabled={quantity >= stockCount}
                className={cn(
                  'flex h-9 w-9 items-center justify-center',
                  quantity >= stockCount ? 'text-ink-faint' : 'text-ink-muted hover:text-foreground',
                )}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => moveToWishlist(product.slug, variantId)}
              className="flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-champagne-dark"
            >
              <Heart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Move to Wishlist</span>
            </button>
          </div>

          <p className="text-base font-semibold text-foreground">{formatPrice(lineTotal)}</p>
        </div>
      </div>
    </motion.div>
  );
}
