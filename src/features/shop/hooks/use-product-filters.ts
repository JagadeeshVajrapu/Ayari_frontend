'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ListingProduct, ProductFilters, SortOption, ViewMode } from '@/types/product.types';
import { PAGE_SIZE } from '@/types/product.types';
import { PRICE_RANGE } from '@/lib/catalog-constants';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';

export interface ShopCategoryOption {
  name: string;
  slug: string;
}

function parseFilters(params: URLSearchParams): ProductFilters {
  return {
    search: params.get('q') ?? '',
    categories: params.get('categories')?.split(',').filter(Boolean) ?? [],
    brands: [],
    priceMin: Number(params.get('priceMin')) || PRICE_RANGE.min,
    priceMax: Number(params.get('priceMax')) || PRICE_RANGE.max,
    minRating: Number(params.get('rating')) || 0,
    inStockOnly: params.get('inStock') === 'true',
    featuredOnly: params.get('featured') === 'true',
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
  if (filters.minRating > 0) params.set('rating', String(filters.minRating));
  if (filters.inStockOnly) params.set('inStock', 'true');
  if (filters.featuredOnly) params.set('featured', 'true');
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
  const [categoryOptions, setCategoryOptions] = useState<ShopCategoryOption[]>([]);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const currentPage = Math.min(filters.page, totalPages);

  useEffect(() => {
    catalogService
      .getCategories()
      .then(({ data }) =>
        setCategoryOptions(
          data.data.categories.map((category) => ({
            name: category.name,
            slug: category.slug,
          })),
        ),
      )
      .catch(() => setCategoryOptions([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setFetchError('');

    const requiresClientCollection = filters.minRating > 0 || filters.sort === 'rating';

    catalogService
      .getProducts({
        page: requiresClientCollection ? 1 : filters.page,
        limit: requiresClientCollection ? 1000 : PAGE_SIZE,
        search: filters.search || undefined,
        categories: filters.categories.length ? filters.categories : undefined,
        featured: filters.featuredOnly || undefined,
        inStock: filters.inStockOnly || undefined,
        priceMin: filters.priceMin > PRICE_RANGE.min ? filters.priceMin : undefined,
        priceMax: filters.priceMax < PRICE_RANGE.max ? filters.priceMax : undefined,
        sort: filters.sort === 'rating' ? 'featured' : filters.sort,
      })
      .then(({ data }) => {
        if (cancelled) return;

        let items = data.data.items.map(mapApiProductToListing);
        if (filters.minRating > 0) {
          items = items.filter((product) => product.rating >= filters.minRating);
        }
        if (filters.sort === 'rating') {
          items.sort((left, right) => right.rating - left.rating);
        }

        if (requiresClientCollection) {
          const total = items.length;
          const pageItems = items.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);
          setProducts(pageItems);
          setTotalCount(total);
          setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
        } else {
          setProducts(items);
          setTotalCount(data.data.pagination.total);
          setTotalPages(Math.max(1, data.data.pagination.totalPages));
        }
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
    if (filters.minRating > 0) count++;
    if (filters.inStockOnly) count++;
    if (filters.featuredOnly) count++;
    return count;
  }, [filters]);

  const selectedCategoryLabel = useMemo(() => {
    if (filters.categories.length !== 1) return null;
    const selected = filters.categories[0];
    return (
      categoryOptions.find((category) => category.slug === selected || category.name === selected)
        ?.name ?? selected
    );
  }, [categoryOptions, filters.categories]);

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
    categoryOptions,
    selectedCategoryLabel,
  };
}
