import { ContentPageShell } from '@/components/common/content-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Shipping Info',
  description: 'Shipping timelines, packing, and delivery details for Ayari Creations orders.',
  path: '/shipping',
});

export default function ShippingPage() {
  return (
    <ContentPageShell
      eyebrow="Delivery"
      title="Shipping information"
      description="Clear timelines so you know when your handcrafted order will arrive."
    >
      <section>
        <h2 className="font-display text-2xl text-foreground">Dispatch</h2>
        <p className="mt-3">
          Most orders are packed and handed to courier within 1–3 business days after payment
          confirmation. Custom pieces may take longer — we’ll note this on the product page.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-foreground">Delivery window</h2>
        <p className="mt-3">
          Standard delivery across India usually takes 5–7 business days after dispatch. Express
          options (when selected at checkout) are faster where available.
        </p>
      </section>
      <section>
        <h2 className="font-display text-2xl text-foreground">Free shipping</h2>
        <p className="mt-3">
          Complimentary standard shipping applies on eligible orders over ₹5,000. Tracking details
          are shared once your shipment is live.
        </p>
      </section>
    </ContentPageShell>
  );
}
