'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Heart, ShoppingBag, Zap } from 'lucide-react';
import { StarRating } from '@/features/shop/components/star-rating';
import { useShopStore } from '@/features/shop/stores/shop.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductPrice } from '@/components/common/product-price';
import { ProductVariationSelectors } from './product-variation-selectors';
import { ShareProduct } from './share-product';
import type { ProductVariationState } from '@/features/product/hooks/use-product-variations';
import type { ListingProduct } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface ProductBuyBoxProps {
  product: ListingProduct;
  variation: ProductVariationState;
  compact?: boolean;
  onBuyNow?: () => void;
}

export function ProductBuyBox({ product, variation, compact = false, onBuyNow }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useShopStore();
  const wished = isInWishlist(product.slug);

  const {
    displayTitle,
    activePrice,
    activeMrp,
    discountPercent,
    activeSku,
    activeStock,
    inStock,
    selectedColorId,
    selectedSetId,
    selectedVariantId,
    setSelectedColor,
    setSelectedSet,
  } = variation;

  const maxQty = Math.max(1, activeStock || 1);

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product.slug, quantity, selectedVariantId ?? undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const hasVariations =
    (product.variants?.length ?? 0) > 0 ||
    (product.colorVariants?.length ?? 0) > 0 ||
    (product.setVariants?.length ?? 0) > 0;

  return (
    <div className={cn(!compact && 'space-y-6')}>
      {!compact && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs tracking-[0.2em] text-ink-faint uppercase">
              {product.brand}
            </span>
            {product.isNew && <Badge>New Arrival</Badge>}
            {discountPercent != null && discountPercent > 0 && (
              <Badge variant="default">{discountPercent}% off</Badge>
            )}
          </div>

          <h1 className="mt-2 font-display text-display-md text-foreground">{displayTitle}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} size="md" showValue reviewCount={product.reviewCount} />
          </div>

          <ProductPrice
            className="mt-5"
            size="lg"
            layout="amazon"
            price={activePrice}
            mrp={activeMrp}
            discountPercent={discountPercent}
          />

          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-2 w-2 rounded-full',
                inStock ? 'bg-green-500' : 'bg-red-400',
              )}
            />
            <span className="text-sm text-ink-muted">
              {inStock ? `In stock — ${activeStock} available` : 'Out of stock'}
            </span>
          </div>
        </motion.div>
      )}

      {compact && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-foreground">{displayTitle}</p>
            <ProductPrice
              size="sm"
              layout="amazon"
              price={activePrice}
              mrp={activeMrp}
              discountPercent={discountPercent}
            />
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border"
          >
            <Heart className={cn('h-4 w-4', wished && 'fill-champagne text-champagne')} />
          </button>
        </div>
      )}

      {hasVariations && !compact && (
        <ProductVariationSelectors
          basePrice={product.price}
          baseMrp={product.originalPrice}
          colorVariants={product.colorVariants}
          setVariants={product.setVariants}
          selectedColorId={selectedColorId}
          selectedSetId={selectedSetId}
          onColorChange={setSelectedColor}
          onSetChange={setSelectedSet}
        />
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">Qty</p>
        <div className="flex items-center rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-ink-muted hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-ink-muted hover:text-foreground"
            aria-label="Increase quantity"
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
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
          {addedToCart ? 'Added to Bag!' : 'Add to Cart'}
        </Button>
        <Button
          variant="champagne"
          size="lg"
          className="flex-1"
          disabled={!inStock}
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
          <span className="text-xs text-ink-faint">SKU: {activeSku}</span>
        </div>
      )}
    </div>
  );
}
