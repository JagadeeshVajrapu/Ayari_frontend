'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, Bell, Send, AlertTriangle } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminStatCard } from './admin-stat-card';
import { notificationApi, type AdminNotificationStats } from '@/services/notification.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { Button } from '@/components/ui/button';

export function AdminNotificationsView() {
  const [stats, setStats] = useState<AdminNotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationApi.getAdminDashboard();
      setStats(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setSending(true);
    setError('');
    try {
      await notificationApi.broadcast({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminShell title="Notification Dashboard" description="Monitor and broadcast customer notifications">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-champagne" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <AdminStatCard label="Total" value={String(stats.total)} icon={<Bell className="h-5 w-5" />} />
            <AdminStatCard label="Unread" value={String(stats.unread)} icon={<AlertTriangle className="h-5 w-5" />} />
            <AdminStatCard label="Sent Today" value={String(stats.sentToday)} icon={<Send className="h-5 w-5" />} />
            <AdminStatCard label="Email Success" value={String(stats.emailSuccess)} icon={<Mail className="h-5 w-5" />} />
            <AdminStatCard label="Email Failed" value={String(stats.emailFailed)} icon={<AlertTriangle className="h-5 w-5" />} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
            <h3 className="font-display text-lg">Top Notification Types</h3>
            <div className="mt-4 space-y-2">
              {stats.topTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                stats.topTypes.map((item) => (
                  <div key={item.type} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2 text-sm">
                    <span className="font-medium">{item.type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6 space-y-4">
            <h3 className="font-display text-lg">Broadcast System Notification</h3>
            <input
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm"
              required
            />
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Message to all customers..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm"
              required
            />
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Broadcast
            </Button>
          </form>
        </div>
      ) : null}
    </AdminShell>
  );
}
