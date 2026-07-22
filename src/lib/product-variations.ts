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
  const itemsMatch = name.match(/(\d+)\s*(?:items?|pcs?|pieces?)/i);
  if (itemsMatch?.[1]) return itemsMatch[1];
  const leadingNumber = name.match(/^(\d+)\b/);
  if (leadingNumber?.[1]) return leadingNumber[1];
  const anyNumber = name.match(/(\d+)/);
  if (anyNumber?.[1]) return anyNumber[1];
  return name.trim();
}

export function isPackLikeName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (/pack\s*of\s*\d+/i.test(trimmed)) return true;
  if (/^\d+\s*$/.test(trimmed)) return true;
  if (/\d+\s*(?:items?|pcs?|pieces?)/i.test(trimmed)) return true;
  return false;
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function colorsMatch(a: string, b: string): boolean {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function embeddedColorFromSetName(name: string): string | null {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren?.[1]?.trim()) return paren[1].trim();
  return null;
}

function variantMentionsColor(variantName: string, colorName: string): boolean {
  const embedded = embeddedColorFromSetName(variantName);
  if (embedded && colorsMatch(embedded, colorName)) return true;
  // "Pink Pack of 2", "Pack of 2 Pink", "Pink-2"
  const normalizedName = normalizeToken(variantName);
  const normalizedColor = normalizeToken(colorName);
  if (!normalizedColor) return false;
  if (normalizedName === normalizedColor) return true;
  return (
    normalizedName.startsWith(`${normalizedColor} `) ||
    normalizedName.endsWith(` ${normalizedColor}`) ||
    normalizedName.includes(` ${normalizedColor} `)
  );
}

function setHasAnyKnownColor(name: string, colorNames: string[]): boolean {
  const embedded = embeddedColorFromSetName(name);
  if (embedded) {
    return colorNames.some((color) => color && colorsMatch(embedded, color));
  }
  return colorNames.some((color) => color && variantMentionsColor(name, color));
}

function isGenericPackName(name: string, colorNames: string[]): boolean {
  return isPackLikeName(name) && !setHasAnyKnownColor(name, colorNames);
}

function variantHasImages(variant: ProductVariant): boolean {
  return Boolean(
    variant.image ||
      variant.images?.length ||
      variant.galleryImages?.length,
  );
}

/**
 * Colour swatches for the shop UI.
 * Prefers true COLOR variants; if pack-like COLORs exist alongside pure colours,
 * pack-like ones are excluded from the colour grid (they belong under Number of Items).
 */
export function resolveShopColorVariants(variants: ProductVariant[]): ColorVariant[] {
  const colors = variantsToColorVariants(variants);
  if (!colors.length) {
    // Derive colours from pack names like "Pack of 2 (Pink)" when no COLOR rows exist
    const derived = new Map<string, ColorVariant>();
    for (const variant of variants.filter((v) => v.isActive)) {
      const embedded = embeddedColorFromSetName(variant.name);
      if (!embedded) continue;
      const key = normalizeToken(embedded);
      if (derived.has(key)) continue;
      derived.set(key, {
        id: variant.id,
        name: embedded,
        hex: variant.colorHex ?? undefined,
        imageUrl: variant.image ?? undefined,
        price: variant.price ?? undefined,
        compareAtPrice: variant.compareAtPrice ?? undefined,
      });
    }
    return Array.from(derived.values());
  }

  const pure = colors.filter((c) => !isPackLikeName(c.name));
  return pure.length ? pure : colors;
}

/**
 * Number-of-items options for the shop UI.
 * Uses SET variants first; if packs were saved as COLOR/OTHER by mistake, includes those too.
 */
export function resolveShopSetVariants(variants: ProductVariant[]): SetVariant[] {
  const fromSet = variantsToSetVariants(variants);
  if (fromSet.length) return fromSet;

  return variants
    .filter((v) => v.isActive && isPackLikeName(v.name))
    .map((v) => ({
      id: v.id,
      name: v.name,
      label: v.name,
      price: v.price ?? undefined,
      compareAtPrice: v.compareAtPrice ?? undefined,
    }));
}

