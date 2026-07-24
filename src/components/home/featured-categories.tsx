import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryCard } from '@/components/common/category-card';
import { SectionHeading } from '@/components/common/section-heading';
import { ScrollReveal } from '@/components/common/scroll-reveal';
import { Button } from '@/components/ui/button';
import { fetchCategories } from '@/lib/server-catalog';
import { CATEGORY_PLACEHOLDER } from '@/lib/catalog-constants';
import { categoryHref } from '@/lib/category-routes';
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
            eyebrow="Shop by category"
            title="Browse every collection"
            description="Tap a category to open its dedicated page with products ready to buy."
          />
          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/categories">
                  All Categories
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="champagne" asChild>
                <Link href="/shop">
                  All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-10 sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={`chip-${category.id}`}
              href={categoryHref(category.slug)}
              className="shrink-0 snap-start rounded-full border border-border/70 bg-background px-3.5 py-2 text-xs text-foreground transition-colors hover:border-brand/50 hover:text-brand sm:px-4 sm:text-sm"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => {
            const image = resolveMediaUrl(category.imageUrl, CATEGORY_PLACEHOLDER);
            return (
              <CategoryCard
                key={category.id}
                title={category.name}
                subtitle={`${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}`}
                image={image}
                href={categoryHref(category.slug)}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
