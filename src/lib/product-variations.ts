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

/** Extract a displayable item-count label from names like "Pack of 2 (Blue)" or "5". */
export function extractItemCountLabel(name: string): string {
  const packMatch = name.match(/pack\s*of\s*(\d+)/i);
  if (packMatch?.[1]) return packMatch[1];
  const leadingNumber = name.match(/^(\d+)\b/);
  if (leadingNumber?.[1]) return leadingNumber[1];
  const anyNumber = name.match(/(\d+)/);
  if (anyNumber?.[1]) return anyNumber[1];
  return name.trim();
}

function embeddedColorFromSetName(name: string): string | null {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren?.[1]) return paren[1].trim();
  return null;
}

function setMentionsColor(set: SetVariant, colorName: string): boolean {
  const embedded = embeddedColorFromSetName(set.name);
  if (embedded) return embedded.toLowerCase() === colorName.toLowerCase();
  return set.name.toLowerCase().includes(colorName.toLowerCase());
}

function setHasAnyKnownColor(set: SetVariant, colorNames: string[]): boolean {
  if (embeddedColorFromSetName(set.name)) return true;
  const lower = set.name.toLowerCase();
  return colorNames.some((color) => color && lower.includes(color.toLowerCase()));
}

export interface NumberOfItemsOption {
  /** Stable key for the UI button (e.g. "1", "2", "5") */
  key: string;
  /** Button label shown to the shopper */
  label: string;
  /** Concrete SET variant id for the current colour (or generic set) */
  setId: string;
  price?: number;
  compareAtPrice?: number;
}

/**
 * Build Amazon-style "Number of Items" options.
 * When SET names embed a colour (e.g. "Pack of 1 (Blue)"), options are filtered
 * to the selected colour so Blue only shows Blue packs.
 */
export function getNumberOfItemsOptions(
  setVariants: SetVariant[],
  selectedColorName?: string | null,
  colorNames: string[] = [],
): NumberOfItemsOption[] {
  if (!setVariants.length) return [];

  const filtered = selectedColorName
    ? setVariants.filter((set) => {
        if (setHasAnyKnownColor(set, colorNames)) {
          return setMentionsColor(set, selectedColorName);
        }
        // Generic pack (no colour in name) — available for every colour
        return true;
      })
    : setVariants;

  const source = filtered.length ? filtered : setVariants;
  const seen = new Set<string>();
  const options: NumberOfItemsOption[] = [];

  for (const set of source) {
    const label = extractItemCountLabel(set.name);
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      key,
      label,
      setId: set.id,
      price: set.price,
      compareAtPrice: set.compareAtPrice,
    });
  }

  return options.sort((a, b) => {
    const aNum = Number(a.label);
    const bNum = Number(b.label);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return a.label.localeCompare(b.label);
  });
}

/** Prefer the SET sku that matches colour + item count when both axes exist. */
export function resolveColorAndSetVariantId(
  variants: ProductVariant[],
  colorId: string | null,
  setId: string | null,
): string | null {
  const active = variants.filter((v) => v.isActive);
  if (!active.length) return setId ?? colorId;

  const setVariant = setId ? active.find((v) => v.id === setId) : undefined;
  if (setVariant) return setVariant.id;

  const colorVariant = colorId ? active.find((v) => v.id === colorId) : undefined;
  if (colorVariant) return colorVariant.id;

  return active.find((v) => v.isDefault)?.id ?? active[0]?.id ?? null;
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
