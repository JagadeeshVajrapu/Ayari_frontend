'use client';

import * as Slider from '@radix-ui/react-slider';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { PRICE_RANGE } from '@/lib/catalog-constants';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export function PriceRangeSlider({ min, max, onChange }: PriceRangeSliderProps) {
  return (
    <div className="space-y-4">
      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center select-none"
        min={PRICE_RANGE.min}
        max={PRICE_RANGE.max}
        step={1000}
        value={[min, max]}
        onValueChange={([newMin, newMax]) => onChange(newMin, newMax)}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-border">
          <Slider.Range className="absolute h-full rounded-full bg-champagne" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-champagne bg-surface-elevated shadow-soft transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-champagne/30" />
        <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-champagne bg-surface-elevated shadow-soft transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-champagne/30" />
      </Slider.Root>
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}
