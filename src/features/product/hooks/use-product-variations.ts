'use client';

import { useMemo, useState } from 'react';
import type { ListingProduct } from '@/types/product.types';
import type { ColorVariant, SetVariant } from '@/lib/product-variations';
import {
  buildDisplayTitle,
  reorderGalleryForColor,
  resolveVariantPrice,
} from '@/lib/product-variations';

export interface ProductVariationState {
  selectedColorId: string | null;
  selectedSetId: string | null;
  selectedSize: string;
  selectedColor: ColorVariant | null;
  selectedSet: SetVariant | null;
  displayTitle: string;
  activePrice: number;
  activeMrp?: number;
  discountPercent?: number;
  galleryImages: string[];
  setSelectedColor: (id: string | null) => void;
  setSelectedSet: (id: string | null) => void;
  setSelectedSize: (size: string) => void;
}

export function useProductVariations(product: ListingProduct): ProductVariationState {
  const colorVariants = product.colorVariants ?? [];
  const setVariants = product.setVariants ?? [];
  const sizes = product.sizes ?? [];

  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colorVariants[0]?.id ?? null,
  );
  const [selectedSetId, setSelectedSetId] = useState<string | null>(
    setVariants[0]?.id ?? null,
  );
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');

  const selectedColor = useMemo(
    () => colorVariants.find((c) => c.id === selectedColorId) ?? null,
    [colorVariants, selectedColorId],
  );

  const selectedSet = useMemo(
    () => setVariants.find((s) => s.id === selectedSetId) ?? null,
    [setVariants, selectedSetId],
  );

  const { price: activePrice, mrp: activeMrp, discountPercent } = useMemo(
    () => resolveVariantPrice(product.price, product.originalPrice, selectedColor, selectedSet),
    [product.price, product.originalPrice, selectedColor, selectedSet],
  );

  const displayTitle = useMemo(
    () => buildDisplayTitle(product.name, selectedColor, selectedSet),
    [product.name, selectedColor, selectedSet],
  );

  const galleryImages = useMemo(
    () => reorderGalleryForColor(product.images, selectedColor?.imageUrl),
    [product.images, selectedColor?.imageUrl],
  );

  return {
    selectedColorId,
    selectedSetId,
    selectedSize,
    selectedColor,
    selectedSet,
    displayTitle,
    activePrice,
    activeMrp,
    discountPercent,
    galleryImages,
    setSelectedColor: setSelectedColorId,
    setSelectedSet: setSelectedSetId,
    setSelectedSize,
  };
}
