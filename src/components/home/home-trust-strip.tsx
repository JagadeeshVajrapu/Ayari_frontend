import { Package, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Handcrafted pieces',
    description: 'Made in small batches with careful finishing.',
  },
  {
    icon: Truck,
    title: 'Reliable delivery',
    description: 'Tracked shipping across India.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure checkout',
    description: 'Safe payments with order confirmation.',
  },
  {
    icon: Package,
    title: 'Gift-ready packing',
    description: 'Thoughtfully packed for every order.',
  },
] as const;

export function HomeTrustStrip() {
  return (
    <section className="border-y border-border/50 bg-surface">
      <div className="container-premium py-8 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <benefit.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{benefit.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
