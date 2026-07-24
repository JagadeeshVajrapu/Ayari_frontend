import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { ContentPageShell } from '@/components/common/content-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Ayari Creations for order help, custom requests, and support.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <ContentPageShell
      eyebrow="Support"
      title="Contact us"
      description="Questions about an order, custom piece, or shipping? We’re happy to help."
    >
      <section className="rounded-3xl border border-border/60 bg-surface-elevated p-6">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-xl text-foreground">Email</h2>
            <p className="mt-2">
              <a
                href="mailto:hello@ayaricreations.com"
                className="font-medium text-champagne-dark hover:underline"
              >
                hello@ayaricreations.com
              </a>
            </p>
            <p className="mt-1 text-sm">We typically reply within 1 business day.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface-elevated p-6">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-0.5 h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-xl text-foreground">Order help</h2>
            <p className="mt-2">
              Track or review past orders from your{' '}
              <Link href="/account/orders" className="text-champagne-dark hover:underline">
                account orders
              </Link>{' '}
              page after signing in.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground">Custom requests</h2>
        <p className="mt-3">
          For personalised nameplates, colour preferences, or bulk gifting, email us with your idea
          and preferred timeline — we’ll confirm availability and pricing.
        </p>
      </section>
    </ContentPageShell>
  );
}
