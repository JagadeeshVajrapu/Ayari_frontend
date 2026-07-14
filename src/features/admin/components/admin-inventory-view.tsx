'use client';

import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminDataTable } from './admin-data-table';
import { adminService, type AdminProduct } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { formatPrice } from '@/features/shop/stores/shop.store';

export function AdminInventoryView() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .getProducts({ limit: 100 })
      .then(({ data }) => {
        const lowStock = data.data.items.filter((p) => p.stockQuantity <= p.lowStockThreshold);
        setItems(lowStock);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Inventory" description="Products running low on stock">
      <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-champagne" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Package className="mb-4 h-12 w-12 opacity-40" />
            <p className="font-medium">All products are well stocked</p>
            <p className="mt-1 text-sm">Items appear here when stock falls below the low-stock threshold.</p>
          </div>
        ) : (
          <AdminDataTable
            data={items}
            keyExtractor={(p) => p.id}
            columns={[
              { key: 'name', header: 'Product', render: (p) => p.name },
              { key: 'sku', header: 'SKU', render: (p) => p.sku },
              { key: 'stock', header: 'Stock', render: (p) => (
                <span className="font-medium text-amber-500">{p.stockQuantity}</span>
              )},
              { key: 'threshold', header: 'Threshold', render: (p) => p.lowStockThreshold },
              { key: 'price', header: 'Price', render: (p) => formatPrice(p.price) },
            ]}
          />
        )}
      </div>
    </AdminShell>
  );
}
