import type { ListingProduct } from '@/types/product.types';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { resolveMediaUrl } from '@/lib/media';
import type { ColorVariant, SetVariant } from '@/lib/product-variations';

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
  sizes?: string[];
  colorVariants?: Array<{
    id: string;
    name: string;
    hex?: string;
    imageUrl?: string;
    price?: number;
    compareAtPrice?: number;
  }>;
  setVariants?: Array<{
    id: string;
    name: string;
    label?: string;
    price?: number;
    compareAtPrice?: number;
  }>;
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
  const mrp = product.compareAtPrice;
  const discountPercent =
    mrp && mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : undefined;

  const productImageUrls = (product.images?.length
    ? product.images.map((image) => image.url)
    : product.image
      ? [product.image]
      : []
  ).map((url) => resolveMediaUrl(url, PRODUCT_PLACEHOLDER));

  const featuredImageUrls = (product.featuredImages?.length
    ? product.featuredImages.map((image) => image.url)
    : []
  ).map((url) => resolveMediaUrl(url, PRODUCT_PLACEHOLDER));

  const images =
    productImageUrls.length > 0
      ? productImageUrls
      : featuredImageUrls.length > 0
        ? featuredImageUrls
        : [PRODUCT_PLACEHOLDER];

  const createdAt = new Date(product.createdAt);
  const isNew = Date.now() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    longDescription: product.description ?? '',
    price: product.price,
    originalPrice: mrp && mrp > product.price ? mrp : undefined,
    image: images[0],
    images,
    featuredImages: featuredImageUrls,
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
    sizes: product.sizes?.length ? product.sizes : undefined,
    colorVariants: (product.colorVariants as ColorVariant[] | undefined) ?? [],
    setVariants: (product.setVariants as SetVariant[] | undefined) ?? [],
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
