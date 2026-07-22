'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ListingProduct } from '@/types/product.types';
import type { ColorVariant, ProductVariant, SetVariant } from '@/lib/product-variations';
import {
  buildDisplayTitle,
  extractItemCountLabel,
  getNumberOfItemsOptions,
  reorderGalleryForColor,
  resolveColorAndSetVariantId,
  resolveProductVariant,
  resolveVariantGalleryImages,
  resolveVariantPrice,
  variantsToColorVariants,
  variantsToSetVariants,
  type NumberOfItemsOption,
} from '@/lib/product-variations';

export interface ProductVariationState {
  selectedVariantId: string | null;
  selectedVariant: ProductVariant | null;
  selectedColorId: string | null;
  selectedSetId: string | null;
  selectedSize: string;
  selectedColor: ColorVariant | null;
  selectedSet: SetVariant | null;
  colorVariants: ColorVariant[];
  setVariants: SetVariant[];
  numberOfItemsOptions: NumberOfItemsOption[];
  displayTitle: string;
  activePrice: number;
  activeMrp?: number;
  discountPercent?: number;
  activeSku: string;
  activeStock: number;
  inStock: boolean;
  galleryImages: string[];
  setSelectedColor: (id: string | null) => void;
  setSelectedSet: (id: string | null) => void;
  setSelectedVariant: (id: string | null) => void;
  setSelectedSize: (size: string) => void;
}

