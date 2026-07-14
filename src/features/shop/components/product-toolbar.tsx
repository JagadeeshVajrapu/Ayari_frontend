'use client';

import { motion } from 'framer-motion';
import { Grid3X3, LayoutList, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductFilters } from '@/types/product.types';
import { SORT_OPTIONS } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface ProductToolbarProps {
  filters: ProductFilters;
  totalCount: number;
  activeFilterCount: number;
  onSearch: (search: string) => void;
  onSort: (sort: ProductFilters['sort']) => void;
  onViewChange: (view: ProductFilters['view']) => void;
  onOpenFilters: () => void;
}

export function ProductToolbar({
  filters,
  totalCount,
  activeFilterCount,
  onSearch,
  onSort,
  onViewChange,
  onOpenFilters,
}: ProductToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-display-md text-foreground"
          >
            All Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-sm text-ink-muted"
          >
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
          </motion.p>
        </div>

        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            type="search"
            placeholder="Search products or brands..."
            defaultValue={filters.search}
            key={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-ink">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <select
          value={filters.sort}
          onChange={(e) => onSort(e.target.value as ProductFilters['sort'])}
          className="h-9 rounded-full border border-border bg-surface-elevated px-4 text-xs text-foreground focus:border-champagne/50 focus:outline-none focus:ring-2 focus:ring-champagne/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex rounded-full border border-border p-1">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all',
              filters.view === 'grid'
                ? 'bg-ink text-cream'
                : 'text-ink-muted hover:text-foreground',
            )}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all',
              filters.view === 'list'
                ? 'bg-ink text-cream'
                : 'text-ink-muted hover:text-foreground',
            )}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
