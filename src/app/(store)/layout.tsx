import dynamic from 'next/dynamic';
import { Footer } from '@/components/layout/footer';

const SiteHeader = dynamic(
  () => import('@/components/layout/site-header').then((m) => ({ default: m.SiteHeader })),
  { loading: () => <div className="h-20" /> },
);

const PageTransition = dynamic(
  () => import('@/components/motion/page-transition').then((m) => ({ default: m.PageTransition })),
  { loading: () => null },
);

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
