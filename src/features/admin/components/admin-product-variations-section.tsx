'use client';

import { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createVariantId, type ColorVariant, type SetVariant } from '@/lib/product-variations';
import { resolveMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import type { ImageUploadItem } from './admin-image-upload-section';

interface AdminProductVariationsSectionProps {
  colorVariants: ColorVariant[];
  setVariants: SetVariant[];
  productImages: ImageUploadItem[];
  onColorChange: (variants: ColorVariant[]) => void;
  onSetChange: (variants: SetVariant[]) => void;
}

const DEFAULT_HEX = '#9ca3af';

function isPersistableImageUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/uploads/')
  );
}

export function AdminProductVariationsSection({
  colorVariants,
  setVariants,
  productImages,
  onColorChange,
  onSetChange,
}: AdminProductVariationsSectionProps) {
  const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const imageOptions = productImages
    .filter((img) => isPersistableImageUrl(img.url) || img.previewUrl)
    .map((img) => ({
      clientId: img.clientId,
      label: img.fileName || 'Image',
      value: isPersistableImageUrl(img.url) ? img.url : img.previewUrl || '',
      isPreviewOnly: !isPersistableImageUrl(img.url),
      preview: resolveMediaUrl(img.previewUrl || img.url, ''),
    }));

  const addColor = () => {
    onColorChange([
      ...colorVariants,
      { id: createVariantId('color'), name: '', hex: DEFAULT_HEX },
    ]);
  };

  const addSet = () => {
    onSetChange([
      ...setVariants,
      { id: createVariantId('set'), name: '', label: '' },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Color variations</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Image cards on the product page. Color name, swatch, price, and linked photo are saved with the product.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={addColor}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add color
          </Button>
        </div>

        {colorVariants.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No color options yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {colorVariants.map((color, index) => (
              <div
                key={color.id}
                className="space-y-3 rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">Color {index + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      onColorChange(colorVariants.filter((c) => c.id !== color.id))
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove color"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Input
                  placeholder="Color name (e.g. Black, Santorini Blue)"
                  value={color.name}
                  onChange={(e) =>
                    onColorChange(
                      colorVariants.map((c) =>
                        c.id === color.id ? { ...c, name: e.target.value } : c,
                      ),
                    )
                  }
                />

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-muted-foreground">Swatch</span>
                  <button
                    type="button"
                    onClick={() => colorInputRefs.current[color.id]?.click()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: color.hex ?? DEFAULT_HEX }}
                    aria-label="Pick swatch color"
                  />
                  <input
                    ref={(el) => {
                      colorInputRefs.current[color.id] = el;
                    }}
                    type="color"
                    value={color.hex ?? DEFAULT_HEX}
                    onChange={(e) =>
                      onColorChange(
                        colorVariants.map((c) =>
                          c.id === color.id ? { ...c, hex: e.target.value } : c,
                        ),
                      )
                    }
                    className="sr-only"
                    tabIndex={-1}
                  />
                </div>

                {imageOptions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Link product image (optional)</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        onClick={() =>
                          onColorChange(
                            colorVariants.map((c) =>
                              c.id === color.id
                                ? { ...c, imageUrl: undefined, imageClientId: undefined }
                                : c,
                            ),
                          )
                        }
                        className={cn(
                          'flex aspect-square items-center justify-center rounded-lg border-2 text-[10px] text-muted-foreground',
                          !color.imageUrl && !color.imageClientId
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-border bg-muted/40',
                        )}
                      >
                        Swatch only
                      </button>
                      {imageOptions.map((opt) => {
                        const selected =
                          color.imageClientId === opt.clientId ||
                          color.imageUrl === opt.value;
                        return (
                          <button
                            key={opt.clientId}
                            type="button"
                            title={opt.label}
                            onClick={() =>
                              onColorChange(
                                colorVariants.map((c) =>
                                  c.id === color.id
                                    ? {
                                        ...c,
                                        imageUrl: opt.value,
                                        imageClientId: opt.clientId,
                                      }
                                    : c,
                                ),
                              )
                            }
                            className={cn(
                              'relative aspect-square overflow-hidden rounded-lg border-2',
                              selected
                                ? 'border-blue-600 ring-2 ring-blue-600/30'
                                : 'border-border',
                              opt.isPreviewOnly && 'opacity-80',
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={opt.preview}
                              alt={opt.label}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                    {(color.imageUrl?.startsWith('blob:') ||
                      (color.imageClientId &&
                        imageOptions.find((o) => o.clientId === color.imageClientId)
                          ?.isPreviewOnly)) && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        Image will upload when you save — the color will keep this photo link.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Add product images above to link a photo to each color.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Discount price (optional)"
                    value={color.price ?? ''}
                    onChange={(e) =>
                      onColorChange(
                        colorVariants.map((c) =>
                          c.id === color.id
                            ? {
                                ...c,
                                price: e.target.value ? Number(e.target.value) : undefined,
                              }
                            : c,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="M.R.P. (optional)"
                    value={color.compareAtPrice ?? ''}
                    onChange={(e) =>
                      onColorChange(
                        colorVariants.map((c) =>
                          c.id === color.id
                            ? {
                                ...c,
                                compareAtPrice: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }
                            : c,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Set / pack variations</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              e.g. Single, Set of 2, Black &amp; White combo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={addSet}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add set
          </Button>
        </div>

        {setVariants.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No set options yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {setVariants.map((set, index) => (
              <div
                key={set.id}
                className="space-y-2 rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">Set {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => onSetChange(setVariants.filter((s) => s.id !== set.id))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove set"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Set name (e.g. Set of 2)"
                    value={set.name}
                    onChange={(e) =>
                      onSetChange(
                        setVariants.map((s) =>
                          s.id === set.id ? { ...s, name: e.target.value } : s,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Label (e.g. 2 items)"
                    value={set.label ?? ''}
                    onChange={(e) =>
                      onSetChange(
                        setVariants.map((s) =>
                          s.id === set.id ? { ...s, label: e.target.value } : s,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Discount price (optional)"
                    value={set.price ?? ''}
                    onChange={(e) =>
                      onSetChange(
                        setVariants.map((s) =>
                          s.id === set.id
                            ? {
                                ...s,
                                price: e.target.value ? Number(e.target.value) : undefined,
                              }
                            : s,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="M.R.P. (optional)"
                    value={set.compareAtPrice ?? ''}
                    onChange={(e) =>
                      onSetChange(
                        setVariants.map((s) =>
                          s.id === set.id
                            ? {
                                ...s,
                                compareAtPrice: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }
                            : s,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
