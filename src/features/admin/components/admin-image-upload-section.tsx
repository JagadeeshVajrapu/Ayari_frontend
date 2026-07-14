'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { GripVertical, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveMediaUrl } from '@/lib/media';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { cn } from '@/lib/utils';

export interface ImageUploadItem {
  id?: string;
  url: string;
  cloudinaryPublicId: string;
  previewUrl?: string;
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

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;

    const remaining = max - images.length;
    if (remaining <= 0) return;

    const toUpload = Array.from(files).slice(0, remaining);

    const uploaded: ImageUploadItem[] = [];

    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_SIZE) continue;

      const previewUrl = URL.createObjectURL(file);
      try {
        const { url, publicId } = await onUpload(file);
        uploaded.push({ url, cloudinaryPublicId: publicId, previewUrl });
      } catch {
        URL.revokeObjectURL(previewUrl);
      }
    }

    if (uploaded.length) {
      onChange([...images, ...uploaded]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const item = images[index];
    if (item.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
    onChange(images.filter((_, i) => i !== index));
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

  const canAdd = images.length < max;

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {images.length}/{max} images · minimum {min}
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

      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={img.id ?? img.cloudinaryPublicId ?? index}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted',
                index === 0 && 'ring-2 ring-brand/40',
              )}
            >
              <Image
                src={resolveMediaUrl(img.previewUrl ?? img.url, PRODUCT_PLACEHOLDER)}
                alt={`${label} ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
              <div className="absolute top-1 left-1 flex h-5 w-5 cursor-grab items-center justify-center rounded bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </div>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background disabled:opacity-50"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
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
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
