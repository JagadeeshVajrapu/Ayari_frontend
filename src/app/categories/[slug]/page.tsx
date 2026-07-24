import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight, Package } from 'lucide-react';
import { ProductCard } from '@/components/common/product-card';
import { CategoryCard } from '@/components/common/category-card';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { CATEGORY_PLACEHOLDER } from '@/lib/catalog-constants';
import { mapListingToCard } from '@/lib/catalog-mappers';
import { categoryHref } from '@/lib/category-routes';
import { resolveMediaUrl } from '@/lib/media';
import { createPageMetadata } from '@/lib/seo';
import {
  fetchCategories,
  fetchCategoryBySlug,
  fetchProducts,
} from '@/lib/server-catalog';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 30;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await fetchCategories().catch(() => []);
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  return createPageMetadata({
    title: category.name,
    description:
      category.description ||
      `Shop ${category.name} at Ayari Creations — ${category.productCount} handcrafted pieces.`,
    path: categoryHref(category.slug),
    image: category.imageUrl ?? undefined,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const [{ items }, allCategories] = await Promise.all([
    fetchProducts({
      categories: [category.slug, category.name],
      limit: 48,
      sort: 'newest',
      page: 1,
    }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 48, total: 0, totalPages: 0 },
    })),
    fetchCategories().catch(() => []),
  ]);

  const image = resolveMediaUrl(category.imageUrl, CATEGORY_PLACEHOLDER);
  const related = allCategories
    .filter((entry) => entry.slug !== category.slug)
    .slice(0, 4);
  const shopFilterHref = `/shop?categories=${encodeURIComponent(category.slug)}`;

  return (
    <main className="pb-16">
      <section className="relative overflow-hidden border-b border-border/50 bg-surface">
        <div className="absolute inset-0">
          <SafeImage
            src={image}
            fallback={CATEGORY_PLACEHOLDER}
            alt=""
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/70 dark:from-background dark:via-background/90 dark:to-background/70" />
        </div>

        <div className="container-premium relative pt-8 pb-12 sm:pb-16">
          <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-ink-muted">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/categories" className="transition-colors hover:text-foreground">
              Categories
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </Link>
          </Button>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-[0.2em] text-champagne-dark uppercase">
                Shop Collection
              </p>
              <h1 className="mt-2 font-display text-display-md text-foreground sm:text-display-lg">
                {category.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                {category.description ||
                  `Explore our ${category.name.toLowerCase()} collection — handmade pieces curated for everyday elegance.`}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                  <Package className="h-3.5 w-3.5 text-champagne-dark" />
                  {category.productCount}{' '}
                  {category.productCount === 1 ? 'product' : 'products'}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="champagne" asChild>
                  <Link href={shopFilterHref}>
                    Filter in Shop
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shop">Browse All Products</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden h-44 w-44 overflow-hidden rounded-3xl shadow-premium sm:block lg:h-52 lg:w-52">
              <SafeImage
                src={image}
                fallback={CATEGORY_PLACEHOLDER}
                alt={category.name}
                fill
                className="object-cover"
                sizes="208px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-10">
        <div className="container-premium">
          {items.length > 0 ? (
            <>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.18em] text-ink-faint uppercase">Products</p>
                  <h2 className="mt-1 font-display text-2xl text-foreground">
                    In this collection
                  </h2>
                </div>
                <p className="text-sm text-ink-muted">
                  Showing {items.length} of {category.productCount || items.length}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {items.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={mapListingToCard(product)}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-border/60 bg-surface-elevated p-10 text-center">
              <h2 className="font-display text-xl text-foreground">No products yet</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Products added to this category will appear here.
              </p>
              <Button className="mt-6" variant="champagne" asChild>
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-padding bg-surface pt-4">
          <div className="container-premium">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.18em] text-ink-faint uppercase">Keep exploring</p>
                <h2 className="mt-1 font-display text-2xl text-foreground">More categories</h2>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/categories">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((entry, index) => (
                <CategoryCard
                  key={entry.id}
                  title={entry.name}
                  subtitle={`${entry.productCount} ${
                    entry.productCount === 1 ? 'product' : 'products'
                  }`}
                  image={resolveMediaUrl(entry.imageUrl, CATEGORY_PLACEHOLDER)}
                  href={categoryHref(entry.slug)}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
