'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type AdminCategory } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import {
  AdminImageUploadSection,
  type ImageUploadItem,
} from './admin-image-upload-section';
import { cn } from '@/lib/utils';

const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export interface ProductFormValues {
  name: string;
  sku: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  description: string;
  /** Stored as compareAtPrice in API — displayed as MRP in UI */
  compareAtPrice: string;
  isActive: boolean;
  isFeatured: boolean;
  sizes: string[];
  productImages: ImageUploadItem[];
  featuredImages: ImageUploadItem[];
}

export const emptyProductForm = (categoryId = ''): ProductFormValues => ({
  name: '',
  sku: '',
  price: '',
  stockQuantity: '0',
  categoryId,
  description: '',
  compareAtPrice: '',
  isActive: true,
  isFeatured: false,
  sizes: ['S', 'M', 'L', 'XL'],
  productImages: [],
  featuredImages: [],
});

function mapImages(
  imgs: Array<{ id: string; url: string; cloudinaryPublicId?: string | null }>,
): ImageUploadItem[] {
  return imgs.map((img, index) => ({
    clientId: img.id || `existing-${index}`,
    id: img.id,
    url: img.url,
    cloudinaryPublicId: img.cloudinaryPublicId ?? '',
  }));
}

export function productToFormValues(product: {
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  description: string | null;
  compareAtPrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sizes?: string[] | null;
  images?: Array<{ id: string; url: string; cloudinaryPublicId?: string | null }>;
  featuredImages?: Array<{ id: string; url: string; cloudinaryPublicId?: string | null }>;
}): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
    categoryId: product.categoryId,
    description: product.description ?? '',
    compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    sizes: product.sizes?.length ? product.sizes : [],
    productImages: mapImages(product.images ?? []),
    featuredImages: mapImages(product.featuredImages ?? []),
  };
}

interface AdminProductFormModalProps {
  title: string;
  form: ProductFormValues;
  categories: AdminCategory[];
  lockCategory?: boolean;
  onChange: (form: ProductFormValues | ((prev: ProductFormValues) => ProductFormValues)) => void;
  onClose: () => void;
  onSave: (payload: ReturnType<typeof buildProductPayload>) => Promise<void>;
}

export function AdminProductFormModal({
  title,
  form,
  categories,
  lockCategory = false,
  onChange,
  onClose,
  onSave,
}: AdminProductFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState('');
  const [customSize, setCustomSize] = useState('');

  const uploadProductImage = async (file: File) => {
    setUploadingCount((c) => c + 1);
    try {
      const { adminService } = await import('@/services/admin.service');
      const { data } = await adminService.uploadProductImage(file, 'product');
      return { url: data.data.url, publicId: data.data.publicId };
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    } finally {
      setUploadingCount((c) => Math.max(0, c - 1));
    }
  };

  const uploadFeaturedImage = async (file: File) => {
    setUploadingCount((c) => c + 1);
    try {
      const { adminService } = await import('@/services/admin.service');
      const { data } = await adminService.uploadProductImage(file, 'featured');
      return { url: data.data.url, publicId: data.data.publicId };
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    } finally {
      setUploadingCount((c) => Math.max(0, c - 1));
    }
  };

  const toggleSize = (size: string) => {
    onChange((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addCustomSize = () => {
    const value = customSize.trim();
    if (!value) return;
    onChange((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(value) ? prev.sizes : [...prev.sizes, value],
    }));
    setCustomSize('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.productImages.some((img) => img.uploading) || form.featuredImages.some((img) => img.uploading)) {
      setError('Please wait for image uploads to finish');
      return;
    }

    const readyProductImages = form.productImages.filter((img) => img.url);
    const readyFeaturedImages = form.featuredImages.filter((img) => img.url);

    if (readyProductImages.length < 1) {
      setError('Add at least one product image');
      return;
    }
    if (readyFeaturedImages.length < 1) {
      setError('Add at least one featured gallery image');
      return;
    }
    if (form.sizes.length < 1) {
      setError('Select at least one size');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(
        buildProductPayload({
          ...form,
          productImages: readyProductImages,
          featuredImages: readyFeaturedImages,
        }),
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || uploadingCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        <h2 className="font-display text-xl text-foreground">{title}</h2>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <AdminImageUploadSection
            label="Product Images"
            description="Main catalog photos used in shop listings. Shown first on the product page. Drag to reorder."
            images={form.productImages}
            min={1}
            max={10}
            disabled={saving}
            onChange={(productImages) => onChange((prev) => ({ ...prev, productImages }))}
            onUpload={uploadProductImage}
          />

          <AdminImageUploadSection
            label="Featured Images (Gallery)"
            description="Extra gallery photos shown under the main image on the product page. Drag to reorder."
            images={form.featuredImages}
            min={1}
            max={10}
            disabled={saving}
            onChange={(featuredImages) => onChange((prev) => ({ ...prev, featuredImages }))}
            onUpload={uploadFeaturedImage}
          />

          <Input
            placeholder="Product name"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => onChange({ ...form, sku: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Selling price (INR)"
              value={form.price}
              onChange={(e) => onChange({ ...form, price: e.target.value })}
              required
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="M.R.P. (optional)"
              value={form.compareAtPrice}
              onChange={(e) => onChange({ ...form, compareAtPrice: e.target.value })}
            />
          </div>
          <Input
            type="number"
            min="0"
            placeholder="Stock quantity"
            value={form.stockQuantity}
            onChange={(e) => onChange({ ...form, stockQuantity: e.target.value })}
            required
          />

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">Available sizes</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Customers pick a size on the product page. Selected: {form.sizes.join(', ') || 'none'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEFAULT_SIZE_OPTIONS.map((size) => {
                const selected = form.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                      selected
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground/40',
                    )}
                  >
                    {size}
                  </button>
                );
              })}
              {form.sizes
                .filter((s) => !DEFAULT_SIZE_OPTIONS.includes(s))
                .map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className="rounded-lg border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                  >
                    {size} ×
                  </button>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Custom size (e.g. 32, One Size)"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSize();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomSize}>
                Add
              </Button>
            </div>
          </div>

          <select
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            value={form.categoryId}
            onChange={(e) => onChange({ ...form, categoryId: e.target.value })}
            required
            disabled={lockCategory}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
                className="rounded border-border"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => onChange({ ...form, isFeatured: e.target.checked })}
                className="rounded border-border"
              />
              Featured
            </label>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" variant="default" className="flex-1" disabled={isBusy}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function buildProductPayload(form: ProductFormValues) {
  const toPayload = (imgs: ImageUploadItem[]) =>
    imgs
      .filter((img) => img.url)
      .map((img, sortOrder) => ({
        ...(img.id ? { id: img.id } : {}),
        url: img.url,
        ...(img.cloudinaryPublicId ? { cloudinaryPublicId: img.cloudinaryPublicId } : {}),
        sortOrder,
      }));

  return {
    name: form.name,
    sku: form.sku,
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    categoryId: form.categoryId,
    description: form.description || undefined,
    compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
    sizes: form.sizes,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    productImages: toPayload(form.productImages),
    featuredImages: toPayload(form.featuredImages),
  };
}
