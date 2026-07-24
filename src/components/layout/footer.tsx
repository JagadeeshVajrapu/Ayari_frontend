import Link from 'next/link';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BrandLogo } from '@/components/brand/brand-logo';
import { designTokens } from '@/lib/design-tokens';
import { HEADER_DEPARTMENT_LINKS } from '@/lib/header-nav';

const footerColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/shop' },
      { label: 'Categories', href: '/categories' },
      { label: 'New Arrivals', href: '/shop?sort=newest' },
      { label: 'Featured', href: '/shop?featured=true' },
      ...HEADER_DEPARTMENT_LINKS.map((link) => ({ label: link.label, href: link.href })),
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track Order', href: '/account/orders' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Account', href: '/account' },
      { label: 'Orders', href: '/account/orders' },
      { label: 'Wishlist', href: '/account/wishlist' },
      { label: 'Shopping Bag', href: '/cart' },
      { label: 'Sign In', href: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Ayari', href: '/about' },
      { label: 'Our Craft', href: '/about#craft' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer
      className="bg-brand-charcoal text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-premium px-5 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] lg:gap-14">
          <div>
            <BrandLogo href="/" size="xl" tone="dark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {designTokens.brand.tagline}. Handcrafted décor, gifts, and keepsakes made to feel
              personal — from wall art to table accents.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="mailto:hello@ayaricreations.com"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-brand" />
                  hello@ayaricreations.com
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>Handmade in India · Ships nationwide</span>
              </li>
            </ul>
            <div className="mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-brand hover:text-brand"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-8">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={`${column.title} links`}>
                <h4 className="mb-4 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
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
        </div>

        <Separator className="my-8 bg-white/10 sm:my-10" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {designTokens.brand.name}. All rights reserved.
          </p>
          <p className="text-white/40">Secure checkout · Crafted with care</p>
        </div>
      </div>
    </footer>
  );
}
