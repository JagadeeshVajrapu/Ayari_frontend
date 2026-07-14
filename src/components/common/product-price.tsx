'use client';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/features/shop/stores/shop.store';

interface ProductPriceProps {
  price: number;
  /** M.R.P. (compare-at / original) */
  mrp?: number;
  discountPercent?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Ecommerce price row: selling price + struck-through M.R.P. + % off
 */
export function ProductPrice({
  price,
  mrp,
  discountPercent,
  className,
  size = 'md',
}: ProductPriceProps) {
  const showMrp = Boolean(mrp && mrp > price);
  const off =
    discountPercent ??
    (showMrp && mrp ? Math.round(((mrp - price) / mrp) * 100) : undefined);

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-2 gap-y-0.5',
        size === 'lg' && 'gap-x-3',
        className,
      )}
    >
      <span
        className={cn(
          'font-semibold text-foreground tabular-nums',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base sm:text-lg',
          size === 'lg' && 'text-2xl sm:text-3xl',
        )}
      >
        {formatPrice(price)}
      </span>
      {showMrp && mrp && (
        <>
          <span
            className={cn(
              'text-muted-foreground',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
            )}
          >
            M.R.P:{' '}
            <span className="line-through decoration-muted-foreground/80 tabular-nums">
              {formatPrice(mrp)}
            </span>
          </span>
          {off != null && off > 0 && (
            <span
              className={cn(
                'font-medium text-green-700 dark:text-green-400',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
              )}
            >
              ({off}% off)
            </span>
          )}
        </>
      )}
    </div>
  );
}
