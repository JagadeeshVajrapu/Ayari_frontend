'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import { PriceRangeSlider } from './price-range-slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ProductFilters } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-xs font-medium tracking-[0.15em] text-foreground uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 text-ink-faint transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  onChange: (updates: Partial<ProductFilters>) => void;
  onReset: () => void;
  activeCount: number;
  categories: string[];
  className?: string;
}

export function ProductFiltersPanel({
  filters,
  onChange,
  onReset,
  activeCount,
  categories,
  className,
}: ProductFiltersPanelProps) {
  const toggleCategory = (value: string) => {
    const next = filters.categories.includes(value)
      ? filters.categories.filter((entry) => entry !== value)
      : [...filters.categories, value];
    onChange({ categories: next });
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-foreground">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-champagne-dark transition-colors hover:text-champagne"
          >
            <X className="h-3 w-3" />
            Clear ({activeCount})
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <>
          <FilterSection title="Category">
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-3 text-sm text-ink-muted hover:text-foreground"
                >
                  <Checkbox.Root
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="flex h-4 w-4 items-center justify-center rounded border border-border data-[state=checked]:border-champagne data-[state=checked]:bg-champagne"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3 w-3 text-ink" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  {category}
                </label>
              ))}
            </div>
          </FilterSection>
          <Separator />
        </>
      )}

      <FilterSection title="Price">
        <PriceRangeSlider
          min={filters.priceMin}
          max={filters.priceMax}
          onChange={(priceMin, priceMax) => onChange({ priceMin, priceMax })}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-muted hover:text-foreground">
          <Checkbox.Root
            checked={filters.inStockOnly}
            onCheckedChange={(checked) => onChange({ inStockOnly: checked === true })}
            className="flex h-4 w-4 items-center justify-center rounded border border-border data-[state=checked]:border-champagne data-[state=checked]:bg-champagne"
          >
            <Checkbox.Indicator>
              <Check className="h-3 w-3 text-ink" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          In stock only
        </label>
      </FilterSection>
    </div>
  );
}

interface MobileFiltersProps extends ProductFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFiltersDrawer({ isOpen, onClose, ...props }: MobileFiltersProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto bg-background p-6 shadow-premium lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Filters</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ProductFiltersPanel {...props} />
            <Button className="mt-6 w-full" onClick={onClose}>
              Show Results
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
