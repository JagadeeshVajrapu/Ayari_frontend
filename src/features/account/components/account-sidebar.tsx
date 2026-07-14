'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Overview', href: '/account', icon: LayoutDashboard, exact: true },
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Payment Methods', href: '/account/payment-methods', icon: CreditCard },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
  { label: 'Settings', href: '/account/settings', icon: Settings },
];

interface AccountSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AccountSidebar({ onNavigate, className }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    router.push('/');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        'flex h-full flex-col rounded-3xl border border-border/60 bg-surface-elevated p-4 shadow-soft',
        className,
      )}
    >
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-champagne/20 to-champagne/5 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne/30 font-display text-lg text-ink">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>
        <p className="mt-3 font-display text-lg text-foreground">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="truncate text-xs text-ink-muted">{user?.email}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-300',
                active
                  ? 'bg-ink text-cream shadow-soft'
                  : 'text-ink-muted hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active && 'text-champagne')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}

export function AccountMobileHeader({
  title,
  onMenuOpen,
}: {
  title: string;
  onMenuOpen: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between lg:hidden">
      <div>
        <p className="text-xs tracking-wider text-ink-faint uppercase">My Account</p>
        <h1 className="font-display text-2xl text-foreground">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated"
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>
    </div>
  );
}

export function AccountMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute inset-y-0 left-0 w-[min(100%,280px)] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <AccountSidebar onNavigate={onClose} className="h-full" />
      </motion.div>
    </motion.div>
  );
}
