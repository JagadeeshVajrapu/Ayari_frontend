'use client';

import { useEffect, useState } from 'react';
import { Check, GripVertical, Loader2, Star, X } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { cn } from '@/lib/utils';
import type { ImageUploadItem } from './admin-image-upload-section';

interface AdminImagePreviewCardProps {
  image: ImageUploadItem;
  index: number;
  showPrimary?: boolean;
  disabled?: boolean;
  onRemove: () => void;
  onSetPrimary?: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function formatFileSize(bytes?: number): string {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function AdminImagePreviewCard({
  image,
  index,
  showPrimary = false,
  disabled = false,
  onRemove,
  onSetPrimary,
  onDragStart,
  onDragOver,
  onDragEnd,
}: AdminImagePreviewCardProps) {
  const rawSrc = image.previewUrl || image.url;
  const src = resolveMediaUrl(rawSrc, PRODUCT_PLACEHOLDER);
  const fileName = image.fileName || `Image ${index + 1}`;
  const sizeLabel = formatFileSize(image.fileSize);
  const resolution =
    image.width && image.height ? `${image.width}×${image.height}` : null;
  const isPrimary = Boolean(image.isPrimary) || (showPrimary && index === 0);
  const isUploading = Boolean(image.uploading);
  const isUploaded = Boolean(image.uploaded || (image.url && !image.file));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  return (
    <div
      draggable={!disabled && !isUploading}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:border-foreground/20 hover:shadow-md',
        isPrimary && showPrimary && 'ring-2 ring-brand/50',
        isUploading && 'opacity-90',
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/60 to-muted" />
        )}
        {/* Native img reliably renders blob: and remote preview URLs in admin. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={fileName}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03]',
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0',
          )}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted px-2 text-center text-[10px] text-muted-foreground">
            Preview unavailable
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            <span className="text-[10px] font-medium text-foreground">
              {image.uploadProgress != null ? `${image.uploadProgress}%` : 'Uploading…'}
            </span>
          </div>
        )}

        {isUploaded && !isUploading && (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-md bg-emerald-600/95 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
            <Check className="h-3 w-3" />
            Uploaded
          </span>
        )}

        <div className="absolute top-1.5 left-1.5 flex h-6 w-6 cursor-grab items-center justify-center rounded-md bg-background/85 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {isPrimary && showPrimary && (
          <span className="absolute top-1.5 right-8 inline-flex items-center gap-0.5 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background shadow-sm">
            <Star className="h-3 w-3 fill-current" />
            Primary
          </span>
        )}

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled || isUploading}
          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
          aria-label={`Remove ${fileName}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1 p-2">
        <p className="truncate text-xs font-medium text-foreground" title={fileName}>
          {fileName}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
          {sizeLabel && <span>{sizeLabel}</span>}
          {resolution && <span>{resolution}</span>}
        </div>
        {showPrimary && !isPrimary && onSetPrimary && (
          <button
            type="button"
            onClick={onSetPrimary}
            disabled={disabled || isUploading}
            className="mt-0.5 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
          >
            Set as Primary
          </button>
        )}
      </div>
    </div>
  );
}
