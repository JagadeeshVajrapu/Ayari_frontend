'use client';

import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/features/shop/stores/shop.store';

interface ProductPriceProps {
  /** Discount / selling price */
  price: number;
  /** M.R.P. (compare-at / original) */
  mrp?: number;
  discountPercent?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Stacked layout for product detail — M.R.P. above, sale price below */
  layout?: 'inline' | 'stacked' | 'amazon';
}

/**
 * Ecommerce price: discount price + struck-through M.R.P. + % off
 */
export function ProductPrice({
  price,
  mrp,
  discountPercent,
  className,
  size = 'md',
  layout = 'inline',
}: ProductPriceProps) {
  const showMrp = Boolean(mrp && mrp > price);
  const off =
    discountPercent ??
    (showMrp && mrp ? Math.round(((mrp - price) / mrp) * 100) : undefined);

  if (layout === 'amazon') {
    return (
      <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}>
        {off != null && off > 0 && (
          <span className="inline-flex items-center gap-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-400">
            <TrendingDown className="h-5 w-5" aria-hidden />
            {off}%
          </span>
        )}
        {showMrp && mrp && (
          <span
            className={cn(
              'text-muted-foreground line-through decoration-muted-foreground/80 tabular-nums',
              size === 'lg' ? 'text-xl' : 'text-base',
            )}
          >
            {formatPrice(mrp)}
          </span>
        )}
        <span
          className={cn(
            'font-bold text-foreground tabular-nums',
            size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl',
          )}
        >
          {formatPrice(price)}
        </span>
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={cn('space-y-1', className)}>
        {showMrp && mrp && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className={cn(
                'text-muted-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-sm',
              )}
            >
              M.R.P.:
            </span>
            <span
              className={cn(
                'font-medium text-muted-foreground line-through decoration-red-500/80 decoration-2 tabular-nums',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg',
              )}
            >
              {formatPrice(mrp)}
            </span>
            {off != null && off > 0 && (
              <span
                className={cn(
                  'font-medium text-emerald-700 dark:text-emerald-400',
                  size === 'lg' ? 'text-sm' : 'text-xs',
                )}
              >
                ({off}% off)
              </span>
            )}
          </div>
        )}
        <p
          className={cn(
            'font-bold text-red-600 tabular-nums dark:text-red-500',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-3xl sm:text-4xl',
          )}
        >
          {formatPrice(price)}
        </p>
      </div>
    );
  }

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
          'font-semibold tabular-nums',
          showMrp ? 'text-red-600 dark:text-red-500' : 'text-foreground',
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
            M.R.P.:{' '}
            <span className="line-through decoration-red-500/70 decoration-2 tabular-nums">
              {formatPrice(mrp)}
            </span>
          </span>
          {off != null && off > 0 && (
            <span
              className={cn(
                'font-medium text-emerald-700 dark:text-emerald-400',
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
