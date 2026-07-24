'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandLogo } from '@/components/brand/brand-logo';
import { CategoriesDropdown } from '@/components/layout/categories-dropdown';
import { useShopStore } from '@/features/shop/stores/shop.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ThemeToggle } from '@/features/auth/components/theme-toggle';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { useClientReady } from '@/hooks/use-client-ready';
import { navItemVariants, springTransition } from '@/lib/motion';
import { HEADER_DEPARTMENT_LINKS } from '@/lib/header-nav';
import { cn } from '@/lib/utils';

const departmentLinks = HEADER_DEPARTMENT_LINKS;

function NavLink({ href, label, index }: { href: string; label: string; index: number }) {
  const pathname = usePathname();
  const pathOnly = href.split('?')[0];
  const isActive = pathname === pathOnly && !href.includes('?') ? pathname === href : false;

  return (
    <motion.li
      custom={index}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
      className="shrink-0"
    >
      <Link
        href={href}
        className="group relative whitespace-nowrap text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
      >
        {label}
        <motion.span
          className="absolute -bottom-1 left-0 h-px bg-brand"
          initial={false}
          animate={{ width: isActive ? '100%' : '0%' }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </Link>
    </motion.li>
  );
}

export function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isReady = useClientReady();
  const cartCount = useShopStore((s) => s.cartCount());
  const user = useAuthStore((s) => s.user);
  const displayCartCount = isReady ? cartCount : 0;
  const displayUser = isReady ? user : null;
  const accountHref = displayUser ? '/account' : '/login';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop');
    setSearchOpen(false);
    setIsMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-cream/85 py-1.5 shadow-soft backdrop-blur-xl dark:bg-background/85'
            : 'bg-transparent py-2',
        )}
      >
        <div className="container-premium">
          <motion.nav
            layout
            transition={springTransition}
            className={cn(
              'flex items-center justify-between rounded-full px-4 py-2 transition-all duration-500 md:px-6',
              isScrolled && 'glass shadow-glass scale-[0.99]',
            )}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <BrandLogo href="/" size="lg" priority />
            </motion.div>

            <ul className="hidden items-center gap-8 lg:flex">
              <motion.li
                custom={0}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="shrink-0"
              >
                <CategoriesDropdown />
              </motion.li>
              {departmentLinks.map((link, index) => (
                <NavLink key={link.label} href={link.href} label={link.label} index={index + 1} />
              ))}
            </ul>

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search products"
                  className="hidden sm:flex"
                  onClick={() => setSearchOpen((open) => !open)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="hidden sm:flex"
                asChild
              >
                <Link href={displayUser ? '/account/wishlist' : '/login?redirect=/account/wishlist'}>
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:flex" asChild>
                <Link href={accountHref}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {displayCartCount > 0 && (
                      <motion.span
                        key={displayCartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={springTransition}
                        className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
                      >
                        {displayCartCount > 9 ? '9+' : displayCartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </motion.nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-[72px] z-40 border-b border-border/60 bg-cream/95 px-4 py-3 backdrop-blur-xl dark:bg-background/95"
          >
            <form onSubmit={submitSearch} className="container-premium flex gap-2">
              <Input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products, categories, or SKU..."
                className="flex-1"
              />
              <Button type="submit">Search</Button>
              <Button type="button" variant="ghost" onClick={() => setSearchOpen(false)}>
                Close
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-cream p-8 shadow-premium dark:bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <BrandLogo href="/" size="md" />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="mt-10 flex flex-col gap-6">
                <form onSubmit={submitSearch} className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search products..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" aria-label="Search">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <Link
                  href="/shop"
                  className="font-display text-2xl text-ink"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Shop All
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="font-display text-2xl text-ink"
                  onClick={() => setIsMobileOpen(false)}
                >
                  New Arrivals
                </Link>
                <Link
                  href={displayUser ? '/account/wishlist' : '/login?redirect=/account/wishlist'}
                  className="font-display text-2xl text-ink"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Wishlist
                </Link>

                <CategoriesDropdown mobile onNavigate={() => setIsMobileOpen(false)} />

                <div className="space-y-3 border-t border-border/60 pt-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-ink-faint uppercase">
                    Departments
                  </p>
                  {departmentLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className="block text-lg text-ink"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {displayUser && (
                  <Link
                    href="/account"
                    className="font-display text-2xl text-ink"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    My Account
                  </Link>
                )}
              </nav>

              <div className="mt-12 flex gap-3">
                {displayUser ? (
                  <Button variant="default" className="flex-1" asChild>
                    <Link href="/account">My Account</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button variant="default" className="flex-1" asChild>
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
