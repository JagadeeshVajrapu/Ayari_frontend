'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProductFilters } from '@/features/shop/hooks/use-product-filters';
import { ProductToolbar } from './product-toolbar';
import { ProductFiltersPanel, MobileFiltersDrawer } from './product-filters';
import { ListingProductCard } from './listing-product-card';
import { ListingProductRow } from './listing-product-row';
import { QuickViewModal } from './quick-view-modal';
import { CompareBar } from './compare-bar';
import { Pagination } from './pagination';
import { ProductGridSkeleton } from './product-skeleton';
import { EmptyState } from './empty-state';
import type { ListingProduct } from '@/types/product.types';

export function ProductListing() {
  const {
    filters,
    setFilters,
    resetFilters,
    products,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    activeFilterCount,
    categoryOptions,
    selectedCategoryLabel,
    fetchError,
  } = useProductFilters();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ListingProduct | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback(
    (search: string) => {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => setFilters({ search }), 300);
    },
    [setFilters],
  );

  return (
    <div className="section-padding pt-8">
      <div className="container-premium">
        <ProductToolbar
          filters={filters}
          totalCount={totalCount}
          activeFilterCount={activeFilterCount}
          categoryLabel={selectedCategoryLabel}
          onSearch={handleSearch}
          onSort={(sort) => setFilters({ sort })}
          onViewChange={(view) => setFilters({ view })}
          onOpenFilters={() => setMobileFiltersOpen(true)}
        />

        {fetchError && (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {fetchError}
          </p>
        )}

        <div className="mt-10 flex gap-10">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-32 rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft">
              <ProductFiltersPanel
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                activeCount={activeFilterCount}
                categories={categoryOptions}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <ProductGridSkeleton count={12} view={filters.view} />
            ) : products.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {filters.view === 'grid' ? (
                    <div
                      key="grid"
                      className="grid grid-cols-2 gap-5 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
                    >
                      {products.map((product, index) => (
                        <ListingProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onQuickView={setQuickViewProduct}
                        />
                      ))}
                    </div>
                  ) : (
                    <div key="list" className="space-y-4">
                      {products.map((product, index) => (
                        <ListingProductRow
                          key={product.id}
                          product={product}
                          index={index}
                          onQuickView={setQuickViewProduct}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilters({ page })}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFiltersDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        activeCount={activeFilterCount}
        categories={categoryOptions}
      />

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <CompareBar />
    </div>
  );
}
