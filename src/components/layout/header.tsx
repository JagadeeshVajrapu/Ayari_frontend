'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/brand-logo';
import { useShopStore } from '@/features/shop/stores/shop.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ThemeToggle } from '@/features/auth/components/theme-toggle';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { useClientReady } from '@/hooks/use-client-ready';
import { navItemVariants, springTransition } from '@/lib/motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Featured', href: '/shop?featured=true' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
];

function NavLink({ href, label, index }: { href: string; label: string; index: number }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]));

  return (
    <motion.li custom={index} variants={navItemVariants} initial="hidden" animate="visible">
      <Link
        href={href}
        className="group relative text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isReady = useClientReady();
  const cartCount = useShopStore((s) => s.cartCount());
  const user = useAuthStore((s) => s.user);
  const displayCartCount = isReady ? cartCount : 0;
  const displayUser = isReady ? user : null;
  const accountHref = displayUser ? '/account' : '/login';
  const isAdmin = displayUser?.role === 'ADMIN';

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

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          isScrolled ? 'bg-cream/85 py-1.5 shadow-soft backdrop-blur-xl dark:bg-background/85' : 'bg-transparent py-2',
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
              {navLinks.map((link, index) => (
                <NavLink key={link.href} href={link.href} label={link.label} index={index} />
              ))}
            </ul>

            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              <NotificationBell />
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button variant="ghost" size="icon" aria-label="Search" className="hidden sm:flex">
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
              <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:flex" asChild>
                <Link href={accountHref}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" className="hidden text-xs tracking-wider uppercase md:flex" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
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
              className="absolute inset-y-0 right-0 w-full max-w-sm bg-cream p-8 shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <BrandLogo href="/" size="md" />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="mt-12 flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="font-display text-2xl text-ink"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {displayUser && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                  >
                    <Link
                      href="/account"
                      className="font-display text-2xl text-ink"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      My Account
                    </Link>
                  </motion.div>
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
