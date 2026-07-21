import type { ListingProduct } from '@/types/product.types';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { resolveMediaUrl } from '@/lib/media';
import type { ColorVariant, ProductVariant, SetVariant, VariantType } from '@/lib/product-variations';
import { variantsToColorVariants, variantsToSetVariants } from '@/lib/product-variations';

export interface ApiProductVariant {
  id: string;
  sku: string;
  name: string;
  colorHex?: string | null;
  variantType: VariantType;
  price?: number | null;
  compareAtPrice?: number | null;
  stockQuantity: number;
  sortOrder?: number;
  isDefault: boolean;
  isActive: boolean;
  image?: string | null;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder?: number;
    cloudinaryPublicId?: string | null;
    folder?: string | null;
    isPrimary?: boolean;
  }>;
  galleryImages: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder?: number;
    cloudinaryPublicId?: string | null;
    folder?: string | null;
    isPrimary?: boolean;
  }>;
}

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
  variants?: ApiProductVariant[];
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
  const mappedVariants: ProductVariant[] | undefined = product.variants?.length
    ? product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        colorHex: variant.colorHex,
        variantType: variant.variantType,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stockQuantity: variant.stockQuantity,
        sortOrder: variant.sortOrder,
        isDefault: variant.isDefault,
        isActive: variant.isActive,
        image: variant.image ? resolveMediaUrl(variant.image, PRODUCT_PLACEHOLDER) : null,
        images: variant.images.map((img) => ({
          id: img.id,
          url: resolveMediaUrl(img.url, PRODUCT_PLACEHOLDER),
          altText: img.altText,
          sortOrder: img.sortOrder,
          cloudinaryPublicId: img.cloudinaryPublicId,
          folder: img.folder,
          isPrimary: img.isPrimary,
        })),
        galleryImages: variant.galleryImages.map((img) => ({
          id: img.id,
          url: resolveMediaUrl(img.url, PRODUCT_PLACEHOLDER),
          altText: img.altText,
          sortOrder: img.sortOrder,
          cloudinaryPublicId: img.cloudinaryPublicId,
          folder: img.folder,
          isPrimary: img.isPrimary,
        })),
      }))
    : undefined;

  const defaultVariant =
    mappedVariants?.find((v) => v.isDefault) ?? mappedVariants?.[0] ?? null;

  const effectivePrice = defaultVariant?.price ?? product.price;
  const effectiveMrp = defaultVariant?.compareAtPrice ?? product.compareAtPrice;
  const mrp = effectiveMrp;
  const discountPercent =
    mrp && mrp > effectivePrice ? Math.round(((mrp - effectivePrice) / mrp) * 100) : undefined;

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

  const variantGallery = defaultVariant
    ? [
        ...defaultVariant.images.map((img) => img.url),
        ...defaultVariant.galleryImages.map((img) => img.url),
      ]
    : [];

  const images =
    variantGallery.length > 0
      ? variantGallery
      : productImageUrls.length > 0
        ? productImageUrls
        : featuredImageUrls.length > 0
          ? featuredImageUrls
          : [PRODUCT_PLACEHOLDER];

  const createdAt = new Date(product.createdAt);
  const isNew = Date.now() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000;
  const stockCount = defaultVariant?.stockQuantity ?? product.stockQuantity;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    longDescription: product.description ?? '',
    price: effectivePrice,
    originalPrice: mrp && mrp > effectivePrice ? mrp : undefined,
    image: images[0],
    images,
    featuredImages: featuredImageUrls,
    category: product.category,
    brand: 'AYARI',
    rating: 0,
    reviewCount: 0,
    inStock: stockCount > 0,
    stockCount,
    isNew,
    isFeatured: product.isFeatured,
    discountPercent,
    createdAt: product.createdAt,
    sku: defaultVariant?.sku ?? product.sku,
    sizes: product.sizes?.length ? product.sizes : undefined,
    variants: mappedVariants,
    colorVariants: mappedVariants?.length
      ? variantsToColorVariants(mappedVariants)
      : ((product.colorVariants as ColorVariant[] | undefined) ?? []),
    setVariants: mappedVariants?.length
      ? variantsToSetVariants(mappedVariants)
      : ((product.setVariants as SetVariant[] | undefined) ?? []),
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
