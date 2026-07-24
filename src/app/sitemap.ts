import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { fetchAllProductSlugs, fetchCategories } from '@/lib/server-catalog';
import { categoryHref } from '@/lib/category-routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ['', '/shop', '/categories', '/cart', '/login', '/register'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1 : 0.8,
  }));

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await fetchCategories();
    categoryRoutes = categories.map((category) => ({
      url: `${SITE_URL}${categoryHref(category.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));
  } catch {
    categoryRoutes = [];
  }

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await fetchAllProductSlugs();
    productRoutes = slugs.map((slug) => ({
      url: `${SITE_URL}/products/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    productRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
