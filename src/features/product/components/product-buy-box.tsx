'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Heart, ShoppingBag, Zap, Share2 } from 'lucide-react';
import { StarRating } from '@/features/shop/components/star-rating';
import { formatPrice, useShopStore } from '@/features/shop/stores/shop.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareProduct } from './share-product';
import type { ListingProduct } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface ProductBuyBoxProps {
  product: ListingProduct;
  compact?: boolean;
  onBuyNow?: () => void;
}

export function ProductBuyBox({ product, compact = false, onBuyNow }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? 'One Size');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name ?? '');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useShopStore();
  const wished = isInWishlist(product.slug);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product.slug, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className={cn(!compact && 'space-y-6')}>
      {!compact && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs tracking-[0.2em] text-ink-faint uppercase">
              {product.brand}
            </span>
            {product.isNew && <Badge>New Arrival</Badge>}
            {product.discountPercent && (
              <Badge variant="default">-{product.discountPercent}%</Badge>
            )}
          </div>

          <h1 className="mt-2 font-display text-display-md text-foreground">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} size="md" showValue reviewCount={product.reviewCount} />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold text-foreground sm:text-3xl">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-ink-faint line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-2 w-2 rounded-full',
                product.inStock ? 'bg-green-500' : 'bg-red-400',
              )}
            />
            <span className="text-sm text-ink-muted">
              {product.inStock
                ? `In stock — ${product.stockCount} available`
                : 'Out of stock'}
            </span>
          </div>
        </motion.div>
      )}

      {compact && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-foreground">{product.name}</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            <Heart className={cn('h-4 w-4', wished && 'fill-champagne text-champagne')} />
          </button>
        </div>
      )}

      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">
            Color — <span className="text-foreground">{selectedColor}</span>
          </p>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all hover:scale-110',
                  selectedColor === color.name ? 'border-champagne ring-2 ring-champagne/30' : 'border-border',
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'min-w-[3rem] rounded-xl border px-4 py-2 text-sm transition-all',
                  selectedSize === size
                    ? 'border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink'
                    : 'border-border text-ink-muted hover:border-champagne',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">Qty</p>
        <div className="flex items-center rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-ink-muted hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stockCount || 10, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-ink-muted hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={cn('flex gap-3', compact ? 'flex-row' : 'flex-col sm:flex-row')}>
        <Button
          variant="default"
          size="lg"
          className="flex-1"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
          {addedToCart ? 'Added to Bag!' : 'Add to Cart'}
        </Button>
        <Button
          variant="champagne"
          size="lg"
          className="flex-1"
          disabled={!product.inStock}
          onClick={onBuyNow ?? handleAddToCart}
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </Button>
        {!compact && (
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 shrink-0"
            onClick={() => toggleWishlist(product.slug)}
          >
            <Heart className={cn('h-5 w-5', wished && 'fill-champagne text-champagne')} />
          </Button>
        )}
      </div>

      {!compact && (
        <div className="flex items-center gap-4 border-t border-border/60 pt-4">
          <ShareProduct product={product} />
          <span className="text-xs text-ink-faint">SKU: {product.sku}</span>
        </div>
      )}
    </div>
  );
}
