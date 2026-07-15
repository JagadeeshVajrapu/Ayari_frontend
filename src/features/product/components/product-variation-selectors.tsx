'use client';

import { useState } from 'react';
import { formatPrice } from '@/features/shop/stores/shop.store';
import type { ColorVariant, SetVariant } from '@/lib/product-variations';
import {
  resolveColorImage,
  resolveVariantPrice,
} from '@/lib/product-variations';
import { cn } from '@/lib/utils';

interface ProductVariationSelectorsProps {
  basePrice: number;
  baseMrp?: number;
  colorVariants?: ColorVariant[];
  setVariants?: SetVariant[];
  selectedColorId: string | null;
  selectedSetId: string | null;
  onColorChange: (id: string | null) => void;
  onSetChange: (id: string | null) => void;
}

function ColorSwatchImage({
  color,
  image,
}: {
  color: ColorVariant;
  image: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(color.imageUrl) && !failed;

  if (!showImage) {
    return (
      <div
        className="absolute inset-0"
        style={{ backgroundColor: color.hex ?? '#d4d4d4' }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={color.name}
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function MiniPrice({
  price,
  mrp,
  className,
}: {
  price: number;
  mrp?: number;
  className?: string;
}) {
  const showMrp = Boolean(mrp && mrp > price);
  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="text-xs font-semibold text-foreground tabular-nums">{formatPrice(price)}</p>
      {showMrp && mrp && (
        <p className="text-[10px] text-muted-foreground line-through decoration-red-500/70 tabular-nums">
          {formatPrice(mrp)}
        </p>
      )}
    </div>
  );
}

export function ProductVariationSelectors({
  basePrice,
  baseMrp,
  colorVariants = [],
  setVariants = [],
  selectedColorId,
  selectedSetId,
  onColorChange,
  onSetChange,
}: ProductVariationSelectorsProps) {
  const selectedColor = colorVariants.find((c) => c.id === selectedColorId);

  return (
    <div className="space-y-5">
      {colorVariants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Color:</span>{' '}
            <span className="text-ink-muted">{selectedColor?.name ?? 'Select'}</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {colorVariants.map((color) => {
              const { price, mrp } = resolveVariantPrice(basePrice, baseMrp, color, null);
              const image = resolveColorImage(color.imageUrl);
              const selected = selectedColorId === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorChange(color.id)}
                  className={cn(
                    'flex flex-col overflow-hidden rounded-lg border-2 bg-background text-left transition-all hover:border-blue-400',
                    selected
                      ? 'border-blue-600 ring-1 ring-blue-600/30'
                      : 'border-border',
                  )}
                >
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    <ColorSwatchImage color={color} image={image} />
                  </div>
                  <div className="border-t border-border/60 p-2">
                    <p className="truncate text-[11px] font-medium text-foreground">{color.name}</p>
                    <MiniPrice price={price} mrp={mrp} className="mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {setVariants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Set / Pack:</span>{' '}
            <span className="text-ink-muted">
              {setVariants.find((s) => s.id === selectedSetId)?.name ?? 'Select'}
            </span>
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {setVariants.map((set) => {
              const { price, mrp } = resolveVariantPrice(
                basePrice,
                baseMrp,
                selectedColor,
                set,
              );
              const selected = selectedSetId === set.id;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => onSetChange(set.id)}
                  className={cn(
                    'rounded-lg border-2 px-3 py-3 text-left transition-all hover:border-blue-400',
                    selected
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600/30 dark:bg-blue-950/40'
                      : 'border-border bg-background',
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{set.name}</p>
                  {set.label && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{set.label}</p>
                  )}
                  <MiniPrice price={price} mrp={mrp} className="mt-2" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
