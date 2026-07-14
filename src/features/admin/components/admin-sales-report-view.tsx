'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminBarChart } from './admin-charts';
import { AdminDataTable } from './admin-data-table';
import { adminService, type AdminOrder } from '@/services/admin.service';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { Button } from '@/components/ui/button';
import { AdminFilterSelect } from './admin-search';

const PERIODS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This year', value: 'year' },
];

export function AdminSalesReportView() {
  const [period, setPeriod] = useState('30d');
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    adminService
      .getOrders({ limit: 50 })
      .then(({ data }) => setOrders(data.data.items))
      .catch(() => setOrders([]));
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const revenueChart = orders.slice(0, 6).map((order) => ({
    label: order.orderNumber.slice(-6),
    value: order.totalAmount,
  }));

  return (
    <AdminShell
      title="Sales Report"
      description="Revenue and order performance"
      actions={
        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4" />
          Export
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <AdminFilterSelect
          label="Period"
          value={period}
          onChange={setPeriod}
          options={PERIODS}
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground">Average Order</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatPrice(avgOrder)}</p>
        </div>
      </div>

      {revenueChart.length > 0 ? (
        <div className="mb-8 rounded-2xl border border-border/60 bg-card/50 p-6">
          <h2 className="mb-6 font-display text-lg text-foreground">Recent Order Revenue</h2>
          <AdminBarChart data={revenueChart} formatValue={formatPrice} />
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-border/60 bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">No orders yet. Sales data will appear after customers checkout.</p>
        </div>
      )}

      <AdminDataTable
        columns={[
          { key: 'orderNumber', header: 'Order', render: (order) => order.orderNumber },
          { key: 'customer', header: 'Customer', render: (order) => order.customer.name },
          { key: 'status', header: 'Status', render: (order) => order.status },
          {
            key: 'totalAmount',
            header: 'Total',
            render: (order) => formatPrice(order.totalAmount),
          },
        ]}
        data={orders}
        keyExtractor={(order) => order.id}
        emptyMessage="No orders recorded yet."
      />
    </AdminShell>
  );
}
