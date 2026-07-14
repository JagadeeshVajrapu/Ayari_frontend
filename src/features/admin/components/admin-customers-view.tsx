'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminSearch } from './admin-search';
import { AdminDataTable } from './admin-data-table';
import { AdminPagination } from './admin-pagination';
import { adminService, type AdminCustomer } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';

export function AdminCustomersView() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminService.getCustomers({ page, limit: 10, search: search || undefined });
      setCustomers(data.data.items);
      setTotalPages(data.data.pagination.totalPages);
      setTotalItems(data.data.pagination.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const toggleStatus = async (customer: AdminCustomer) => {
    try {
      await adminService.setCustomerStatus(customer.id, !customer.isActive);
      await loadCustomers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <AdminShell title="Customers" description="View and manage registered customers">
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <AdminSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." className="max-w-sm" />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-champagne" /></div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="font-medium">No customers yet</p>
            <p className="mt-1 text-sm">Customer accounts will appear here after registration.</p>
          </div>
        ) : (
          <AdminDataTable
            data={customers}
            keyExtractor={(c) => c.id}
            columns={[
              { key: 'name', header: 'Customer', render: (c) => (
                <div>
                  <p className="font-medium">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
              )},
              { key: 'phone', header: 'Phone', render: (c) => c.phone ?? '—' },
              { key: 'orders', header: 'Orders', render: (c) => c.orderCount },
              { key: 'joined', header: 'Joined', render: (c) => new Date(c.createdAt).toLocaleDateString('en-IN') },
              { key: 'status', header: 'Status', render: (c) => (
                <button
                  type="button"
                  onClick={() => toggleStatus(c)}
                  className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}
                >
                  {c.isActive ? 'Active' : 'Inactive'}
                </button>
              )},
            ]}
          />
        )}

        <AdminPagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
      </div>
    </AdminShell>
  );
}
