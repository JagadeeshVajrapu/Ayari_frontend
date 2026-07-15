'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminImagePreviewCard } from './admin-image-preview-card';

export interface ImageUploadItem {
  clientId: string;
  id?: string;
  url: string;
  cloudinaryPublicId: string;
  folder?: string;
  previewUrl?: string;
  file?: File;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  isPrimary?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  uploaded?: boolean;
  error?: string;
}

interface AdminImageUploadSectionProps {
  label: string;
  description: string;
  images: ImageUploadItem[];
  min?: number;
  max?: number;
  /** When true, first / marked image shows Primary badge and Set as Primary. */
  enablePrimary?: boolean;
  onChange: (images: ImageUploadItem[]) => void;
  disabled?: boolean;
}

const ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;

function createClientId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/** First image is always the primary / default display image when enabled. */
function ensurePrimaryFlags(items: ImageUploadItem[], enablePrimary: boolean): ImageUploadItem[] {
  if (!enablePrimary || items.length === 0) {
    return items.map((img) => ({ ...img, isPrimary: false }));
  }
  return items.map((img, index) => ({
    ...img,
    isPrimary: index === 0,
  }));
}

export function AdminImageUploadSection({
  label,
  description,
  images,
  min = 1,
  max = 10,
  enablePrimary = false,
  onChange,
  disabled = false,
}: AdminImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [sectionError, setSectionError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const commit = useCallback(
    (next: ImageUploadItem[]) => {
      onChange(ensurePrimaryFlags(next, enablePrimary));
    },
    [enablePrimary, onChange],
  );

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || disabled) return;
    const list = Array.from(files);
    if (!list.length) return;

    const remaining = max - images.length;
    if (remaining <= 0) {
      setSectionError(`Maximum ${max} images allowed`);
      return;
    }

    setSectionError('');
    const errors: string[] = [];
    const existingKeys = new Set(
      images.map((img) => `${img.fileName ?? ''}:${img.fileSize ?? 0}:${img.url}`),
    );

    const accepted = list.slice(0, remaining);
    if (list.length > remaining) {
      errors.push(`Only ${remaining} more image${remaining === 1 ? '' : 's'} can be added (max ${max})`);
    }

    const pending: ImageUploadItem[] = [];

    for (const file of accepted) {
      if (!ALLOWED_TYPES.has(file.type)) {
        errors.push(`${file.name}: only JPG, JPEG, PNG, and WebP are allowed`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: must be 5 MB or smaller`);
        continue;
      }
      if (file.size === 0) {
        errors.push(`${file.name}: file appears corrupted or empty`);
        continue;
      }

      const dupKey = `${file.name}:${file.size}:`;
      if (
        existingKeys.has(dupKey) ||
        images.some(
          (img) =>
            img.fileName === file.name &&
            img.fileSize === file.size &&
            !img.url,
        ) ||
        pending.some((img) => img.fileName === file.name && img.fileSize === file.size)
      ) {
        errors.push(`${file.name}: already selected`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const dims = await readImageDimensions(file);

      pending.push({
        clientId: createClientId(),
        url: '',
        cloudinaryPublicId: '',
        previewUrl,
        file,
        fileName: file.name,
        fileSize: file.size,
        width: dims?.width,
        height: dims?.height,
        uploaded: false,
      });
    }

    if (errors.length) {
      setSectionError(errors[0]);
    }

    if (!pending.length) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    commit([...images, ...pending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (clientId: string) => {
    const item = images.find((img) => img.clientId === clientId);
    if (item?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
    const next = images.filter((img) => img.clientId !== clientId);
    commit(next);
  };

  const setPrimary = (clientId: string) => {
    if (!enablePrimary) return;
    const index = images.findIndex((img) => img.clientId === clientId);
    if (index < 0) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.unshift({ ...moved, isPrimary: true });
    commit(next.map((img, i) => ({ ...img, isPrimary: i === 0 })));
  };

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;

    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    dragIndexRef.current = index;
    commit(next);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const onDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const onDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    void handleFiles(e.dataTransfer.files);
  };

  const canAdd = images.length < max && !disabled;
  const selectedCount = images.length;

  return (
    <div
      className={cn(
        'rounded-xl border border-dashed bg-muted/30 p-4 transition-colors',
        isDragOver ? 'border-brand bg-brand/5' : 'border-border',
      )}
      onDragOver={onDropZoneDragOver}
      onDragLeave={onDropZoneDragLeave}
      onDrop={onDropZoneDrop}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          <p className="mt-1 text-xs font-medium text-foreground">
            {selectedCount === 0
              ? min > 0
                ? `No images selected · max ${max} · min ${min}`
                : `Optional · max ${max}`
              : `${selectedCount} Image${selectedCount === 1 ? '' : 's'} Selected · max ${max}`}
          </p>
        </div>
        {canAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {sectionError && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {sectionError}
        </p>
      )}

      {images.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Selected Files ({images.length})
          </p>
          <ul className="space-y-1 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2">
            {images.map((img) => (
              <li
                key={`name-${img.clientId}`}
                className="flex items-center gap-1.5 truncate text-xs text-foreground"
              >
                <span className="text-emerald-600">✓</span>
                <span className="truncate">{img.fileName || 'Uploaded image'}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, index) => (
              <AdminImagePreviewCard
                key={img.clientId}
                image={img}
                index={index}
                showPrimary={enablePrimary}
                disabled={disabled}
                onRemove={() => removeImage(img.clientId)}
                onSetPrimary={enablePrimary ? () => setPrimary(img.clientId) : undefined}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
          {canAdd && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50',
                isDragOver && 'border-brand text-foreground',
              )}
            >
              <ImagePlus className="h-4 w-4" />
              Drop more files here or browse
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background py-8 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50',
            isDragOver && 'border-brand bg-brand/5 text-foreground',
          )}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm font-medium">Drag & drop images here</span>
          <span className="text-xs">or click to browse · JPG, PNG, WebP · max 5 MB each</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
