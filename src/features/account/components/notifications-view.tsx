'use client';

import { motion } from 'framer-motion';
import { Bell, CheckCheck, Loader2, Search } from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { NotificationItem } from '@/features/notifications/components/notification-bell';
import { CATEGORY_LABELS, type NotificationCategory } from '@/services/notification.service';
import { AccountShell } from './account-shell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CATEGORIES: Array<NotificationCategory | 'all'> = [
  'all',
  'ORDER',
  'PAYMENT',
  'SHIPMENT',
  'DELIVERY',
  'RETURN',
  'REFUND',
  'ACCOUNT',
  'SECURITY',
  'OFFER',
];

export function NotificationsView() {
  const {
    notifications,
    unreadCount,
    loading,
    category,
    setCategory,
    search,
    setSearch,
    markAsRead,
    markAllAsRead,
    remove,
    loadMore,
    hasMore,
    refresh,
  } = useNotifications();

  return (
    <AccountShell title="Notifications" description="Stay updated on orders, deliveries, and offers">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </p>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              category === cat
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-champagne" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-border/60 bg-surface-elevated py-16 text-center"
        >
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No notifications</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll notify you about orders, shipments, and offers here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <NotificationItem
                notification={notification}
                onRead={markAsRead}
                onDelete={remove}
              />
            </motion.div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}
    </AccountShell>
  );
}
