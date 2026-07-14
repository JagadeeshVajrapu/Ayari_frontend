import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/common/product-card';
import { SectionHeading } from '@/components/common/section-heading';
import { ScrollReveal } from '@/components/common/scroll-reveal';
import { Button } from '@/components/ui/button';
import { fetchProducts } from '@/lib/server-catalog';
import { mapListingToCard } from '@/lib/catalog-mappers';

interface CatalogProductsSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  featured?: boolean;
  sort?: 'newest' | 'featured';
  limit?: number;
}

export async function CatalogProductsSection({
  eyebrow,
  title,
  description,
  featured = false,
  sort = 'newest',
  limit = 8,
}: CatalogProductsSectionProps) {
  const { items } = await fetchProducts({ featured, sort, limit, page: 1 }).catch(() => ({
    items: [],
    pagination: { page: 1, limit, total: 0, totalPages: 0 },
  }));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="section-padding">
      <div className="container-premium">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <ScrollReveal delay={0.2}>
            <Button variant="champagne" asChild>
              <Link href="/shop">
                Shop All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-5 md:gap-8 lg:grid-cols-4">
          {items.map((product, index) => (
            <ProductCard key={product.id} product={mapListingToCard(product)} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
