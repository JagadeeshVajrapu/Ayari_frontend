'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi, type Notification, type NotificationCategory } from '@/services/notification.service';
import { getShipmentSocket, SOCKET_EVENTS } from '@/services/socket.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function useNotifications(options?: { poll?: boolean }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const mountedRef = useRef(true);

  const load = useCallback(
    async (pageNum = 1, append = false) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const data = await notificationApi.list({
          page: pageNum,
          limit: 20,
          search: search || undefined,
          category: category !== 'all' ? category : undefined,
        });
        if (!mountedRef.current) return;
        setNotifications((prev) => (append ? [...prev, ...data.items] : data.items));
        setUnreadCount(data.unreadCount);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch {
        /* Keep prior notifications if backend is briefly unavailable */
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [accessToken, search, category],
  );

  const loadUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    try {
      const count = await notificationApi.getUnreadCount();
      if (mountedRef.current) setUnreadCount(count);
    } catch {
      /* silent */
    }
  }, [accessToken]);

  useEffect(() => {
    mountedRef.current = true;
    if (accessToken) {
      load(1);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [accessToken, load]);

  useEffect(() => {
    if (!accessToken || !user) return;

    const socket = getShipmentSocket();
    if (!socket.connected) socket.connect();

    const onCreated = (payload: Notification & { unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === payload.id);
        if (exists) return prev;
        const { unreadCount: _, ...notification } = payload;
        return [notification as Notification, ...prev].slice(0, 50);
      });
    };

    const onRead = (payload: { notification?: Notification; unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
      if (payload.notification) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === payload.notification!.id ? payload.notification! : n)),
        );
      }
    };

    const onDeleted = (payload: { id: string; unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
      setNotifications((prev) => prev.filter((n) => n.id !== payload.id));
    };

    const onUpdated = (payload: { unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, onRead);
    socket.on(SOCKET_EVENTS.NOTIFICATION_DELETED, onDeleted);
    socket.on(SOCKET_EVENTS.NOTIFICATION_UPDATED, onUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, onRead);
      socket.off(SOCKET_EVENTS.NOTIFICATION_DELETED, onDeleted);
      socket.off(SOCKET_EVENTS.NOTIFICATION_UPDATED, onUpdated);
    };
  }, [accessToken, user]);

  const markAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  const remove = async (id: string) => {
    await notificationApi.delete(id);
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.isRead) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
  };

  const loadMore = () => {
    if (page < totalPages && !loading) load(page + 1, true);
  };

  return {
    notifications,
    unreadCount,
    loading,
    category,
    setCategory,
    search,
    setSearch,
    load,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    loadMore,
    hasMore: page < totalPages,
    refresh: () => load(1),
  };
}
