import { resolveMediaUrl } from '@/lib/media';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';

export interface ColorVariant {
  id: string;
  name: string;
  hex?: string;
  imageUrl?: string;
  /** Admin-only: links a pending upload before it has a permanent URL */
  imageClientId?: string;
  price?: number;
  compareAtPrice?: number;
}

export interface SetVariant {
  id: string;
  name: string;
  label?: string;
  price?: number;
  compareAtPrice?: number;
}

export type VariantType =
  | 'COLOR'
  | 'SIZE'
  | 'SET'
  | 'STORAGE'
  | 'RAM'
  | 'WEIGHT'
  | 'MATERIAL'
  | 'BUNDLE'
  | 'EDITION'
  | 'OTHER';

export interface ProductVariantImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
  cloudinaryPublicId?: string | null;
  folder?: string | null;
  isPrimary?: boolean;
}

export interface ProductVariant {
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
  images: ProductVariantImage[];
  galleryImages: ProductVariantImage[];
}

export interface AdminVariantFormItem {
  /** React list key — always present */
  clientId: string;
  /** Persisted DB id — only set when editing an existing variant */
  id?: string;
  sku: string;
  name: string;
  colorHex?: string;
  variantType: VariantType;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  isDefault: boolean;
  isActive: boolean;
  productImages: import('@/features/admin/components/admin-image-upload-section').ImageUploadItem[];
  galleryImages: import('@/features/admin/components/admin-image-upload-section').ImageUploadItem[];
}

export function createEmptyAdminVariant(
  isDefault = false,
  defaults?: { price?: string; compareAtPrice?: string },
): AdminVariantFormItem {
  return {
    clientId: createVariantId('variant'),
    sku: '',
    name: '',
    colorHex: '#9ca3af',
    variantType: 'COLOR',
    price: defaults?.price ?? '',
    compareAtPrice: defaults?.compareAtPrice ?? '',
    stockQuantity: '0',
    isDefault,
    isActive: true,
    productImages: [],
    galleryImages: [],
  };
}

/** Default variant id for listing "Add to cart" (Amazon-style: buy default option). */
export function getDefaultVariantId(product: { variants?: ProductVariant[] }): string | undefined {
  const variants = (product.variants ?? []).filter((v) => v.isActive);
  if (!variants.length) return undefined;
  return (variants.find((v) => v.isDefault) ?? variants[0])?.id;
}

export function resolveProductVariant(
  product: { variants?: ProductVariant[] },
  variantId?: string | null,
): ProductVariant | null {
  const variants = (product.variants ?? []).filter((v) => v.isActive);
  if (!variants.length) return null;
  if (variantId) {
    return variants.find((v) => v.id === variantId) ?? null;
  }
  return variants.find((v) => v.isDefault) ?? variants[0] ?? null;
}

export function variantsToColorVariants(variants: ProductVariant[]): ColorVariant[] {
  return variants
    .filter((v) => v.variantType === 'COLOR' && v.isActive)
    .map((v) => ({
      id: v.id,
      name: v.name,
      hex: v.colorHex ?? undefined,
      imageUrl: v.image ?? undefined,
      price: v.price ?? undefined,
      compareAtPrice: v.compareAtPrice ?? undefined,
    }));
}

export function variantsToSetVariants(variants: ProductVariant[]): SetVariant[] {
  return variants
    .filter((v) => v.variantType === 'SET' && v.isActive)
    .map((v) => ({
      id: v.id,
      name: v.name,
      label: v.name,
      price: v.price ?? undefined,
      compareAtPrice: v.compareAtPrice ?? undefined,
    }));
}

export function resolveVariantGalleryImages(variant: ProductVariant | null): string[] {
  if (!variant) return [];
  const productUrls = variant.images.map((img) => resolveMediaUrl(img.url, PRODUCT_PLACEHOLDER));
  const galleryUrls = variant.galleryImages.map((img) =>
    resolveMediaUrl(img.url, PRODUCT_PLACEHOLDER),
  );
  return [...productUrls, ...galleryUrls].filter(Boolean);
}

export function createVariantId(prefix: string): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function resolveVariantPrice(
  basePrice: number,
  baseMrp: number | undefined,
  color?: ColorVariant | null,
  set?: SetVariant | null,
): { price: number; mrp?: number; discountPercent?: number } {
  const price = set?.price ?? color?.price ?? basePrice;
  const mrp = set?.compareAtPrice ?? color?.compareAtPrice ?? baseMrp;
  const showMrp = mrp != null && mrp > price;
  const discountPercent = showMrp ? Math.round(((mrp - price) / mrp) * 100) : undefined;
  return {
    price,
    mrp: showMrp ? mrp : undefined,
    discountPercent,
  };
}

export function resolveColorImage(imageUrl?: string): string {
  if (!imageUrl) return PRODUCT_PLACEHOLDER;
  return resolveMediaUrl(imageUrl, PRODUCT_PLACEHOLDER);
}

export function buildDisplayTitle(
  baseName: string,
  color?: ColorVariant | null,
  set?: SetVariant | null,
): string {
  const parts: string[] = [];
  if (color?.name) parts.push(color.name);
  if (set?.name && set.name !== color?.name) parts.push(set.name);
  if (!parts.length) return baseName;
  return `${baseName} (${parts.join(', ')})`;
}

export function reorderGalleryForColor(images: string[], colorImageUrl?: string): string[] {
  if (!colorImageUrl) return images;
  const resolved = resolveColorImage(colorImageUrl);
  const rest = images.filter((url) => url !== resolved && url !== colorImageUrl);
  return [resolved, ...rest];
}
