import { Hero } from '@/components/home/hero';
import { FeaturedCategories } from '@/components/home/featured-categories';
import { CatalogProductsSection } from '@/components/home/catalog-products-section';
import { LazyNewsletter } from '@/components/home/home-lazy-sections';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Curated for the Discerning',
  description:
    'Discover meticulously crafted luxury fashion. Shop collections and exclusive pieces at AYARI.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <CatalogProductsSection
        eyebrow="Featured"
        title="The Edit"
        description="Handpicked pieces marked as featured in your catalog."
        featured
        sort="featured"
        limit={8}
      />
      <CatalogProductsSection
        eyebrow="New"
        title="Latest Arrivals"
        description="Recently added products from your store."
        sort="newest"
        limit={8}
      />
      <LazyNewsletter />
    </>
  );
}
