'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminSearch, AdminFilterSelect } from './admin-search';
import { AdminDataTable } from './admin-data-table';
import { AdminPagination } from './admin-pagination';
import { adminService, type AdminOrder } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { formatPrice } from '@/features/shop/stores/shop.store';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  CONFIRMED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  PROCESSING: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  SHIPPED: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  DELIVERED: 'bg-green-500/15 text-green-600 dark:text-green-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  REFUNDED: 'bg-muted text-muted-foreground',
};

export function AdminOrdersView() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminService.getOrders({
        page,
        limit: 10,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
      });
      setOrders(data.data.items);
      setTotalPages(data.data.pagination.totalPages);
      setTotalItems(data.data.pagination.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <AdminShell title="Orders" description="View and manage all customer orders">
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search orders..." className="min-w-[200px] flex-1" />
          <AdminFilterSelect
            label="Status"
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[{ label: 'All statuses', value: 'all' }, ...STATUS_OPTIONS.map((s) => ({ label: s, value: s }))]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-champagne" /></div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="font-medium">No orders found</p>
            <p className="mt-1 text-sm">Orders will appear here when customers checkout.</p>
          </div>
        ) : (
          <AdminDataTable
            data={orders}
            keyExtractor={(o) => o.id}
            columns={[
              { key: 'order', header: 'Order #', render: (o) => <span className="font-medium">{o.orderNumber}</span> },
              { key: 'customer', header: 'Customer', render: (o) => (
                <div>
                  <p>{o.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer.email}</p>
                </div>
              )},
              { key: 'items', header: 'Items', render: (o) => (
                <div className="space-y-1">
                  {o.items.map((item, index) => (
                    <p key={`${o.id}-item-${index}`} className="text-xs text-muted-foreground">
                      {item.productName}
                      {item.variantName ? ` · ${item.variantName}` : ''}
                      {item.productSku ? ` · SKU ${item.productSku}` : ''}
                      {' · '}×{item.quantity}
                    </p>
                  ))}
                </div>
              ) },
              { key: 'status', header: 'Status', render: (o) => (
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] ?? ''}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )},
              { key: 'total', header: 'Total', render: (o) => formatPrice(o.totalAmount) },
              { key: 'date', header: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString('en-IN') },
            ]}
          />
        )}

        <AdminPagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
      </div>
    </AdminShell>
  );
}
