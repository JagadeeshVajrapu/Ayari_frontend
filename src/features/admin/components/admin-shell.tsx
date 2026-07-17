'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Tag,
  Star,
  BarChart3,
  Warehouse,
  FileText,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Truck,
  Bell,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Shipment Management', href: '/admin/shipments', icon: Truck },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Catalog', href: '/admin/categories', icon: FolderTree },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Sales Report', href: '/admin/sales', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    router.push('/');
  };

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-soft backdrop-blur-xl">
      <div className="mb-6 px-2">
        <BrandLogo href="/admin" size="md" />
        <p className="mt-2 text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-border pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <p className="px-3 pt-2 text-[10px] text-muted-foreground">
          {user?.firstName} {user?.lastName} · Admin
        </p>
      </div>
    </aside>
  );
}

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-[260px] shrink-0 p-4 lg:block">
        <div className="sticky top-4 h-[calc(100vh-2rem)]">
          <AdminSidebar />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-display text-xl text-foreground lg:text-2xl">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-[min(100%,280px)] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
                <AdminSidebar onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
