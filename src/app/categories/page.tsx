import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CategoryCard } from '@/components/common/category-card';
import { Button } from '@/components/ui/button';
import { CATEGORY_PLACEHOLDER } from '@/lib/catalog-constants';
import { categoryHref } from '@/lib/category-routes';
import { resolveMediaUrl } from '@/lib/media';
import { createPageMetadata } from '@/lib/seo';
import { fetchCategories } from '@/lib/server-catalog';

export const metadata = createPageMetadata({
  title: 'All Categories',
  description: 'Browse every AYARI product category and discover its complete collection.',
  path: '/categories',
});

export const revalidate = 30;

export default async function CategoriesPage() {
  const categories = await fetchCategories().catch(() => []);

  return (
    <main className="section-padding pt-8">
      <div className="container-premium">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-medium tracking-[0.2em] text-champagne-dark uppercase">
            Explore AYARI
          </p>
          <h1 className="mt-2 font-display text-display-md text-foreground">All Categories</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
            Choose a category to open its collection page — products, details, and easy add-to-bag.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                subtitle={`${category.productCount} ${
                  category.productCount === 1 ? 'product' : 'products'
                }`}
                image={resolveMediaUrl(category.imageUrl, CATEGORY_PLACEHOLDER)}
                href={categoryHref(category.slug)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-border/60 bg-surface-elevated p-10 text-center">
            <h2 className="font-display text-xl text-foreground">No categories available</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Categories created in the admin panel will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
