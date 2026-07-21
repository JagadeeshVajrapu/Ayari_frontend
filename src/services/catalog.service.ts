import { api } from '@/services/auth.service';
import type { Pagination } from '@/services/admin.service';
import type { ApiCategory, ApiProduct } from '@/lib/catalog-mappers';
import type { SortOption } from '@/types/product.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CatalogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categories?: string[];
  featured?: boolean;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
}

export const catalogService = {
  getProducts: (params?: CatalogQueryParams) =>
    api.get<ApiResponse<{ items: ApiProduct[]; pagination: Pagination }>>('/products', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        category: params?.categories?.length ? undefined : params?.category,
        categories: params?.categories?.length ? params.categories.join(',') : undefined,
        featured: params?.featured ? 'true' : undefined,
        inStock: params?.inStock ? 'true' : undefined,
        priceMin: params?.priceMin,
        priceMax: params?.priceMax,
        sort: params?.sort,
      },
    }),

  getProduct: (slug: string) =>
    api.get<ApiResponse<{ product: ApiProduct }>>(`/products/${slug}`),

  getCategories: () =>
    api.get<ApiResponse<{ categories: ApiCategory[] }>>('/categories'),
};
