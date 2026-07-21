import type { ColorVariant, ProductVariant, SetVariant } from '@/lib/product-variations';

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface ListingProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  /** Extra gallery images shown under the main PDP gallery */
  featuredImages?: string[];
  category: string;
  categorySlug?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPercent?: number;
  createdAt: string;
  specifications?: ProductSpecification[];
  sizes?: string[];
  colorVariants?: ColorVariant[];
  setVariants?: SetVariant[];
  variants?: ProductVariant[];
  sku?: string;
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'name-asc';

export type ViewMode = 'grid' | 'list';

export interface ProductFilters {
  search: string;
  categories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  inStockOnly: boolean;
  /** When true, only products marked isFeatured are returned. */
  featuredOnly: boolean;
  sort: SortOption;
  page: number;
  view: ViewMode;
}

export const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  categories: [],
  brands: [],
  priceMin: 0,
  priceMax: 500000,
  minRating: 0,
  inStockOnly: false,
  featuredOnly: false,
  sort: 'featured',
  page: 1,
  view: 'grid',
};

export const PAGE_SIZE = 12;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
];
