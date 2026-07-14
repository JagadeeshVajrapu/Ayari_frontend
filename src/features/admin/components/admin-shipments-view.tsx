'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, Truck, Eye, Settings2 } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { AdminSearch, AdminFilterSelect } from './admin-search';
import { AdminDataTable } from './admin-data-table';
import { AdminPagination } from './admin-pagination';
import { AdminStatCard } from './admin-stat-card';
import {
  shipmentAdminService,
  SHIPMENT_STATUS_COLORS,
  SHIPMENT_STATUS_LABELS,
  type CourierPartner,
  type ShipmentDashboardStats,
  type ShipmentListItem,
  type ShipmentStatus,
} from '@/services/shipment-admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: ShipmentStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PACKING',
  'PACKED',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'REACHED_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];

const DASHBOARD_CARDS: Array<{
  key: keyof ShipmentDashboardStats;
  label: string;
  status?: ShipmentStatus;
}> = [
  { key: 'total', label: 'Total Shipments' },
  { key: 'pending', label: 'Pending', status: 'PENDING' },
  { key: 'confirmed', label: 'Confirmed', status: 'CONFIRMED' },
  { key: 'packing', label: 'Packing', status: 'PACKING' },
  { key: 'packed', label: 'Packed', status: 'PACKED' },
  { key: 'readyForPickup', label: 'Ready For Pickup', status: 'READY_FOR_PICKUP' },
  { key: 'pickedUp', label: 'Picked Up', status: 'PICKED_UP' },
  { key: 'inTransit', label: 'In Transit', status: 'IN_TRANSIT' },
  { key: 'reachedHub', label: 'Reached Hub', status: 'REACHED_HUB' },
  { key: 'outForDelivery', label: 'Out For Delivery', status: 'OUT_FOR_DELIVERY' },
  { key: 'delivered', label: 'Delivered', status: 'DELIVERED' },
  { key: 'cancelled', label: 'Cancelled', status: 'CANCELLED' },
  { key: 'returned', label: 'Returned', status: 'RETURNED' },
  { key: 'refundPending', label: 'Refund Pending' },
  { key: 'refundCompleted', label: 'Refund Completed' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminShipmentsView() {
  const [stats, setStats] = useState<ShipmentDashboardStats | null>(null);
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [courierId, setCourierId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'estimatedDelivery' | 'status' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await shipmentAdminService.getDashboard();
      setStats(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadCouriers = useCallback(async () => {
    try {
      const data = await shipmentAdminService.getCouriers();
      setCouriers(data);
    } catch {
      /* couriers optional for list */
    }
  }, []);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await shipmentAdminService.getShipments({
        page,
        limit: 15,
        search: search || undefined,
        status: status !== 'all' ? (status as ShipmentStatus) : undefined,
        courierPartnerId: courierId !== 'all' ? courierId : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy,
        sortOrder,
      });
      setShipments(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, courierId, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    loadStats();
    loadCouriers();
  }, [loadStats, loadCouriers]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const courierOptions = useMemo(
    () => [{ label: 'All couriers', value: 'all' }, ...couriers.map((c) => ({ label: c.name, value: c.id }))],
    [couriers],
  );

  const handleStatClick = (cardStatus?: ShipmentStatus) => {
    if (cardStatus) {
      setStatus(cardStatus);
      setPage(1);
    }
  };

  return (
    <AdminShell
      title="Shipment Management"
      description="Monitor shipments, update status, and manage fulfillment"
      actions={
        <Link
          href="/admin/couriers"
          className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" />
          Courier Partners
        </Link>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DASHBOARD_CARDS.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => handleStatClick(card.status)}
              className={cn(
                'text-left transition-transform hover:scale-[1.02]',
                card.status && status === card.status && 'ring-2 ring-brand/40 rounded-2xl',
              )}
            >
              <AdminStatCard
                label={card.label}
                value={statsLoading ? '—' : String(stats?.[card.key] ?? 0)}
                icon={card.key === 'total' ? <Package className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
              />
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <AdminSearch
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search shipment, order, tracking..."
              className="min-w-[200px] flex-1"
            />
            <AdminFilterSelect
              label="Status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { label: 'All statuses', value: 'all' },
                ...STATUS_OPTIONS.map((s) => ({ label: SHIPMENT_STATUS_LABELS[s], value: s })),
              ]}
            />
            <AdminFilterSelect
              label="Courier"
              value={courierId}
              onChange={(v) => {
                setCourierId(v);
                setPage(1);
              }}
              options={courierOptions}
            />
            <AdminFilterSelect
              label="Sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(v) => {
                const [by, order] = v.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(by);
                setSortOrder(order);
                setPage(1);
              }}
              options={[
                { label: 'Newest first', value: 'createdAt-desc' },
                { label: 'Oldest first', value: 'createdAt-asc' },
                { label: 'ETA soonest', value: 'estimatedDelivery-asc' },
                { label: 'Recently updated', value: 'updatedAt-desc' },
                { label: 'Status A-Z', value: 'status-asc' },
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              To
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-champagne" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">No shipments found</p>
              <p className="mt-1 text-sm">Shipments are created automatically when orders are paid.</p>
            </div>
          ) : (
            <>
              <AdminDataTable
                data={shipments}
                keyExtractor={(s) => s.id}
                columns={[
                  {
                    key: 'shipment',
                    header: 'Shipment #',
                    render: (s) => (
                      <Link href={`/admin/shipments/${s.id}`} className="font-medium text-brand hover:underline">
                        {s.shipmentNumber}
                      </Link>
                    ),
                  },
                  { key: 'order', header: 'Order #', render: (s) => s.orderNumber },
                  {
                    key: 'customer',
                    header: 'Customer',
                    render: (s) => (
                      <div>
                        <p>{s.customerName}</p>
                        {s.customerPhone && <p className="text-xs text-muted-foreground">{s.customerPhone}</p>}
                      </div>
                    ),
                  },
                  { key: 'courier', header: 'Courier', render: (s) => s.courierName },
                  {
                    key: 'tracking',
                    header: 'Tracking #',
                    render: (s) => (
                      <span className="font-mono text-xs">{s.trackingNumber}</span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (s) => (
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          SHIPMENT_STATUS_COLORS[s.status],
                        )}
                      >
                        {SHIPMENT_STATUS_LABELS[s.status]}
                      </span>
                    ),
                  },
                  {
                    key: 'eta',
                    header: 'Est. Delivery',
                    render: (s) => formatDate(s.estimatedDelivery),
                  },
                  {
                    key: 'created',
                    header: 'Created',
                    render: (s) => formatDate(s.createdAt),
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (s) => (
                      <Link
                        href={`/admin/shipments/${s.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    ),
                  },
                ]}
              />
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
