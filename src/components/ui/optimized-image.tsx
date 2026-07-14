import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type OptimizedImageProps = ImageProps & {
  lazy?: boolean;
};

export function OptimizedImage({
  lazy = true,
  priority,
  className,
  alt,
  quality = 75,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      quality={quality}
      loading={priority ? undefined : lazy ? 'lazy' : undefined}
      className={cn(className)}
      priority={priority}
      {...props}
    />
  );
}
