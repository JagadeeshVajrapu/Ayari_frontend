import Link from 'next/link';
import { ContentPageShell } from '@/components/common/content-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'FAQs',
  description: 'Frequently asked questions about shopping at Ayari Creations.',
  path: '/faq',
});

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Sign in and open Account → Orders. Once shipped, tracking details appear on the order.',
  },
  {
    q: 'Can I apply a coupon?',
    a: 'Yes. Add items to your bag, then enter the code at cart/checkout. Welcome offers like AYARI10 apply on eligible first orders.',
  },
  {
    q: 'Do you ship across India?',
    a: 'Yes. We ship nationwide with tracked couriers. Delivery times vary by location.',
  },
  {
    q: 'Are products handmade?',
    a: 'Most pieces are handcrafted or hand-finished in small batches. Slight variations are part of the charm.',
  },
];

export default function FaqPage() {
  return (
    <ContentPageShell
      eyebrow="Help centre"
      title="Frequently asked questions"
      description="Quick answers before you buy — or while your order is on the way."
    >
      {FAQS.map((item) => (
        <section key={item.q} className="rounded-2xl border border-border/60 bg-surface-elevated p-5">
          <h2 className="font-display text-xl text-foreground">{item.q}</h2>
          <p className="mt-2">{item.a}</p>
        </section>
      ))}
      <p>
        Still stuck?{' '}
        <Link href="/contact" className="text-champagne-dark hover:underline">
          Contact us
        </Link>
        .
      </p>
    </ContentPageShell>
  );
}
