import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BrandLogo } from '@/components/brand/brand-logo';
import { designTokens } from '@/lib/design-tokens';

const footerLinks = {
  shop: [
    { label: 'New Arrivals', href: '/collections/new' },
    { label: 'Best Sellers', href: '/collections/bestsellers' },
    { label: 'Women', href: '/collections/women' },
    { label: 'Men', href: '/collections/men' },
    { label: 'Sale', href: '/sale' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer
      className="bg-brand-charcoal text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-premium section-padding pb-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo href="/" size="xl" tone="dark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {designTokens.brand.tagline}. Discover meticulously crafted pieces that
              transcend seasons and define modern luxury.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-brand hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-label={`${title} links`}>
              <h4 className="mb-4 text-xs font-medium tracking-[0.2em] text-brand uppercase">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-12 bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {designTokens.brand.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white/80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white/80">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
