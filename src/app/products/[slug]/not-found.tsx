import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
  return (
    <div className="container-premium flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-4xl text-foreground">Product Not Found</h1>
      <p className="mt-3 text-ink-muted">The product you&apos;re looking for doesn&apos;t exist.</p>
      <Button variant="default" className="mt-8" asChild>
        <Link href="/shop">Back to Shop</Link>
      </Button>
    </div>
  );
}
