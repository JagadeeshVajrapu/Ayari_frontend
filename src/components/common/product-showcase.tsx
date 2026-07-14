import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard, type Product } from '@/components/common/product-card';
import { SectionHeading } from '@/components/common/section-heading';
import { ScrollReveal } from '@/components/common/scroll-reveal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductShowcaseProps {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref: string;
  columns?: 2 | 3 | 4;
  bg?: 'default' | 'muted' | 'dark';
  className?: string;
}

export function ProductShowcase({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  columns = 4,
  bg = 'default',
  className,
}: ProductShowcaseProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  const bgStyles = {
    default: 'bg-background',
    muted: 'bg-cream-dark/50',
    dark: 'bg-ink text-cream',
  };

  return (
    <section className={cn('section-padding', bgStyles[bg], className)}>
      <div className="container-premium">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            dark={bg === 'dark'}
          />
          <ScrollReveal delay={0.2}>
            <Button variant={bg === 'dark' ? 'champagne' : 'outline'} asChild>
              <Link href={viewAllHref}>
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>

        <div className={cn('mt-12 grid gap-5 md:gap-8', gridCols[columns])}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
