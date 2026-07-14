'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, ExternalLink, Loader2, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { CATEGORY_COLORS, CATEGORY_LABELS, type Notification } from '@/services/notification.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useClientReady } from '@/hooks/use-client-ready';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
  compact,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'group flex gap-3 rounded-xl border p-3 transition-colors',
        notification.isRead
          ? 'border-border/50 bg-muted/20'
          : 'border-champagne/30 bg-champagne/5',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          CATEGORY_COLORS[notification.category],
        )}
      >
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium', !notification.isRead && 'text-foreground')}>
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(notification.createdAt)}</span>
        </div>
        <p className={cn('mt-0.5 text-xs text-muted-foreground', !compact && 'text-sm')}>{notification.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {CATEGORY_LABELS[notification.category]}
          </span>
          {notification.actionUrl && (
            <Link
              href={
                notification.actionUrl.startsWith('/')
                  ? notification.actionUrl
                  : (() => {
                      try {
                        const u = new URL(notification.actionUrl);
                        return u.pathname + u.search;
                      } catch {
                        return notification.actionUrl;
                      }
                    })()
              }
              className="inline-flex items-center gap-1 text-[10px] font-medium text-brand hover:underline"
              onClick={() => !notification.isRead && onRead(notification.id)}
            >
              View <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.isRead && (
          <button
            type="button"
            onClick={() => onRead(notification.id)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Mark as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const isReady = useClientReady();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    remove,
    load,
  } = useNotifications();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!isReady || !user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load(1);
        }}
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-premium"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Mark all read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-champagne" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markAsRead}
                    onDelete={remove}
                    compact
                  />
                ))
              )}
            </div>

            <div className="border-t border-border/60 p-3">
              <Link
                href="/account/notifications"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl bg-muted/50 py-2 text-center text-xs font-medium text-foreground hover:bg-muted"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { NotificationItem };
