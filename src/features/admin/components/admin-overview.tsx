'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Loader2, Package, ShoppingBag, Users } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminStatCard } from './admin-stat-card';
import { AdminBarChart } from './admin-charts';
import { AdminDataTable } from './admin-data-table';
import { adminService, type AdminOrder } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { formatPrice } from '@/features/shop/stores/shop.store';

function formatRevenue(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return formatPrice(n);
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600',
  CONFIRMED: 'bg-blue-500/15 text-blue-600',
  PROCESSING: 'bg-indigo-500/15 text-indigo-600',
  SHIPPED: 'bg-purple-500/15 text-purple-600',
  DELIVERED: 'bg-green-500/15 text-green-600',
  CANCELLED: 'bg-red-500/15 text-red-600',
  REFUNDED: 'bg-muted text-muted-foreground',
};

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0, lowStock: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ label: string; value: number }>>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    adminService
      .getDashboard()
      .then(({ data }) => {
        setStats(data.data.stats);
        setMonthlyRevenue(data.data.monthlyRevenue);
        setRecentOrders(data.data.recentOrders);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminShell title="Dashboard" description="Overview of your store performance">
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-champagne" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" description="Overview of your store performance">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Revenue" value={formatRevenue(stats.revenue)} icon={<IndianRupee className="h-5 w-5" />} />
          <AdminStatCard label="Orders" value={String(stats.orders)} icon={<ShoppingBag className="h-5 w-5" />} />
          <AdminStatCard label="Customers" value={String(stats.customers)} icon={<Users className="h-5 w-5" />} />
          <AdminStatCard label="Low Stock" value={String(stats.lowStock)} icon={<Package className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/60 bg-card/50 p-6">
            <h2 className="mb-6 font-display text-lg">Monthly Revenue</h2>
            {monthlyRevenue.length > 0 ? (
              <AdminBarChart data={monthlyRevenue} formatValue={(v) => formatRevenue(v)} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No revenue data yet</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border/60 bg-card/50 p-6">
            <h2 className="mb-6 font-display text-lg">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <AdminDataTable
                data={recentOrders}
                keyExtractor={(o) => o.id}
                columns={[
                  { key: 'order', header: 'Order', render: (o) => o.orderNumber },
                  { key: 'customer', header: 'Customer', render: (o) => o.customer.name },
                  { key: 'status', header: 'Status', render: (o) => (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[o.status] ?? ''}`}>{o.status}</span>
                  )},
                  { key: 'total', header: 'Total', render: (o) => formatPrice(o.totalAmount) },
                ]}
              />
            )}
          </motion.div>
        </div>
      </div>
    </AdminShell>
  );
}
