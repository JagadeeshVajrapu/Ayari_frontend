'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, LayoutGrid, ShoppingBag, Store } from 'lucide-react';
import { useShopStore } from '@/features/shop/stores/shop.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useClientReady } from '@/hooks/use-client-ready';
import { cn } from '@/lib/utils';

const HIDDEN_PREFIXES = [
  '/checkout',
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
];

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  match: (path: string) => boolean;
  requiresAuth?: boolean;
  showBadge?: boolean;
};

const TABS: Tab[] = [
  { href: '/', label: 'Home', icon: Home, match: (path) => path === '/' },
  {
    href: '/shop',
    label: 'Shop',
    icon: Store,
    match: (path) => path === '/shop' || path.startsWith('/products/'),
  },
  {
    href: '/categories',
    label: 'Categories',
    icon: LayoutGrid,
    match: (path) => path.startsWith('/categories'),
  },
  {
    href: '/account/wishlist',
    label: 'Wishlist',
    icon: Heart,
    match: (path) => path.startsWith('/account/wishlist'),
    requiresAuth: true,
  },
  {
    href: '/cart',
    label: 'Bag',
    icon: ShoppingBag,
    match: (path) => path === '/cart',
    showBadge: true,
  },
];

function shouldHide(pathname: string): boolean {
  return HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function MobileBottomNav() {
  const pathname = usePathname() || '/';
  const isReady = useClientReady();
  const cartCount = useShopStore((s) => s.cartCount());
  const user = useAuthStore((s) => s.user);
  const displayCartCount = isReady ? cartCount : 0;

  if (shouldHide(pathname)) return null;

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden dark:bg-background/95"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((tab) => {
          const href =
            tab.requiresAuth && !user
              ? `/login?redirect=${encodeURIComponent(tab.href)}`
              : tab.href;
          const active = tab.match(pathname);
          const Icon = tab.icon;

          return (
            <li key={tab.label} className="min-w-0">
              <Link
                href={href}
                className={cn(
                  'relative flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium tracking-wide transition-colors',
                  active ? 'text-brand' : 'text-ink-muted hover:text-foreground',
                )}
              >
                <span className="relative">
                  <Icon className={cn('h-5 w-5', active && 'stroke-[2.25]')} />
                  {tab.showBadge && displayCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                      {displayCartCount > 9 ? '9+' : displayCartCount}
                    </span>
                  )}
                </span>
                <span className="truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
