'use client';

import { useEffect, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { PRICE_RANGE } from '@/lib/catalog-constants';
import { cn } from '@/lib/utils';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

const STEP = 100;

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

function snap(value: number) {
  return Math.round(value / STEP) * STEP;
}

export function PriceRangeSlider({ min, max, onChange }: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

  const commit = (nextMin: number, nextMax: number) => {
    let safeMin = snap(clamp(nextMin, PRICE_RANGE.min, PRICE_RANGE.max));
    let safeMax = snap(clamp(nextMax, PRICE_RANGE.min, PRICE_RANGE.max));
    if (safeMin > safeMax) {
      // Keep the adjusted handle valid relative to the other bound
      if (nextMin !== min) safeMin = safeMax;
      else safeMax = safeMin;
    }
    setLocalMin(safeMin);
    setLocalMax(safeMax);
    onChange(safeMin, safeMax);
  };

  const nudgeMin = (delta: number) => commit(localMin + delta, localMax);
  const nudgeMax = (delta: number) => commit(localMin, localMax + delta);

  return (
    <div className="space-y-4">
      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center select-none"
        min={PRICE_RANGE.min}
        max={PRICE_RANGE.max}
        step={STEP}
        minStepsBetweenThumbs={1}
        value={[localMin, localMax]}
        onValueChange={([newMin, newMax]) => {
          setLocalMin(newMin);
          setLocalMax(newMax);
        }}
        onValueCommit={([newMin, newMax]) => commit(newMin, newMax)}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-border">
          <Slider.Range className="absolute h-full rounded-full bg-brand" />
        </Slider.Track>
        <Slider.Thumb
          aria-label="Minimum price"
          className="block h-5 w-5 rounded-full border-2 border-brand bg-surface-elevated shadow-soft transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <Slider.Thumb
          aria-label="Maximum price"
          className="block h-5 w-5 rounded-full border-2 border-brand bg-surface-elevated shadow-soft transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </Slider.Root>

      <div className="grid grid-cols-2 gap-3">
        <PriceStepper
          label="Min"
          value={localMin}
          onDecrement={() => nudgeMin(-STEP)}
          onIncrement={() => nudgeMin(STEP)}
          onCommit={(value) => commit(value, localMax)}
          disableDecrement={localMin <= PRICE_RANGE.min}
          disableIncrement={localMin + STEP > localMax}
        />
        <PriceStepper
          label="Max"
          value={localMax}
          onDecrement={() => nudgeMax(-STEP)}
          onIncrement={() => nudgeMax(STEP)}
          onCommit={(value) => commit(localMin, value)}
          disableDecrement={localMax - STEP < localMin}
          disableIncrement={localMax >= PRICE_RANGE.max}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>{formatPrice(localMin)}</span>
        <span>{formatPrice(localMax)}</span>
      </div>
    </div>
  );
}

function PriceStepper({
  label,
  value,
  onDecrement,
  onIncrement,
  onCommit,
  disableDecrement,
  disableIncrement,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onCommit: (value: number) => void;
  disableDecrement?: boolean;
  disableIncrement?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium tracking-[0.14em] text-ink-faint uppercase">
        {label}
      </p>
      <div className="flex items-center overflow-hidden rounded-xl border border-border/70 bg-background" suppressHydrationWarning>
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()} price`}
          disabled={disableDecrement}
          onClick={onDecrement}
          suppressHydrationWarning
          className={cn(
            'flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:bg-muted hover:text-foreground',
            disableDecrement && 'cursor-not-allowed opacity-40',
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={STEP}
          value={value}
          suppressHydrationWarning
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onCommit(next);
          }}
          className="h-9 w-full min-w-0 border-x border-border/70 bg-transparent px-1 text-center text-xs font-medium text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={`${label} price`}
        />
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()} price`}
          disabled={disableIncrement}
          onClick={onIncrement}
          suppressHydrationWarning
          className={cn(
            'flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:bg-muted hover:text-foreground',
            disableIncrement && 'cursor-not-allowed opacity-40',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
