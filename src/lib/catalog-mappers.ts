import type { ListingProduct } from '@/types/product.types';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  categoryId: string;
  category: string;
  categorySlug: string;
  isActive: boolean;
  isFeatured: boolean;
  image: string | null;
  images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder?: number; cloudinaryPublicId?: string | null }>;
  featuredImages: Array<{ id: string; url: string; altText: string | null; sortOrder?: number; cloudinaryPublicId?: string | null }>;
  galleryImages?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export function mapApiProductToListing(product: ApiProduct): ListingProduct {
  const compareAt = product.compareAtPrice;
  const discountPercent =
    compareAt && compareAt > product.price
      ? Math.round(((compareAt - product.price) / compareAt) * 100)
      : undefined;

  const imageUrls = product.galleryImages?.length
    ? product.galleryImages
    : product.featuredImages.length
      ? product.featuredImages.map((image) => image.url)
      : product.images.length
        ? product.images.map((image) => image.url)
        : product.image
          ? [product.image]
          : [PRODUCT_PLACEHOLDER];

  const createdAt = new Date(product.createdAt);
  const isNew = Date.now() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    price: product.price,
    originalPrice: compareAt ?? undefined,
    image: imageUrls[0],
    images: imageUrls,
    category: product.category,
    brand: 'AYARI',
    rating: 0,
    reviewCount: 0,
    inStock: product.stockQuantity > 0,
    stockCount: product.stockQuantity,
    isNew,
    isFeatured: product.isFeatured,
    discountPercent,
    createdAt: product.createdAt,
    sku: product.sku,
  };
}

export function mapListingToCard(product: ListingProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    category: product.category,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    discountPercent: product.discountPercent,
  };
}