export interface NumberOfItemsOption {
  /** Stable key for the UI button (e.g. "1", "2", "5") */
  key: string;
  /** Button label shown to the shopper */
  label: string;
  /** Concrete variant id for the current colour + count */
  setId: string;
  price?: number;
  compareAtPrice?: number;
}

function toNumberOfItemsOptions(sets: SetVariant[]): NumberOfItemsOption[] {
  const seen = new Set<string>();
  const options: NumberOfItemsOption[] = [];

  for (const set of sets) {
    const label = extractItemCountLabel(set.name);
    const key = label.toLowerCase();
    if (!key || seen.has(key)) continue;
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

/**
 * Build Amazon-style "Number of Items" options for the selected colour.
 * Never mixes another colour's packs into the buttons when colour-specific packs exist.
 */
export function getNumberOfItemsOptions(
  setVariants: SetVariant[],
  selectedColorName?: string | null,
  colorNames: string[] = [],
): NumberOfItemsOption[] {
  if (!setVariants.length) return [];

  if (selectedColorName) {
    const colorSpecific = setVariants.filter((set) =>
      variantMentionsColor(set.name, selectedColorName),
    );
    if (colorSpecific.length) return toNumberOfItemsOptions(colorSpecific);

    const generic = setVariants.filter((set) => isGenericPackName(set.name, colorNames));
    if (generic.length) return toNumberOfItemsOptions(generic);

    const loose = setVariants.filter((set) =>
      normalizeToken(set.name).includes(normalizeToken(selectedColorName)),
    );
    if (loose.length) return toNumberOfItemsOptions(loose);
  }

  return toNumberOfItemsOptions(setVariants);
}

/**
 * Find the best concrete variant for colour + pack count.
 * Never returns a different pack count (e.g. Pack of 2 when 1 is selected).
 * Never returns another colour's pack when a colour is selected.
 */
export function findVariantForColorAndCount(
  variants: ProductVariant[],
  colorName?: string | null,
  itemCount?: string | null,
  allColorNames: string[] = [],
): ProductVariant | null {
  const active = variants.filter((v) => v.isActive);
  if (!active.length) return null;

  const countRaw = itemCount?.trim() ?? '';
  const count = countRaw ? extractItemCountLabel(countRaw) : '';
  // If caller passed a numeric count label like "1", keep it strict
  const countIsNumeric = Boolean(count && /^\d+$/.test(count));
  if (!count && !colorName) return null;

  const colorPool = allColorNames.length
    ? allColorNames
    : colorName
      ? [colorName]
      : [];

  type Scored = { variant: ProductVariant; score: number };
  const scored: Scored[] = [];

  for (const variant of active) {
    const variantCount = extractItemCountLabel(variant.name);
    const variantCountNumeric = /^\d+$/.test(variantCount);
    const countMatches =
      countIsNumeric && variantCountNumeric
        ? variantCount === count
        : Boolean(count) && variantCount === count;

    // Hard rule: never cross pack sizes when a numeric count is selected
    if (countIsNumeric && variantCountNumeric && variantCount !== count) {
      continue;
    }
    if (countIsNumeric && isPackLikeName(variant.name) && !countMatches) {
      continue;
    }

    const colorMatches = Boolean(colorName) && variantMentionsColor(variant.name, colorName!);
    const genericPack = isGenericPackName(variant.name, colorPool);
    const pureColor =
      variant.variantType === 'COLOR' && !isPackLikeName(variant.name);

    let score = 0;

    if (countMatches && colorMatches) score = 100;
    else if (countMatches && genericPack && colorName) score = 70;
    else if (countMatches && !colorName) score = 80;
    else if (!countIsNumeric && colorMatches && pureColor) score = 50;
    else continue;

    // Do not let "has images" promote a weaker colour/count match above a stronger one
    if (variantHasImages(variant)) score += 5;
    if (variant.variantType === 'SET') score += 2;
    scored.push({ variant, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.variant ?? null;
}

/** Prefer the SET sku that matches colour + item count when both axes exist. */
export function resolveColorAndSetVariantId(
  variants: ProductVariant[],
  colorId: string | null,
  setId: string | null,
  colorName?: string | null,
  allColorNames: string[] = [],
): string | null {
  const active = variants.filter((v) => v.isActive);
  if (!active.length) return setId ?? colorId;

  const setVariant = setId ? active.find((v) => v.id === setId) : undefined;
  if (setVariant) {
    if (colorName) {
      const count = extractItemCountLabel(setVariant.name);
      const better = findVariantForColorAndCount(active, colorName, count, allColorNames);
      if (better) return better.id;
    }
    return setVariant.id;
  }

  const colorVariant = colorId ? active.find((v) => v.id === colorId) : undefined;
  if (colorVariant) return colorVariant.id;

  return active.find((v) => v.isDefault)?.id ?? active[0]?.id ?? null;
}

/** Variant images with primary first — avoids a non-primary pack photo leading the gallery. */
export function resolveVariantGalleryImages(variant: ProductVariant | null): string[] {
  if (!variant) return [];

  const productImages = [...(variant.images ?? [])].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  const urls: string[] = [];
  if (variant.image) {
    urls.push(resolveMediaUrl(variant.image, PRODUCT_PLACEHOLDER));
  }
  for (const img of productImages) {
    const url = resolveMediaUrl(img.url, PRODUCT_PLACEHOLDER);
    if (url && !urls.includes(url)) urls.push(url);
  }
  for (const img of variant.galleryImages ?? []) {
    const url = resolveMediaUrl(img.url, PRODUCT_PLACEHOLDER);
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls.filter(Boolean);
}

/**
 * Gallery for the selected colour + pack.
 * Uses only that pack's photos; if none, falls back to the colour swatch (not other packs).
 */
export function resolveSelectionGalleryImages(params: {
  variants: ProductVariant[];
  colorName?: string | null;
  itemCount?: string | null;
  colorImageUrl?: string | null;
  productImages?: string[];
  allColorNames?: string[];
}): string[] {
  const {
    variants,
    colorName,
    itemCount,
    colorImageUrl,
    productImages = [],
    allColorNames = [],
  } = params;

  const matched = findVariantForColorAndCount(
    variants,
    colorName,
    itemCount,
    allColorNames,
  );

  if (matched) {
    const matchedImages = resolveVariantGalleryImages(matched);
    if (matchedImages.length) return matchedImages;
  }

  // Pack has no photos → show the colour swatch only (never another pack's gallery)
  if (colorImageUrl) {
    return [resolveColorImage(colorImageUrl)];
  }

  if (colorName) {
    const colorVariant = variants.find(
      (v) =>
        v.isActive &&
        v.variantType === 'COLOR' &&
        !isPackLikeName(v.name) &&
        variantMentionsColor(v.name, colorName),
    );
    if (colorVariant) {
      const colorImages = resolveVariantGalleryImages(colorVariant);
      if (colorImages.length) return [colorImages[0]];
    }
  }

  return productImages.length ? [productImages[0]] : [];
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
  if (set?.name && set.name !== color?.name) {
    const countLabel = extractItemCountLabel(set.name);
    const embedded = set.name.match(/\(([^)]+)\)/)?.[1]?.trim().toLowerCase();
    // Avoid "Pink, Pack of 2 (Pink)" — show "Pink, Pack of 2" when colour already shown
    if (embedded && color?.name && embedded === color.name.toLowerCase()) {
      parts.push(`Pack of ${countLabel}`);
    } else if (/^\d+$/.test(countLabel) && set.name.toLowerCase().includes('pack')) {
      parts.push(`Pack of ${countLabel}`);
    } else if (/^\d+$/.test(countLabel) && set.name.trim() === countLabel) {
      parts.push(`Pack of ${countLabel}`);
    } else {
      parts.push(set.name);
    }
  }
  if (!parts.length) return baseName;
  return `${baseName} (${parts.join(', ')})`;
}

export function reorderGalleryForColor(images: string[], colorImageUrl?: string): string[] {
  if (!colorImageUrl) return images;
  const resolved = resolveColorImage(colorImageUrl);
  const rest = images.filter((url) => url !== resolved && url !== colorImageUrl);
  return [resolved, ...rest];
}
