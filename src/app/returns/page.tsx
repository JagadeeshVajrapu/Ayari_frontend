import { ContentPageShell } from '@/components/common/content-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Returns & Exchanges',
  description: 'Return and exchange policy for Ayari Creations handmade products.',
  path: '/returns',
});

export default function ReturnsPage() {
  return (
    <ContentPageShell
      eyebrow="Care"
      title="Returns & exchanges"
      description="We want you to love every piece. Here’s how we handle returns for handmade décor."
    >
      <section>
        <h2 className="font-display text-2xl text-foreground">Damaged or incorrect items</h2>
        <p className="mt-3">
          If something arrives damaged or different from what you ordered, contact us within 48
          hours of delivery with photos. We’ll arrange a replacement or refund.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-foreground">Custom / personalised pieces</h2>
        <p className="mt-3">
          Personalised items are made to order and generally cannot be returned unless there is a
          production defect.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-foreground">How to start</h2>
        <p className="mt-3">
          Email hello@ayaricreations.com with your order number and we’ll guide you through the next
          steps quickly.
        </p>
      </section>
    </ContentPageShell>
  );
}
