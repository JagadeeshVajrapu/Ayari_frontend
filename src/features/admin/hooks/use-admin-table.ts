'use client';

import { useMemo, useState } from 'react';

interface UseAdminTableOptions<T> {
  data: T[];
  searchKeys: (keyof T)[];
  pageSize?: number;
  filterFn?: (item: T, filters: Record<string, string>) => boolean;
}

export function useAdminTable<T>({
  data,
  searchKeys,
  pageSize = 8,
  filterFn,
}: UseAdminTableOptions<T>) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          return val != null && String(val).toLowerCase().includes(q);
        }),
      );
    }

    if (filterFn) {
      result = result.filter((item) => filterFn(item, filters));
    }

    return result;
  }, [data, search, searchKeys, filters, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    search,
    setSearch: handleSearch,
    filters,
    setFilter,
    page: currentPage,
    setPage,
    totalPages,
    totalItems: filtered.length,
    items: paginated,
  };
}
