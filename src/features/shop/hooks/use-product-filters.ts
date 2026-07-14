'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ListingProduct, ProductFilters, SortOption, ViewMode } from '@/types/product.types';
import { DEFAULT_FILTERS, PAGE_SIZE } from '@/types/product.types';
import { PRICE_RANGE } from '@/lib/catalog-constants';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';

function parseFilters(params: URLSearchParams): ProductFilters {
  return {
    search: params.get('q') ?? '',
    categories: params.get('categories')?.split(',').filter(Boolean) ?? [],
    brands: [],
    priceMin: Number(params.get('priceMin')) || PRICE_RANGE.min,
    priceMax: Number(params.get('priceMax')) || PRICE_RANGE.max,
    minRating: 0,
    inStockOnly: params.get('inStock') === 'true',
    sort: (params.get('sort') as SortOption) || 'featured',
    page: Number(params.get('page')) || 1,
    view: (params.get('view') as ViewMode) || 'grid',
  };
}

function filtersToParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('q', filters.search);
  if (filters.categories.length) params.set('categories', filters.categories.join(','));
  if (filters.priceMin > PRICE_RANGE.min) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax < PRICE_RANGE.max) params.set('priceMax', String(filters.priceMax));
  if (filters.inStockOnly) params.set('inStock', 'true');
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.view !== 'grid') params.set('view', filters.view);
  return params;
}

export function useProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<ListingProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const currentPage = Math.min(filters.page, totalPages);

  useEffect(() => {
    catalogService
      .getCategories()
      .then(({ data }) => setAvailableCategories(data.data.categories.map((category) => category.name)))
      .catch(() => setAvailableCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setFetchError('');

    const categoryParam = filters.categories.length === 1 ? filters.categories[0] : undefined;

    catalogService
      .getProducts({
        page: filters.page,
        limit: PAGE_SIZE,
        search: filters.search || undefined,
        category: categoryParam,
        inStock: filters.inStockOnly || undefined,
        priceMin: filters.priceMin > PRICE_RANGE.min ? filters.priceMin : undefined,
        priceMax: filters.priceMax < PRICE_RANGE.max ? filters.priceMax : undefined,
        sort: filters.sort,
      })
      .then(({ data }) => {
        if (cancelled) return;

        let items = data.data.items.map(mapApiProductToListing);
        if (filters.categories.length > 1) {
          items = items.filter((product) => filters.categories.includes(product.category));
        }

        setProducts(items);
        setTotalCount(data.data.pagination.total);
        setTotalPages(Math.max(1, data.data.pagination.totalPages));
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
          setFetchError('Unable to load products. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const setFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      const next = { ...filters, ...updates };
      if (!('page' in updates)) next.page = 1;
      const params = filtersToParams(next);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, router, pathname],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length) count += filters.categories.length;
    if (filters.priceMin > PRICE_RANGE.min || filters.priceMax < PRICE_RANGE.max) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    resetFilters,
    products,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    fetchError,
    activeFilterCount,
    availableCategories,
  };
}
