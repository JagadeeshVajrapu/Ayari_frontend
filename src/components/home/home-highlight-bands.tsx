import Link from 'next/link';
import { ArrowRight, Gift, HeartHandshake, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HIGHLIGHTS = [
  {
    icon: Gift,
    title: 'Gift-ready picks',
    description: 'Bouquets, keychains, and keepsakes packed to impress.',
    href: '/shop?categories=flower-bouquet,keychains',
    cta: 'Shop gifts',
  },
  {
    icon: Sparkles,
    title: 'Wall & table décor',
    description: 'Mandala plates, candles, and accents for every corner.',
    href: '/categories',
    cta: 'Browse décor',
  },
  {
    icon: HeartHandshake,
    title: 'Easy buying',
    description: 'Quick view, wishlist, secure checkout, and order tracking.',
    href: '/shop',
    cta: 'Start shopping',
  },
] as const;

export function HomeHighlightBands() {
  return (
    <section className="section-padding pt-4">
      <div className="container-premium">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium tracking-[0.2em] text-champagne-dark uppercase">
            Why shop Ayari
          </p>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            Designed for discovery and easy checkout
          </h2>
          <p className="mt-3 text-sm text-ink-muted sm:text-base">
            Explore collections, save favourites, and buy with confidence — the same flow you’d
            expect from a modern storefront.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-premium"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-champagne-dark group-hover:gap-2">
                {item.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-[2rem] bg-brand-charcoal px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand uppercase">
                First order offer
              </p>
              <h3 className="mt-2 font-display text-3xl sm:text-4xl">Get 10% off with AYARI10</h3>
              <p className="mt-3 text-sm text-white/70">
                Copy the welcome coupon, add pieces you love, and apply the code at checkout.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="champagne" asChild>
                <Link href="/shop">
                  Shop now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/faq">How it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
