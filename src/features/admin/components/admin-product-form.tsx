'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminService, type AdminCategory } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import {
  AdminImageUploadSection,
  type ImageUploadItem,
} from './admin-image-upload-section';

export interface ProductFormValues {
  name: string;
  sku: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  description: string;
  compareAtPrice: string;
  isActive: boolean;
  isFeatured: boolean;
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
  productImages: [],
  featuredImages: [],
});

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
  images?: Array<{ id: string; url: string; cloudinaryPublicId?: string | null }>;
  featuredImages?: Array<{ id: string; url: string; cloudinaryPublicId?: string | null }>;
}): ProductFormValues {
  const mapImages = (
    imgs: Array<{ id: string; url: string; cloudinaryPublicId?: string | null }>,
  ): ImageUploadItem[] =>
    imgs.map((img) => ({
      id: img.id,
      url: img.url,
      cloudinaryPublicId: img.cloudinaryPublicId ?? '',
    }));

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
    productImages: mapImages(product.images ?? []),
    featuredImages: mapImages(product.featuredImages ?? []),
  };
}

interface AdminProductFormModalProps {
  title: string;
  form: ProductFormValues;
  categories: AdminCategory[];
  lockCategory?: boolean;
  onChange: (form: ProductFormValues) => void;
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadProductImage = async (file: File) => {
    setUploading(true);
    try {
      const { data } = await adminService.uploadProductImage(file, 'product');
      return { url: data.data.url, publicId: data.data.publicId };
    } finally {
      setUploading(false);
    }
  };

  const uploadFeaturedImage = async (file: File) => {
    setUploading(true);
    try {
      const { data } = await adminService.uploadProductImage(file, 'featured');
      return { url: data.data.url, publicId: data.data.publicId };
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.productImages.length < 1) {
      setError('Add at least one product image');
      return;
    }
    if (form.featuredImages.length < 1) {
      setError('Add at least one featured gallery image');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(buildProductPayload(form));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || uploading;

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
            description="Catalog images used in shop listings and cards. Drag to reorder."
            images={form.productImages}
            min={1}
            max={10}
            disabled={isBusy}
            onChange={(productImages) => onChange({ ...form, productImages })}
            onUpload={uploadProductImage}
          />

          <AdminImageUploadSection
            label="Featured Images (Gallery)"
            description="Gallery images shown on the product details page. Drag to reorder."
            images={form.featuredImages}
            min={1}
            max={10}
            disabled={isBusy}
            onChange={(featuredImages) => onChange({ ...form, featuredImages })}
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
              placeholder="Price (INR)"
              value={form.price}
              onChange={(e) => onChange({ ...form, price: e.target.value })}
              required
            />
            <Input
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stockQuantity}
              onChange={(e) => onChange({ ...form, stockQuantity: e.target.value })}
              required
            />
          </div>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Compare at price (optional)"
            value={form.compareAtPrice}
            onChange={(e) => onChange({ ...form, compareAtPrice: e.target.value })}
          />
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
    imgs.map((img, sortOrder) => ({
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
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    productImages: toPayload(form.productImages),
    featuredImages: toPayload(form.featuredImages),
  };
}
