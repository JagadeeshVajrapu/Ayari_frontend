'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type AdminCategory } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import {
  AdminImageUploadSection,
  type ImageUploadItem,
} from './admin-image-upload-section';
import { AdminProductVariationsSection } from './admin-product-variations-section';
import { cn } from '@/lib/utils';
import type { ColorVariant, SetVariant } from '@/lib/product-variations';

const UPLOAD_CONCURRENCY = 3;

function isPersistableImageUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/uploads/')
  );
}

/** After upload, remap color image picks (blob / clientId) to permanent URLs. */
function resolveColorVariantsAfterUpload(
  colorVariants: ColorVariant[],
  beforeImages: ImageUploadItem[],
  afterImages: ImageUploadItem[],
): ColorVariant[] {
  return colorVariants.map((color) => {
    const byClientId = color.imageClientId
      ? afterImages.find((img) => img.clientId === color.imageClientId)
      : undefined;

    if (byClientId?.url) {
      return {
        ...color,
        imageUrl: byClientId.url,
        imageClientId: undefined,
      };
    }

    if (!color.imageUrl) {
      return { ...color, imageClientId: undefined };
    }

    if (isPersistableImageUrl(color.imageUrl)) {
      return { ...color, imageClientId: undefined };
    }

    const matched = beforeImages.find(
      (img) => img.previewUrl === color.imageUrl || img.url === color.imageUrl,
    );
    if (matched) {
      const uploaded = afterImages.find((img) => img.clientId === matched.clientId);
      if (uploaded?.url) {
        return { ...color, imageUrl: uploaded.url, imageClientId: undefined };
      }
    }

    return { ...color, imageUrl: undefined, imageClientId: undefined };
  });
}

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
  colorVariants: ColorVariant[];
  setVariants: SetVariant[];
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
  colorVariants: [],
  setVariants: [],
  productImages: [],
  featuredImages: [],
});

function mapImages(
  imgs: Array<{
    id: string;
    url: string;
    cloudinaryPublicId?: string | null;
    folder?: string | null;
    isPrimary?: boolean;
    altText?: string | null;
  }>,
): ImageUploadItem[] {
  const sorted = [...imgs].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  return sorted.map((img, index) => {
    const fileName = img.url.split('/').pop()?.split('?')[0] || `image-${index + 1}`;
    return {
      clientId: img.id || `existing-${index}`,
      id: img.id,
      url: img.url,
      cloudinaryPublicId: img.cloudinaryPublicId ?? '',
      folder: img.folder ?? undefined,
      fileName: decodeURIComponent(fileName),
      isPrimary: Boolean(img.isPrimary) || index === 0,
      uploaded: true,
    };
  });
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
  colorVariants?: ColorVariant[] | null;
  setVariants?: SetVariant[] | null;
  images?: Array<{
    id: string;
    url: string;
    cloudinaryPublicId?: string | null;
    folder?: string | null;
    isPrimary?: boolean;
  }>;
  featuredImages?: Array<{
    id: string;
    url: string;
    cloudinaryPublicId?: string | null;
    folder?: string | null;
  }>;
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
    colorVariants: product.colorVariants ?? [],
    setVariants: product.setVariants ?? [],
    productImages: mapImages(product.images ?? []),
    featuredImages: mapImages(product.featuredImages ?? []),
  };
}

type UploadProgressState = {
  phase: 'idle' | 'product' | 'gallery' | 'saving' | 'done';
  current: number;
  total: number;
  message: string;
};

