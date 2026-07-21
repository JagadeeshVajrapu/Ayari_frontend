import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/features/product/components/product-detail-view';
import { JsonLd } from '@/components/seo/json-ld';
import { fetchProductBySlug, fetchProducts } from '@/lib/server-catalog';
import { createPageMetadata } from '@/lib/seo';
import { productJsonLd, breadcrumbJsonLd } from '@/lib/structured-data';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  return createPageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${slug}`,
    image: product.image,
    type: 'article',
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  const related = await fetchProducts({
    category: product.category,
    limit: 4,
  });
  const relatedProducts = related.items.filter((item) => item.slug !== product.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: product.name, path: `/products/${slug}` },
        ])}
      />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        bundleProducts={[]}
        reviews={product.reviews ?? []}
      />
    </>
  );
}
