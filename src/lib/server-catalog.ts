import { mapApiProductToListing, type ApiCategory, type ApiProduct } from '@/lib/catalog-mappers';
import type { ListingProduct } from '@/types/product.types';
import type { SortOption } from '@/types/product.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface CatalogListResponse {
  items: ListingProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed: ${response.status}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
}): Promise<CatalogListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.inStock) searchParams.set('inStock', 'true');
  if (params?.priceMin !== undefined) searchParams.set('priceMin', String(params.priceMin));
  if (params?.priceMax !== undefined) searchParams.set('priceMax', String(params.priceMax));
  if (params?.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  const data = await fetchJson<{ items: ApiProduct[]; pagination: CatalogListResponse['pagination'] }>(
    `/products${query ? `?${query}` : ''}`,
  );

  return {
    items: data.items.map(mapApiProductToListing),
    pagination: data.pagination,
  };
}

export async function fetchProductBySlug(slug: string): Promise<ListingProduct | null> {
  try {
    const data = await fetchJson<{ product: ApiProduct }>(`/products/${slug}`);
    return mapApiProductToListing(data.product);
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const data = await fetchJson<{ categories: ApiCategory[] }>('/categories');
  return data.categories;
}

export async function fetchAllProductSlugs(): Promise<string[]> {
  const data = await fetchProducts({ page: 1, limit: 500 });
  return data.items.map((product) => product.slug);
}
