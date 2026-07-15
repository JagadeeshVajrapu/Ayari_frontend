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
