'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
