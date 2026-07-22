import type { ListingProduct, ProductReview } from '@/types/product.types';
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

const REVIEW_CONTENT = [
  {
    author: 'Ananya S.',
    title: 'Beautifully finished',
    comment: 'The product looks elegant and the finish is even better in person. It was packed carefully too.',
  },
  {
    author: 'Meera R.',
    title: 'Exactly as shown',
    comment: 'The colour and detailing match the photos. It adds a lovely handmade touch to the space.',
  },
  {
    author: 'Priya K.',
    title: 'Lovely quality',
    comment: 'Good quality, neat craftsmanship, and a thoughtful presentation. Happy with this purchase.',
  },
  {
    author: 'Kavya M.',
    title: 'A charming piece',
    comment: 'It feels distinctive and well made. The size and appearance were as described.',
  },
] as const;

function hashProduct(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function createSampleFeedback(product: ApiProduct): {
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
} {
  const seed = hashProduct(product.id || product.slug);
  const rating = Number((3.6 + (seed % 14) / 10).toFixed(1));
  const reviewCount = 8 + (seed % 28);
  const reviewTotal = 2 + (seed % 3);
  const baseDate = new Date(Math.min(Date.now(), new Date(product.createdAt).getTime()));

  const reviews = Array.from({ length: reviewTotal }, (_, index) => {
    const content = REVIEW_CONTENT[(seed + index) % REVIEW_CONTENT.length];
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (3 + ((seed + index * 11) % 45)));

    return {
      id: `sample-${product.id}-${index}`,
      author: content.author,
      avatar: '/icon.png',
      rating: Math.max(4, Math.min(5, Math.round(rating + (index % 2 ? -0.3 : 0.2)))),
      title: content.title,
      comment: content.comment,
      date: date.toISOString(),
      verified: false,
    };
  });

  return { rating, reviewCount, reviews };
}

export function mapApiProductToListing(product: ApiProduct): ListingProduct {
  const hasRelationalVariants = Boolean(product.variants?.length);
  const mappedVariants: ProductVariant[] | undefined = product.variants?.length
    ? product.variants.filter((variant) => variant.isActive).map((variant) => ({
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

  const imageSourceVariant = (() => {
    if (
      defaultVariant &&
      (defaultVariant.image ||
        defaultVariant.images.length > 0 ||
        defaultVariant.galleryImages.length > 0)
    ) {
      return defaultVariant;
    }
    const colors = (mappedVariants ?? []).filter((v) => v.variantType === 'COLOR');
    const pool = colors.length ? colors : (mappedVariants ?? []);
    return (
      pool.find(
        (v) => v.image || v.images.length > 0 || v.galleryImages.length > 0,
      ) ?? null
    );
  })();

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

  const variantGallery = imageSourceVariant
    ? [
        ...imageSourceVariant.images.map((img) => img.url),
        ...imageSourceVariant.galleryImages.map((img) => img.url),
      ].filter(Boolean)
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
  const feedback = createSampleFeedback(product);

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
    categorySlug: product.categorySlug,
    brand: 'AYARI',
    rating: feedback.rating,
    reviewCount: feedback.reviewCount,
    reviews: feedback.reviews,
    inStock: stockCount > 0,
    stockCount,
    isNew,
    isFeatured: product.isFeatured,
    discountPercent,
    createdAt: product.createdAt,
    sku: defaultVariant?.sku ?? product.sku,
    sizes: product.sizes?.length ? product.sizes : undefined,
    variants: mappedVariants,
    colorVariants: hasRelationalVariants
      ? variantsToColorVariants(mappedVariants ?? [])
      : ((product.colorVariants as ColorVariant[] | undefined) ?? []),
    setVariants: hasRelationalVariants
      ? variantsToSetVariants(mappedVariants ?? [])
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
    inStock: product.inStock,
  };
}
