'use client';

import { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createEmptyAdminVariant,
  type AdminVariantFormItem,
  type VariantType,
} from '@/lib/product-variations';
import { AdminImageUploadSection } from './admin-image-upload-section';

const DEFAULT_HEX = '#9ca3af';

const VARIANT_TYPES: { value: VariantType; label: string }[] = [
  { value: 'COLOR', label: 'Color' },
  { value: 'SET', label: 'Set / Pack' },
  { value: 'SIZE', label: 'Size' },
  { value: 'OTHER', label: 'Other' },
];

interface AdminProductVariantsSectionProps {
  variants: AdminVariantFormItem[];
  disabled?: boolean;
  /** Prefill new variants with product discount / MRP */
  defaultPrice?: string;
  defaultCompareAtPrice?: string;
  onChange: (variants: AdminVariantFormItem[]) => void;
}

export function AdminProductVariantsSection({
  variants,
  disabled = false,
  defaultPrice = '',
  defaultCompareAtPrice = '',
  onChange,
}: AdminProductVariantsSectionProps) {
  const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addVariant = () => {
    onChange([
      ...variants,
      createEmptyAdminVariant(variants.length === 0, {
        price: defaultPrice,
        compareAtPrice: defaultCompareAtPrice,
      }),
    ]);
  };

  const updateVariant = (clientId: string, patch: Partial<AdminVariantFormItem>) => {
    onChange(variants.map((v) => (v.clientId === clientId ? { ...v, ...patch } : v)));
  };

  const removeVariant = (clientId: string) => {
    const next = variants.filter((v) => v.clientId !== clientId);
    if (next.length && !next.some((v) => v.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  const setDefault = (clientId: string) => {
    onChange(variants.map((v) => ({ ...v, isDefault: v.clientId === clientId })));
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Product variants</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Like Amazon / Flipkart: one product, multiple colors. Each option has its own SKU,
            stock, price, and images. Shop shows one card; customers pick the option on the
            product page.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={addVariant}
          disabled={disabled}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No variants yet. Add a color (or set) with images, SKU, and stock for each option.
        </p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.clientId}
              className="space-y-3 rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">Variant {index + 1}</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="radio"
                      name="default-variant"
                      checked={variant.isDefault}
                      onChange={() => setDefault(variant.clientId)}
                      disabled={disabled}
                    />
                    Default (listing)
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.clientId)}
                    disabled={disabled}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Color / option name (e.g. Black)"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.clientId, { name: e.target.value })}
                  disabled={disabled}
                />
                <Input
                  placeholder="Variant SKU (unique)"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.clientId, { sku: e.target.value })}
                  disabled={disabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                  <select
                    value={variant.variantType}
                    onChange={(e) =>
                      updateVariant(variant.clientId, {
                        variantType: e.target.value as VariantType,
                      })
                    }
                    disabled={disabled}
                    className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
                  >
                    {VARIANT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={variant.stockQuantity}
                    onChange={(e) =>
                      updateVariant(variant.clientId, { stockQuantity: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Price (INR)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Product price if empty"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.clientId, { price: e.target.value })}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">M.R.P.</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.compareAtPrice}
                    onChange={(e) =>
                      updateVariant(variant.clientId, { compareAtPrice: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>

              {variant.variantType === 'COLOR' && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Swatch</span>
                  <button
                    type="button"
                    onClick={() => colorInputRefs.current[variant.clientId]?.click()}
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border-2 border-border"
                    style={{ backgroundColor: variant.colorHex ?? DEFAULT_HEX }}
                    aria-label="Pick swatch color"
                  />
                  <input
                    ref={(el) => {
                      colorInputRefs.current[variant.clientId] = el;
                    }}
                    type="color"
                    value={variant.colorHex ?? DEFAULT_HEX}
                    onChange={(e) =>
                      updateVariant(variant.clientId, { colorHex: e.target.value })
                    }
                    className="sr-only"
                    tabIndex={-1}
                  />
                </div>
              )}

              <AdminImageUploadSection
                label="Variant product images"
                description="Required. Main photos for this color — shown when the customer selects it."
                images={variant.productImages}
                min={1}
                max={10}
                enablePrimary
                disabled={disabled}
                onChange={(productImages) =>
                  updateVariant(variant.clientId, { productImages })
                }
              />

              <AdminImageUploadSection
                label="Variant gallery images"
                description="Optional extra angles for this color only."
                images={variant.galleryImages}
                min={0}
                max={20}
                disabled={disabled}
                onChange={(galleryImages) =>
                  updateVariant(variant.clientId, { galleryImages })
                }
              />

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={(e) =>
                    updateVariant(variant.clientId, { isActive: e.target.checked })
                  }
                  disabled={disabled}
                  className="rounded border-border"
                />
                Active
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
