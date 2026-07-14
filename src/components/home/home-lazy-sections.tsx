import dynamic from 'next/dynamic';
import { SectionSkeleton } from '@/components/ui/section-skeleton';

export const LazyNewsletter = dynamic(
  () => import('@/components/home/newsletter-section').then((m) => m.NewsletterSection),
  { loading: () => <SectionSkeleton height="h-64" /> },
);
