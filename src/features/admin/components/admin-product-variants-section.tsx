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

const OTHER_VARIANT_TYPES: { value: VariantType; label: string }[] = [
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

function createTypedVariant(
  type: VariantType,
  isDefault: boolean,
  defaults?: { price?: string; compareAtPrice?: string },
): AdminVariantFormItem {
  return {
    ...createEmptyAdminVariant(isDefault, defaults),
    variantType: type,
  };
}

export function AdminProductVariantsSection({
  variants,
  disabled = false,
  defaultPrice = '',
  defaultCompareAtPrice = '',
  onChange,
}: AdminProductVariantsSectionProps) {
  const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const colorVariants = variants.filter((v) => v.variantType === 'COLOR');
  const itemVariants = variants.filter((v) => v.variantType === 'SET');
  const otherVariants = variants.filter(
    (v) => v.variantType !== 'COLOR' && v.variantType !== 'SET',
  );

  const defaults = { price: defaultPrice, compareAtPrice: defaultCompareAtPrice };

  const addColour = () => {
    onChange([...variants, createTypedVariant('COLOR', variants.length === 0, defaults)]);
  };

  const addNumberOfItems = () => {
    onChange([...variants, createTypedVariant('SET', variants.length === 0, defaults)]);
  };

  const addOther = () => {
    onChange([...variants, createTypedVariant('SIZE', variants.length === 0, defaults)]);
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

  const renderColourCard = (variant: AdminVariantFormItem, index: number) => (
    <div
      key={variant.clientId}
      className="space-y-3 rounded-lg border border-border bg-background p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Colour {index + 1}</p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="radio"
              name="default-variant"
              checked={variant.isDefault}
              onChange={() => setDefault(variant.clientId)}
              disabled={disabled}
            />
            Default
          </label>
          <button
            type="button"
            onClick={() => removeVariant(variant.clientId)}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove colour"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Colour name (e.g. Blue)"
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          onChange={(e) => updateVariant(variant.clientId, { colorHex: e.target.value })}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      <AdminImageUploadSection
        label="Colour product images"
        description="Required. Photos shown when the customer selects this colour."
        images={variant.productImages}
        min={1}
        max={10}
        enablePrimary
        disabled={disabled}
        onChange={(productImages) => updateVariant(variant.clientId, { productImages })}
      />

      <AdminImageUploadSection
        label="Colour gallery images"
        description="Optional extra angles for this colour only."
        images={variant.galleryImages}
        min={0}
        max={20}
        disabled={disabled}
        onChange={(galleryImages) => updateVariant(variant.clientId, { galleryImages })}
      />

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={variant.isActive}
          onChange={(e) => updateVariant(variant.clientId, { isActive: e.target.checked })}
          disabled={disabled}
          className="rounded border-border"
        />
        Active
      </label>
    </div>
  );

  const renderItemCard = (variant: AdminVariantFormItem, index: number) => (
    <div
      key={variant.clientId}
      className="space-y-3 rounded-lg border border-border bg-background p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Number of Items {index + 1}</p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="radio"
              name="default-variant"
              checked={variant.isDefault}
              onChange={() => setDefault(variant.clientId)}
              disabled={disabled}
            />
            Default
          </label>
          <button
            type="button"
            onClick={() => removeVariant(variant.clientId)}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove number of items"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Items (e.g. 3 or 5)
          </label>
          <Input
            placeholder="3"
            value={variant.name}
            onChange={(e) => updateVariant(variant.clientId, { name: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">SKU</label>
          <Input
            placeholder="Unique SKU"
            value={variant.sku}
            onChange={(e) => updateVariant(variant.clientId, { sku: e.target.value })}
            disabled={disabled}
          />
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
            placeholder="Optional"
            value={variant.price}
            onChange={(e) => updateVariant(variant.clientId, { price: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <label className="flex items-end gap-2 pb-2 text-xs text-muted-foreground">
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

      <AdminImageUploadSection
        label="Pack / number-of-items images"
        description="Upload photos for this count (e.g. Pack of 2 showing two products). Shown when the customer selects this number."
        images={variant.productImages}
        min={0}
        max={10}
        enablePrimary
        disabled={disabled}
        onChange={(productImages) => updateVariant(variant.clientId, { productImages })}
      />

      <AdminImageUploadSection
        label="Extra gallery images"
        description="Optional extra angles for this pack only."
        images={variant.galleryImages}
        min={0}
        max={20}
        disabled={disabled}
        onChange={(galleryImages) => updateVariant(variant.clientId, { galleryImages })}
      />

      <p className="text-[11px] text-muted-foreground">
        Tip: name packs with colour when needed, e.g. &quot;Pack of 2 (Pink)&quot;, so Pink + 2
        shows these photos — not the single-item colour photo.
      </p>
    </div>
  );

  const renderOtherCard = (variant: AdminVariantFormItem, index: number) => (
    <div
      key={variant.clientId}
      className="space-y-3 rounded-lg border border-border bg-background p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">Other option {index + 1}</p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="radio"
              name="default-variant"
              checked={variant.isDefault}
              onChange={() => setDefault(variant.clientId)}
              disabled={disabled}
            />
            Default
          </label>
          <button
            type="button"
            onClick={() => removeVariant(variant.clientId)}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove option"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Option name"
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
            {OTHER_VARIANT_TYPES.map((t) => (
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

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={variant.isActive}
          onChange={(e) => updateVariant(variant.clientId, { isActive: e.target.checked })}
          disabled={disabled}
          className="rounded border-border"
        />
        Active
      </label>
    </div>
  );

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Product variants</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Matches the shop page: add <strong>Colours</strong> (image cards) and{' '}
            <strong>Number of Items</strong> (compact buttons like 3 / 5). Customers pick
            colour + count together when buying.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={addColour}
            disabled={disabled}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add colour
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={addNumberOfItems}
            disabled={disabled}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add number of items
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={addOther}
            disabled={disabled}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Other
          </Button>
        </div>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No variants yet. Add colours (with photos) and number-of-items options (e.g. 3,
          5) so the product page matches the storefront layout.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Colour
            </p>
            {colorVariants.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No colours yet. Add Blue, Pink, etc. with images.
              </p>
            ) : (
              colorVariants.map((variant, index) => renderColourCard(variant, index))
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Number of Items
            </p>
            {itemVariants.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No item counts yet. Add options like 3 or 5 — they appear as buttons on the
                product page.
              </p>
            ) : (
              itemVariants.map((variant, index) => renderItemCard(variant, index))
            )}
          </div>

          {otherVariants.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                Other options
              </p>
              {otherVariants.map((variant, index) => renderOtherCard(variant, index))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