interface AdminProductFormModalProps {
  title: string;
  form: ProductFormValues;
  categories: AdminCategory[];
  lockCategory?: boolean;
  onChange: (form: ProductFormValues | ((prev: ProductFormValues) => ProductFormValues)) => void;
  onClose: () => void;
  onSave: (payload: ReturnType<typeof buildProductPayload>) => Promise<void>;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onItemDone?: (completed: number, total: number) => void,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let completed = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index);
      completed += 1;
      onItemDone?.(completed, items.length);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(runners);
  return results;
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
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    phase: 'idle',
    current: 0,
    total: 0,
    message: '',
  });

  const uploadPendingImages = async (
    images: ImageUploadItem[],
    type: 'product' | 'gallery',
    categoryName: string,
    productName: string,
    patchImages: (updater: (prev: ImageUploadItem[]) => ImageUploadItem[]) => void,
  ): Promise<ImageUploadItem[]> => {
    const pendingIndexes = images
      .map((img, index) => ({ img, index }))
      .filter(({ img }) => Boolean(img.file) && !img.url);

    if (!pendingIndexes.length) return images;

    const phase = type === 'product' ? 'product' : 'gallery';
    setUploadProgress({
      phase,
      current: 0,
      total: pendingIndexes.length,
      message:
        type === 'product'
          ? 'Uploading Product Images'
          : 'Uploading Gallery Images',
    });

    patchImages((prev) =>
      prev.map((img) =>
        img.file && !img.url ? { ...img, uploading: true, uploadProgress: 0 } : img,
      ),
    );

    const { adminService } = await import('@/services/admin.service');
    const uploadedByClientId = new Map<
      string,
      { url: string; publicId: string; folder: string }
    >();

    await mapWithConcurrency(
      pendingIndexes,
      UPLOAD_CONCURRENCY,
      async ({ img }) => {
        if (!img.file) return;
        const { data } = await adminService.uploadProductImage(img.file, {
          type,
          categoryName,
          productName,
        });
        uploadedByClientId.set(img.clientId, {
          url: data.data.url,
          publicId: data.data.publicId,
          folder: data.data.folder,
        });
      },
      (completed, total) => {
        setUploadProgress({
          phase,
          current: completed,
          total,
          message:
            type === 'product'
              ? `Uploading Product Images · Image ${completed} of ${total}`
              : `Uploading Gallery Images · Image ${completed} of ${total}`,
        });
      },
    );

    const next = images.map((img) => {
      const uploaded = uploadedByClientId.get(img.clientId);
      if (!uploaded) return { ...img, uploading: false };
      if (img.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
      return {
        ...img,
        url: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
        folder: uploaded.folder,
        file: undefined,
        previewUrl: undefined,
        uploading: false,
        uploadProgress: 100,
        uploaded: true,
      };
    });

    patchImages(() => next);
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.productImages.length < 1) {
      setError('Add at least one product image');
      return;
    }
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!form.categoryId) {
      setError('Select a category');
      return;
    }
    if (
      form.compareAtPrice &&
      Number(form.compareAtPrice) > 0 &&
      Number(form.compareAtPrice) <= Number(form.price)
    ) {
      setError('M.R.P. must be higher than the discount price');
      return;
    }

    const categoryName =
      categories.find((c) => c.id === form.categoryId)?.name ?? 'uncategorized';

    setSaving(true);
    setError('');

    try {
      const beforeProductImages = form.productImages;
      let productImages = form.productImages;
      let featuredImages = form.featuredImages;

      productImages = await uploadPendingImages(
        productImages,
        'product',
        categoryName,
        form.name,
        (updater) =>
          onChange((prev) => ({
            ...prev,
            productImages: updater(prev.productImages),
          })),
      );

      featuredImages = await uploadPendingImages(
        featuredImages,
        'gallery',
        categoryName,
        form.name,
        (updater) =>
          onChange((prev) => ({
            ...prev,
            featuredImages: updater(prev.featuredImages),
          })),
      );

      const missingProduct = productImages.some((img) => !img.url);
      const missingGallery = featuredImages.some((img) => !img.url);
      if (missingProduct || missingGallery) {
        throw new Error('Some images failed to upload. Please retry.');
      }

      const colorVariants = resolveColorVariantsAfterUpload(
        form.colorVariants,
        beforeProductImages,
        productImages,
      );

      onChange((prev) => ({
        ...prev,
        productImages,
        featuredImages,
        colorVariants,
      }));

      setUploadProgress({
        phase: 'saving',
        current: 1,
        total: 1,
        message: 'Saving product…',
      });

      await onSave(
        buildProductPayload({
          ...form,
          productImages,
          featuredImages,
          colorVariants,
        }),
      );

      setUploadProgress({
        phase: 'done',
        current: 1,
        total: 1,
        message: 'Uploaded Successfully',
      });
    } catch (err) {
      setUploadProgress({ phase: 'idle', current: 0, total: 0, message: '' });
      onChange((prev) => ({
        ...prev,
        productImages: prev.productImages.map((img) => ({
          ...img,
          uploading: false,
          uploadProgress: img.url ? 100 : undefined,
        })),
        featuredImages: prev.featuredImages.map((img) => ({
          ...img,
          uploading: false,
          uploadProgress: img.url ? 100 : undefined,
        })),
      }));
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving;
  const progressPercent =
    uploadProgress.total > 0
      ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
      : uploadProgress.phase === 'saving' || uploadProgress.phase === 'done'
        ? 100
        : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        <h2 className="font-display text-xl text-foreground">{title}</h2>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {uploadProgress.phase !== 'idle' && (
          <div className="mt-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-foreground">{uploadProgress.message}</p>
              {uploadProgress.phase === 'done' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  uploadProgress.phase === 'done' ? 'bg-emerald-600' : 'bg-foreground',
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {uploadProgress.phase !== 'done' && uploadProgress.phase !== 'saving' && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Image {uploadProgress.current} of {uploadProgress.total}
              </p>
            )}
            {uploadProgress.phase === 'done' && (
              <p className="mt-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                ✓ Uploaded Successfully
              </p>
            )}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <AdminImageUploadSection
            label="Product Images"
            description="Catalog images used in shop listings and cards. Drag to reorder. First / Primary image is the default display."
            images={form.productImages}
            min={1}
            max={10}
            enablePrimary
            disabled={saving}
            onChange={(productImages) => onChange((prev) => ({ ...prev, productImages }))}
          />

          <AdminImageUploadSection
            label="Gallery Images"
            description="Optional. Extra images shown on the product details page. Add only if needed — drag to reorder."
            images={form.featuredImages}
            min={0}
            max={20}
            disabled={saving}
            onChange={(featuredImages) => onChange((prev) => ({ ...prev, featuredImages }))}
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
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">Pricing</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Discount price is what customers pay. M.R.P. is shown crossed out when it is higher.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Discount Price (INR) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 299"
                  value={form.price}
                  onChange={(e) => onChange({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  M.R.P. (INR)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={form.compareAtPrice}
                  onChange={(e) => onChange({ ...form, compareAtPrice: e.target.value })}
                />
              </div>
            </div>
            {form.price &&
              form.compareAtPrice &&
              Number(form.compareAtPrice) > Number(form.price) && (
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                  {Math.round(
                    ((Number(form.compareAtPrice) - Number(form.price)) /
                      Number(form.compareAtPrice)) *
                      100,
                  )}
                  % off — M.R.P. {form.compareAtPrice} → Discount {form.price}
                </p>
              )}
          </div>
          <Input
            type="number"
            min="0"
            placeholder="Stock quantity"
            value={form.stockQuantity}
            onChange={(e) => onChange({ ...form, stockQuantity: e.target.value })}
            required
          />

          <AdminProductVariationsSection
            colorVariants={form.colorVariants}
            setVariants={form.setVariants}
            productImages={form.productImages}
            onColorChange={(colorVariants) => onChange((prev) => ({ ...prev, colorVariants }))}
            onSetChange={(setVariants) => onChange((prev) => ({ ...prev, setVariants }))}
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
            {isBusy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadProgress.phase === 'saving' ? 'Saving…' : 'Uploading…'}
              </span>
            ) : (
              'Save Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function buildProductPayload(form: ProductFormValues) {
  const toPayload = (imgs: ImageUploadItem[], withPrimary = false) =>
    imgs
      .filter((img) => img.url)
      .map((img, sortOrder) => ({
        ...(img.id ? { id: img.id } : {}),
        url: img.url,
        ...(img.cloudinaryPublicId ? { cloudinaryPublicId: img.cloudinaryPublicId } : {}),
        ...(img.folder ? { folder: img.folder } : {}),
        sortOrder,
        ...(withPrimary ? { isPrimary: Boolean(img.isPrimary) || sortOrder === 0 } : {}),
      }));

  return {
    name: form.name,
    sku: form.sku,
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    categoryId: form.categoryId,
    description: form.description || undefined,
    compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
    sizes: [],
    colorVariants: form.colorVariants
      .filter((c) => c.name.trim())
      .map((c) => ({
        id: c.id,
        name: c.name.trim(),
        ...(c.hex ? { hex: c.hex } : {}),
        ...(c.price != null && !Number.isNaN(c.price) ? { price: c.price } : {}),
        ...(c.compareAtPrice != null && !Number.isNaN(c.compareAtPrice)
          ? { compareAtPrice: c.compareAtPrice }
          : {}),
        imageUrl:
          c.imageUrl && isPersistableImageUrl(c.imageUrl) ? c.imageUrl : undefined,
      })),
    setVariants: form.setVariants
      .filter((s) => s.name.trim())
      .map((s) => ({
        id: s.id,
        name: s.name.trim(),
        ...(s.label?.trim() ? { label: s.label.trim() } : {}),
        ...(s.price != null && !Number.isNaN(s.price) ? { price: s.price } : {}),
        ...(s.compareAtPrice != null && !Number.isNaN(s.compareAtPrice)
          ? { compareAtPrice: s.compareAtPrice }
          : {}),
      })),
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    productImages: toPayload(form.productImages, true),
    featuredImages: toPayload(form.featuredImages, false),
  };
}
