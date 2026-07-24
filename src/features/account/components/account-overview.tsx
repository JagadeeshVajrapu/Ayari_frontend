'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Heart, MapPin, Bell, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useShopStore, formatPrice } from '@/features/shop/stores/shop.store';
import { userService, type AdminOrder } from '@/services/admin.service';
import { notificationApi } from '@/services/notification.service';
import { AccountShell } from './account-shell';
import { Button } from '@/components/ui/button';

export function AccountOverview() {
  const user = useAuthStore((s) => s.user);
  const wishlistCount = useShopStore((s) => s.wishlist.length);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [ordersRes, addressesRes, unreadCount] = await Promise.all([
          userService.getMyOrders({ limit: 5 }),
          userService.getMyAddresses(),
          notificationApi.getUnreadCount().catch(() => 0),
        ]);
        if (cancelled) return;
        setOrders(ordersRes.data.data.items);
        setAddressCount(addressesRes.data.data.addresses.length);
        setUnread(unreadCount);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recentOrder = orders[0];
  const quickLinks = [
    { label: 'Orders', href: '/account/orders', icon: Package, count: orders.length },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart, count: wishlistCount },
    { label: 'Addresses', href: '/account/addresses', icon: MapPin, count: addressCount },
    { label: 'Notifications', href: '/account/notifications', icon: Bell, count: unread },
  ];

  return (
    <AccountShell
      title={`Welcome, ${user?.firstName}`}
      description="Manage your orders, wishlist, and account preferences"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/60 bg-gradient-to-br from-champagne/10 via-surface-elevated to-surface-elevated p-6 shadow-soft sm:p-8"
        >
          <p className="text-sm text-ink-muted">Member since</p>
          <p className="font-display text-2xl text-foreground">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
          {unread > 0 && (
            <p className="mt-2 text-sm text-champagne-dark dark:text-champagne">
              You have {unread} unread notification{unread > 1 ? 's' : ''}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-champagne" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-4 rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft transition-all hover:border-champagne/40 hover:shadow-medium"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/15">
                      <Icon className="h-5 w-5 text-champagne-dark dark:text-champagne" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{link.label}</p>
                      <p className="text-sm text-ink-muted">{link.count} items</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {recentOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-foreground">Recent Order</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/account/orders">View all</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{recentOrder.orderNumber}</p>
                <p className="text-xs text-ink-muted">
                  {new Date(recentOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · {recentOrder.items.length} items
                </p>
              </div>
              <p className="font-display text-lg text-foreground">
                {formatPrice(recentOrder.totalAmount)}
              </p>
            </div>
          </motion.div>
        ) : (
          !loading && (
            <p className="text-center text-sm text-ink-muted">
              No orders yet. New orders will appear here after checkout.
            </p>
          )
        )}
      </div>
    </AccountShell>
  );
}