export function useProductVariations(product: ListingProduct): ProductVariationState {
  const relationalVariants = product.variants ?? [];
  const hasRelationalVariants = relationalVariants.length > 0;

  const colorVariants = useMemo(() => {
    if (hasRelationalVariants) return variantsToColorVariants(relationalVariants);
    return product.colorVariants ?? [];
  }, [hasRelationalVariants, relationalVariants, product.colorVariants]);

  const setVariants = useMemo(() => {
    if (hasRelationalVariants) return variantsToSetVariants(relationalVariants);
    return product.setVariants ?? [];
  }, [hasRelationalVariants, relationalVariants, product.setVariants]);

  const colorNames = useMemo(() => colorVariants.map((c) => c.name), [colorVariants]);
  const sizes = product.sizes ?? [];

  const defaultVariantId =
    relationalVariants.find((v) => v.isDefault)?.id ?? relationalVariants[0]?.id ?? null;

  const initialColorId =
    (defaultVariantId &&
      colorVariants.find((c) => c.id === defaultVariantId)?.id) ||
    colorVariants[0]?.id ||
    null;

  const initialItemOptions = getNumberOfItemsOptions(
    setVariants,
    colorVariants.find((c) => c.id === initialColorId)?.name ?? null,
    colorNames,
  );

  const initialSetId =
    (defaultVariantId && setVariants.find((s) => s.id === defaultVariantId)?.id) ||
    initialItemOptions[0]?.setId ||
    setVariants[0]?.id ||
    null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariantId ?? initialColorId ?? initialSetId,
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(initialColorId);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(initialSetId);
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');

  const selectedColor = useMemo(
    () => colorVariants.find((c) => c.id === selectedColorId) ?? null,
    [colorVariants, selectedColorId],
  );

  const numberOfItemsOptions = useMemo(
    () => getNumberOfItemsOptions(setVariants, selectedColor?.name ?? null, colorNames),
    [setVariants, selectedColor?.name, colorNames],
  );

  // When colour changes, keep the same item-count if available; otherwise pick the first.
  useEffect(() => {
    if (!numberOfItemsOptions.length) return;
    const stillValid = numberOfItemsOptions.some((opt) => opt.setId === selectedSetId);
    if (stillValid) return;

    const currentLabel = selectedSetId
      ? extractItemCountLabel(setVariants.find((s) => s.id === selectedSetId)?.name ?? '')
      : '';
    const sameCount = numberOfItemsOptions.find(
      (opt) => opt.label.toLowerCase() === currentLabel.toLowerCase(),
    );
    setSelectedSetId(sameCount?.setId ?? numberOfItemsOptions[0].setId);
  }, [numberOfItemsOptions, selectedSetId, setVariants]);

  const selectedSet = useMemo(
    () => setVariants.find((s) => s.id === selectedSetId) ?? null,
    [setVariants, selectedSetId],
  );

  const resolvedVariantId = useMemo(() => {
    if (!hasRelationalVariants) return selectedVariantId;
    return resolveColorAndSetVariantId(relationalVariants, selectedColorId, selectedSetId);
  }, [
    hasRelationalVariants,
    relationalVariants,
    selectedColorId,
    selectedSetId,
    selectedVariantId,
  ]);

  const selectedVariant = useMemo(() => {
    if (!hasRelationalVariants) return null;
    return resolveProductVariant(product, resolvedVariantId);
  }, [hasRelationalVariants, product, resolvedVariantId]);

  const { price: activePrice, mrp: activeMrp, discountPercent } = useMemo(() => {
    if (selectedVariant) {
      const price = selectedVariant.price ?? product.price;
      const mrp = selectedVariant.compareAtPrice ?? product.originalPrice;
      const showMrp = mrp != null && mrp > price;
      return {
        price,
        mrp: showMrp ? mrp : undefined,
        discountPercent: showMrp ? Math.round(((mrp - price) / mrp) * 100) : undefined,
      };
    }
    return resolveVariantPrice(product.price, product.originalPrice, selectedColor, selectedSet);
  }, [selectedVariant, product, selectedColor, selectedSet]);

  const displayTitle = useMemo(() => {
    return buildDisplayTitle(product.name, selectedColor, selectedSet);
  }, [product.name, selectedColor, selectedSet]);

  const galleryImages = useMemo(() => {
    // Prefer colour images for the gallery so switching colour updates photos immediately.
    if (selectedColor) {
      const colorVariant = hasRelationalVariants
        ? relationalVariants.find((v) => v.id === selectedColor.id)
        : null;
      if (colorVariant) {
        const images = resolveVariantGalleryImages(colorVariant);
        if (images.length) return images;
      }
      return reorderGalleryForColor(product.images, selectedColor.imageUrl);
    }
    if (selectedVariant) {
      const images = resolveVariantGalleryImages(selectedVariant);
      return images.length ? images : product.images;
    }
    return product.images;
  }, [
    selectedColor,
    selectedVariant,
    hasRelationalVariants,
    relationalVariants,
    product.images,
  ]);

  const activeSku = selectedVariant?.sku ?? product.sku ?? '';
  const activeStock = selectedVariant?.stockQuantity ?? product.stockCount;
  const inStock = activeStock > 0;

  const setSelectedColor = (id: string | null) => {
    setSelectedColorId(id);
    if (hasRelationalVariants && id && !setVariants.length) {
      setSelectedVariantId(id);
    }
  };

  const setSelectedSet = (id: string | null) => {
    setSelectedSetId(id);
    if (hasRelationalVariants && id) {
      setSelectedVariantId(id);
    }
  };

  const setSelectedVariant = (id: string | null) => {
    setSelectedVariantId(id);
    if (!id) return;
    const variant = relationalVariants.find((v) => v.id === id);
    if (!variant) return;
    if (variant.variantType === 'COLOR') setSelectedColorId(id);
    if (variant.variantType === 'SET') setSelectedSetId(id);
  };

  return {
    selectedVariantId: selectedVariant?.id ?? resolvedVariantId ?? selectedVariantId,
    selectedVariant,
    selectedColorId,
    selectedSetId,
    selectedSize,
    selectedColor,
    selectedSet,
    colorVariants,
    setVariants,
    numberOfItemsOptions,
    displayTitle,
    activePrice,
    activeMrp,
    discountPercent,
    activeSku,
    activeStock,
    inStock,
    galleryImages,
    setSelectedColor,
    setSelectedSet,
    setSelectedVariant,
    setSelectedSize,
  };
}
