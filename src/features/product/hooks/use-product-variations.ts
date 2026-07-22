'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ListingProduct } from '@/types/product.types';
import type { ColorVariant, ProductVariant, SetVariant } from '@/lib/product-variations';
import {
  buildDisplayTitle,
  extractItemCountLabel,
  findVariantForColorAndCount,
  getNumberOfItemsOptions,
  resolveColorAndSetVariantId,
  resolveProductVariant,
  resolveSelectionGalleryImages,
  resolveShopColorVariants,
  resolveShopSetVariants,
  resolveVariantPrice,
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
    if (hasRelationalVariants) return resolveShopColorVariants(relationalVariants);
    return product.colorVariants ?? [];
  }, [hasRelationalVariants, relationalVariants, product.colorVariants]);

  const setVariants = useMemo(() => {
    if (hasRelationalVariants) return resolveShopSetVariants(relationalVariants);
    return product.setVariants ?? [];
  }, [hasRelationalVariants, relationalVariants, product.setVariants]);

  const colorNames = useMemo(() => colorVariants.map((c) => c.name), [colorVariants]);
  const sizes = product.sizes ?? [];

  const defaultVariantId =
    relationalVariants.find((v) => v.isDefault)?.id ?? relationalVariants[0]?.id ?? null;

  const initialColorId = (() => {
    if (!colorVariants.length) return null;
    if (defaultVariantId) {
      const fromDefault = colorVariants.find((c) => c.id === defaultVariantId);
      if (fromDefault) return fromDefault.id;
      const defaultVariant = relationalVariants.find((v) => v.id === defaultVariantId);
      if (defaultVariant) {
        const match = colorVariants.find((c) =>
          defaultVariant.name.toLowerCase().includes(c.name.toLowerCase()),
        );
        if (match) return match.id;
      }
    }
    return colorVariants[0]?.id ?? null;
  })();

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
    const nextId = sameCount?.setId ?? numberOfItemsOptions[0].setId;
    setSelectedSetId(nextId);
    setSelectedVariantId(nextId);
  }, [numberOfItemsOptions, selectedSetId, setVariants]);

  const selectedSet = useMemo(
    () => setVariants.find((s) => s.id === selectedSetId) ?? null,
    [setVariants, selectedSetId],
  );

  const itemCountLabel =
    numberOfItemsOptions.find((opt) => opt.setId === selectedSetId)?.label ??
    (selectedSet ? extractItemCountLabel(selectedSet.name) : null) ??
    numberOfItemsOptions[0]?.label ??
    null;

  const matchedPackVariant = useMemo(() => {
    if (!hasRelationalVariants) return null;
    return findVariantForColorAndCount(
      relationalVariants,
      selectedColor?.name ?? null,
      itemCountLabel,
      colorNames,
    );
  }, [
    hasRelationalVariants,
    relationalVariants,
    selectedColor?.name,
    itemCountLabel,
    colorNames,
  ]);

  const resolvedVariantId = useMemo(() => {
    if (!hasRelationalVariants) return selectedVariantId;
    if (matchedPackVariant) return matchedPackVariant.id;
    return resolveColorAndSetVariantId(
      relationalVariants,
      selectedColorId,
      selectedSetId,
      selectedColor?.name ?? null,
      colorNames,
    );
  }, [
    hasRelationalVariants,
    matchedPackVariant,
    relationalVariants,
    selectedColorId,
    selectedSetId,
    selectedColor?.name,
    selectedVariantId,
    colorNames,
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
    if (!hasRelationalVariants) {
      return product.images.length ? product.images : [];
    }

    const resolved = resolveSelectionGalleryImages({
      variants: relationalVariants,
      colorName: selectedColor?.name ?? null,
      itemCount: itemCountLabel,
      colorImageUrl: selectedColor?.imageUrl ?? null,
      productImages: product.images,
      allColorNames: colorNames,
    });

    return resolved.length ? resolved : product.images;
  }, [
    hasRelationalVariants,
    relationalVariants,
    selectedColor?.name,
    selectedColor?.imageUrl,
    itemCountLabel,
    product.images,
    colorNames,
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
