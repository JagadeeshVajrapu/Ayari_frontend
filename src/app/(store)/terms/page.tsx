import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Terms of Service — AYARI',
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16 md:py-24">
        <h1 className="font-display text-4xl text-foreground">Terms of Service</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Last updated: July 2026
        </p>

        <div className="prose prose-neutral mt-10 max-w-3xl dark:prose-invert">
          <section className="space-y-4">
            <h2 className="font-display text-2xl">1. Acceptance of Terms</h2>
            <p className="text-ink-muted">
              By accessing and using AYARI, you agree to be bound by these Terms of Service. If you do not agree,
              please do not use our platform.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">2. Account Registration</h2>
            <p className="text-ink-muted">
              You must provide accurate information when creating an account. You are responsible for maintaining
              the confidentiality of your password and for all activity under your account.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">3. Purchases &amp; Payments</h2>
            <p className="text-ink-muted">
              All prices are listed in INR unless stated otherwise. We reserve the right to modify prices and
              product availability. Orders are confirmed once payment is successfully processed or COD is accepted.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">4. Returns &amp; Refunds</h2>
            <p className="text-ink-muted">
              Eligible items may be returned within 14 days of delivery in original condition. Refunds are processed
              to the original payment method within 7–10 business days after inspection.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">5. Contact</h2>
            <p className="text-ink-muted">
              Questions about these terms? Contact us at{' '}
              <Link href="mailto:support@ayari.com" className="text-champagne-dark underline dark:text-champagne">
                support@ayari.com
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
