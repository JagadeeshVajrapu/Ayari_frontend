import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { fetchAllProductSlugs } from '@/lib/server-catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ['', '/shop', '/cart', '/login', '/register'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1 : 0.8,
  }));

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

  return [...staticRoutes, ...productRoutes];
}
