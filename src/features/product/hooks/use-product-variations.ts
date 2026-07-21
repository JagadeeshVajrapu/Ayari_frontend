'use client';

import { useMemo, useState } from 'react';
import type { ListingProduct } from '@/types/product.types';
import type { ColorVariant, ProductVariant, SetVariant } from '@/lib/product-variations';
import {
  buildDisplayTitle,
  reorderGalleryForColor,
  resolveProductVariant,
  resolveVariantGalleryImages,
  resolveVariantPrice,
  variantsToColorVariants,
  variantsToSetVariants,
} from '@/lib/product-variations';

export interface ProductVariationState {
  selectedVariantId: string | null;
  selectedVariant: ProductVariant | null;
  selectedColorId: string | null;
  selectedSetId: string | null;
  selectedSize: string;
  selectedColor: ColorVariant | null;
  selectedSet: SetVariant | null;
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

  const sizes = product.sizes ?? [];

  const defaultVariantId =
    relationalVariants.find((v) => v.isDefault)?.id ?? relationalVariants[0]?.id ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariantId ?? colorVariants[0]?.id ?? null,
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    colorVariants[0]?.id ?? null,
  );
  const [selectedSetId, setSelectedSetId] = useState<string | null>(
    setVariants[0]?.id ?? null,
  );
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');

  const selectedVariant = useMemo(() => {
    if (!hasRelationalVariants) return null;
    const id = selectedVariantId ?? selectedColorId ?? selectedSetId;
    return resolveProductVariant(product, id);
  }, [hasRelationalVariants, product, selectedVariantId, selectedColorId, selectedSetId]);

  const selectedColor = useMemo(
    () => colorVariants.find((c) => c.id === selectedColorId) ?? null,
    [colorVariants, selectedColorId],
  );

  const selectedSet = useMemo(
    () => setVariants.find((s) => s.id === selectedSetId) ?? null,
    [setVariants, selectedSetId],
  );

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
    if (selectedVariant) {
      return buildDisplayTitle(product.name, { id: selectedVariant.id, name: selectedVariant.name }, null);
    }
    return buildDisplayTitle(product.name, selectedColor, selectedSet);
  }, [product.name, selectedVariant, selectedColor, selectedSet]);

  const galleryImages = useMemo(() => {
    if (selectedVariant) {
      const images = resolveVariantGalleryImages(selectedVariant);
      return images.length ? images : product.images;
    }
    return reorderGalleryForColor(product.images, selectedColor?.imageUrl);
  }, [selectedVariant, product.images, selectedColor?.imageUrl]);

  const activeSku = selectedVariant?.sku ?? product.sku ?? '';
  const activeStock = selectedVariant?.stockQuantity ?? product.stockCount;
  const inStock = activeStock > 0;

  const setSelectedColor = (id: string | null) => {
    setSelectedColorId(id);
    if (hasRelationalVariants && id) {
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
    selectedVariantId: selectedVariant?.id ?? selectedVariantId,
    selectedVariant,
    selectedColorId,
    selectedSetId,
    selectedSize,
    selectedColor,
    selectedSet,
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
