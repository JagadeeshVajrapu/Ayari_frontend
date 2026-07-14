import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({
  rating,
  size = 'sm',
  showValue = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.floor(rating)
                ? 'fill-champagne text-champagne'
                : i < rating
                  ? 'fill-champagne/50 text-champagne'
                  : 'fill-none text-border',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-ink-muted">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-ink-faint"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
}
