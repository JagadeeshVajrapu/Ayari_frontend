import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/seo';

export function ContentPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="section-padding pt-8">
      <div className="container-premium">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.2em] text-champagne-dark uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-display-md text-foreground">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{description}</p>
        </div>
        <div className="mt-10 max-w-3xl space-y-8 text-sm leading-relaxed text-ink-muted sm:text-base">
          {children}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button variant="champagne" asChild>
            <Link href="/shop">Shop Collections</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export const aboutMetadata = createPageMetadata({
  title: 'About Ayari',
  description: 'Learn about Ayari Creations — handmade décor and gifts crafted with care.',
  path: '/about',
});
