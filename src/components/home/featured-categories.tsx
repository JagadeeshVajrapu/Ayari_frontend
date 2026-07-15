import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryCard } from '@/components/common/category-card';
import { SectionHeading } from '@/components/common/section-heading';
import { ScrollReveal } from '@/components/common/scroll-reveal';
import { Button } from '@/components/ui/button';
import { fetchCategories } from '@/lib/server-catalog';
import { CATEGORY_PLACEHOLDER } from '@/lib/catalog-constants';
import { resolveMediaUrl } from '@/lib/media';

export async function FeaturedCategories() {
  const categories = await fetchCategories().catch(() => []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-surface">
      <div className="container-premium">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Shop"
            title="Categories"
            description="Browse collections you create in the admin panel."
          />
          <ScrollReveal delay={0.2}>
            <Button variant="outline" asChild>
              <Link href="/shop">
                All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => {
            const image = resolveMediaUrl(category.imageUrl, CATEGORY_PLACEHOLDER);
            return (
              <CategoryCard
                key={category.id}
                title={category.name}
                subtitle={`${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}`}
                image={image}
                href={`/shop?categories=${encodeURIComponent(category.name)}`}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
