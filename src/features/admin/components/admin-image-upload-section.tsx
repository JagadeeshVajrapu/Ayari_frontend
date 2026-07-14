'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { GripVertical, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveMediaUrl } from '@/lib/media';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { cn } from '@/lib/utils';

export interface ImageUploadItem {
  clientId: string;
  id?: string;
  url: string;
  cloudinaryPublicId: string;
  previewUrl?: string;
  uploading?: boolean;
  error?: string;
}

interface AdminImageUploadSectionProps {
  label: string;
  description: string;
  images: ImageUploadItem[];
  min?: number;
  max?: number;
  onChange: (images: ImageUploadItem[]) => void;
  onUpload: (file: File) => Promise<{ url: string; publicId: string }>;
  disabled?: boolean;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
const MAX_SIZE = 5 * 1024 * 1024;

function createClientId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getUploadErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr.message) return axiosErr.message;
  }
  return 'Upload failed. Check Cloudinary config and try again.';
}

export function AdminImageUploadSection({
  label,
  description,
  images,
  min = 1,
  max = 10,
  onChange,
  onUpload,
  disabled = false,
}: AdminImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [sectionError, setSectionError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;

    const remaining = max - images.length;
    if (remaining <= 0) {
      setSectionError(`Maximum ${max} images allowed`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setSectionError('');

    const pending: ImageUploadItem[] = [];
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) {
        setSectionError('Only image files are allowed (JPEG, PNG, WebP, GIF, AVIF)');
        continue;
      }
      if (file.size > MAX_SIZE) {
        setSectionError('Each image must be 5MB or smaller');
        continue;
      }

      pending.push({
        clientId: createClientId(),
        url: '',
        cloudinaryPublicId: '',
        previewUrl: URL.createObjectURL(file),
        uploading: true,
      });
    }

    if (!pending.length) return;

    // Show placeholders immediately so the admin sees selected images
    let working = [...images, ...pending];
    onChange(working);

    const filesForPending = toUpload.filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > MAX_SIZE) return false;
      return true;
    });

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      const file = filesForPending[i];
      if (!file) continue;

      try {
        const { url, publicId } = await onUpload(file);
        working = working.map((img) =>
          img.clientId === item.clientId
            ? {
                ...img,
                url,
                cloudinaryPublicId: publicId,
                uploading: false,
                error: undefined,
              }
            : img,
        );
        onChange(working);
      } catch (err) {
        const message = getUploadErrorMessage(err);
        setSectionError(message);
        working = working.filter((img) => img.clientId !== item.clientId);
        if (item.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
        onChange(working);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (clientId: string) => {
    const item = images.find((img) => img.clientId === clientId);
    if (item?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
    onChange(images.filter((img) => img.clientId !== clientId));
  };

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;

    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    dragIndexRef.current = index;
    onChange(next);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const canAdd = images.length < max && !disabled;
  const readyCount = images.filter((img) => !img.uploading && img.url).length;

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {readyCount}/{max} images · minimum {min}
            {images.some((img) => img.uploading) ? ' · uploading…' : ''}
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
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, index) => {
            const src = resolveMediaUrl(img.previewUrl || img.url, PRODUCT_PLACEHOLDER);
            return (
              <div
                key={img.clientId}
                draggable={!disabled && !img.uploading}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted',
                  index === 0 && 'ring-2 ring-brand/40',
                  img.uploading && 'opacity-80',
                )}
              >
                <Image
                  src={src}
                  alt={`${label} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                  </div>
                )}
                <div className="absolute top-1 left-1 flex h-5 w-5 cursor-grab items-center justify-center rounded bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>
                {index === 0 && !img.uploading && (
                  <span className="absolute bottom-1 left-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.clientId)}
                  disabled={disabled}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background disabled:opacity-50"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background py-8 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm">Click to upload images</span>
          <span className="text-xs">Preview appears here after selection</span>
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
