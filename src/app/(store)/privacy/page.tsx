import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Privacy Policy — AYARI',
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16 md:py-24">
        <h1 className="font-display text-4xl text-foreground">Privacy Policy</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">Last updated: July 2026</p>

        <div className="prose prose-neutral mt-10 max-w-3xl dark:prose-invert">
          <section className="space-y-4">
            <h2 className="font-display text-2xl">Information We Collect</h2>
            <p className="text-ink-muted">
              We collect information you provide directly — name, email, phone, shipping address, and payment details
              — to process orders and improve your shopping experience.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">How We Use Your Data</h2>
            <ul className="list-disc space-y-2 pl-5 text-ink-muted">
              <li>Process and fulfill orders</li>
              <li>Send order updates and shipping notifications</li>
              <li>Improve our products and services</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">Data Security</h2>
            <p className="text-ink-muted">
              We use industry-standard encryption and secure servers to protect your personal information. Passwords
              are hashed and never stored in plain text.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-2xl">Your Rights</h2>
            <p className="text-ink-muted">
              You may update your profile, request data deletion, or opt out of marketing emails at any time through
              your{' '}
              <Link href="/account/settings" className="text-champagne-dark underline dark:text-champagne">
                account settings
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
