'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  CreditCard,
  StickyNote,
  ExternalLink,
} from 'lucide-react';
import { AdminShell } from './admin-shell';
import { TrackingTimeline } from '@/features/tracking/components/tracking-timeline';
import { TrackingHistoryList } from '@/features/tracking/components/tracking-history-list';
import type { TrackingHistoryItem, TrackingTimelineStep } from '@/features/tracking/types/tracking.types';
import {
  shipmentAdminService,
  ADMIN_ACTION_LABELS,
  SHIPMENT_STATUS_COLORS,
  SHIPMENT_STATUS_LABELS,
  type AdminShipmentAction,
  type AdminShipmentDetail,
  type CourierPartner,
  type ShipmentNoteType,
  type ShipmentStatus,
} from '@/services/shipment-admin.service';
import { trackingService } from '@/services/tracking.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NOTE_TYPES: Array<{ value: ShipmentNoteType; label: string }> = [
  { value: 'GENERAL', label: 'General Note' },
  { value: 'SPECIAL_INSTRUCTIONS', label: 'Special Instructions' },
  { value: 'PACKAGE_DAMAGED', label: 'Package Damaged' },
  { value: 'CUSTOMER_DELAY', label: 'Customer Requested Delay' },
  { value: 'ADDRESS_UPDATED', label: 'Address Updated' },
  { value: 'DELIVERY_FAILED', label: 'Delivery Attempt Failed' },
];

const ACTIONS_BY_STATUS: Partial<Record<ShipmentStatus, AdminShipmentAction[]>> = {
  PENDING: ['ACCEPT_ORDER', 'REJECT_ORDER'],
  CONFIRMED: ['START_PACKING', 'CANCEL'],
  PACKING: ['MARK_PACKED', 'CANCEL'],
  PACKED: ['READY_FOR_PICKUP', 'ASSIGN_COURIER', 'GENERATE_TRACKING', 'CANCEL'],
  READY_FOR_PICKUP: ['ASSIGN_COURIER', 'GENERATE_TRACKING', 'PICKED_UP', 'CANCEL'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['REACHED_HUB'],
  REACHED_HUB: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURN'],
  DELIVERED: ['RETURN'],
  RETURNED: ['APPROVE_RETURN', 'INITIATE_REFUND', 'COMPLETE_REFUND'],
  CANCELLED: [],
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function buildHistoryItems(shipment: AdminShipmentDetail): TrackingHistoryItem[] {
  const events = shipment.trackingEvents ?? [];
  return [...events]
    .sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())
    .map((event) => {
      const { date, time } = formatDateTime(event.eventAt);
      return {
        id: event.id,
        status: event.status,
        statusLabel: SHIPMENT_STATUS_LABELS[event.status],
        description: event.description,
        location: event.location,
        updatedBy: 'Admin',
        eventAt: event.eventAt,
        date,
        time,
      };
    });
}

function buildTimelineSteps(shipment: AdminShipmentDetail): TrackingTimelineStep[] {
  const flow: ShipmentStatus[] = [
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
  ];

  const history = shipment.statusHistory ?? [];
  const statusDates = new Map<ShipmentStatus, string>();
  history.forEach((h) => {
    if (!statusDates.has(h.status)) statusDates.set(h.status, h.createdAt);
  });

  const currentIdx = flow.indexOf(shipment.status);
  const isException = ['CANCELLED', 'RETURNED'].includes(shipment.status);

  return flow.map((status, idx) => {
    const eventAt = statusDates.get(status);
    const { date, time } = eventAt ? formatDateTime(eventAt) : { date: null, time: null };
    let state: TrackingTimelineStep['state'] = 'upcoming';
    if (isException) {
      state = idx <= currentIdx && currentIdx >= 0 ? 'completed' : 'upcoming';
    } else if (idx < currentIdx) state = 'completed';
    else if (idx === currentIdx) state = 'current';
    else state = 'upcoming';

    return {
      key: status,
      label: SHIPMENT_STATUS_LABELS[status],
      description: history.find((h) => h.status === status)?.note ?? '',
      state,
      date,
      time,
      location: history.find((h) => h.status === status)?.location ?? null,
      updatedBy: history.find((h) => h.status === status)?.createdBy ? 'Admin' : null,
      icon: status === 'DELIVERED' ? 'check' : status.includes('TRANSIT') || status.includes('PICKUP') ? 'truck' : 'package',
    };
  });
}

interface AdminShipmentDetailViewProps {
  shipmentId: string;
}

export function AdminShipmentDetailView({ shipmentId }: AdminShipmentDetailViewProps) {
  const router = useRouter();
  const [shipment, setShipment] = useState<AdminShipmentDetail | null>(null);
  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [noteType, setNoteType] = useState<ShipmentNoteType>('GENERAL');
  const [noteContent, setNoteContent] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [showCourierPicker, setShowCourierPicker] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [detail, courierList] = await Promise.all([
        shipmentAdminService.getShipment(shipmentId),
        shipmentAdminService.getCouriers(),
      ]);
      setShipment(detail);
      setCouriers(courierList.filter((c) => c.isActive));
      if (courierList.length) setSelectedCourier(courierList[0].id);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    load();
  }, [load]);

  const availableActions = useMemo(() => {
    if (!shipment) return [];
    return ACTIONS_BY_STATUS[shipment.status] ?? [];
  }, [shipment]);

  const historyItems = useMemo(() => (shipment ? buildHistoryItems(shipment) : []), [shipment]);
  const timelineSteps = useMemo(() => (shipment ? buildTimelineSteps(shipment) : []), [shipment]);

  const runAction = async (action: AdminShipmentAction) => {
    if (!shipment) return;

    if (action === 'ASSIGN_COURIER') {
      setShowCourierPicker(true);
      return;
    }

    setActionLoading(action);
    setError('');
    try {
      const updated = await shipmentAdminService.performAction(shipment.id, { action });
      setShipment(updated);
      trackingService.invalidateCache(shipment.orderId);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const runShiprocket = async (
    action: 'sync' | 'pickup' | 'label' | 'refresh' | 'cancel' | 'return',
  ) => {
    if (!shipment) return;
    setActionLoading(action);
    setError('');
    try {
      const updated =
        action === 'sync'
          ? await shipmentAdminService.syncShiprocket(shipment.id)
          : action === 'pickup'
            ? await shipmentAdminService.requestPickup(shipment.id)
            : action === 'label'
              ? await shipmentAdminService.generateLabel(shipment.id)
              : action === 'refresh'
                ? await shipmentAdminService.refreshTracking(shipment.id)
                : action === 'cancel'
                  ? await shipmentAdminService.cancelShiprocket(shipment.id)
                  : await shipmentAdminService.createReturn(shipment.id);
      setShipment(updated);
      trackingService.invalidateCache(shipment.orderId);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignCourier = async () => {
    if (!shipment || !selectedCourier) return;
    setActionLoading('ASSIGN_COURIER');
    setError('');
    try {
      const updated = await shipmentAdminService.performAction(shipment.id, {
        action: 'ASSIGN_COURIER',
        courierPartnerId: selectedCourier,
      });
      setShipment(updated);
      setShowCourierPicker(false);
      trackingService.invalidateCache(shipment.orderId);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async () => {
    if (!shipment || !noteContent.trim()) return;
    setActionLoading('note');
    setError('');
    try {
      const updated = await shipmentAdminService.addNote(shipment.id, {
        type: noteType,
        content: noteContent.trim(),
      });
      setShipment(updated);
      setNoteContent('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Shipment Details" description="Loading shipment...">
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-champagne" />
        </div>
      </AdminShell>
    );
  }

  if (!shipment) {
    return (
      <AdminShell title="Shipment Details" description="Shipment not found">
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Shipment could not be loaded.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/shipments')}>
            Back to shipments
          </Button>
        </div>
      </AdminShell>
    );
  }

  const addr = shipment.shippingAddress;

  return (
    <AdminShell
      title={shipment.shipmentNumber}
      description={`Order ${shipment.orderNumber} · ${SHIPMENT_STATUS_LABELS[shipment.status]}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/shipments"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shipments
          </Link>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              SHIPMENT_STATUS_COLORS[shipment.status],
            )}
          >
            {SHIPMENT_STATUS_LABELS[shipment.status]}
          </span>
          {shipment.trackingUrl && (
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
            >
              Track externally <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {availableActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card/50 p-4"
          >
            <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Admin Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => (
                <Button
                  key={action}
                  size="sm"
                  variant={
                    action.includes('CANCEL') || action.includes('REJECT') || action === 'RETURN'
                      ? 'outline'
                      : 'default'
                  }
                  className={
                    action.includes('CANCEL') || action.includes('REJECT') || action === 'RETURN'
                      ? 'border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400'
                      : undefined
                  }
                  disabled={!!actionLoading}
                  onClick={() => runAction(action)}
                >
                  {actionLoading === action ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  {ADMIN_ACTION_LABELS[action]}
                </Button>
              ))}
            </div>

            {showCourierPicker && (
              <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Select Courier
                  <select
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="min-w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button size="sm" onClick={handleAssignCourier} disabled={actionLoading === 'ASSIGN_COURIER'}>
                  Confirm Assignment
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCourierPicker(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-4"
        >
          <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Documents & Shiprocket
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!!actionLoading}
              onClick={() => void shipmentAdminService.openInvoice(shipment.id)}
            >
              View Invoice
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!!actionLoading}
              onClick={() => void shipmentAdminService.openInvoice(shipment.id)}
            >
              Download Invoice
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!!actionLoading}
              onClick={() => void shipmentAdminService.openInvoice(shipment.id)}
            >
              Print Invoice
            </Button>
            {shipment.shippingLabelUrl ? (
              <>
                <Button size="sm" variant="outline" asChild>
                  <a href={shipment.shippingLabelUrl} target="_blank" rel="noopener noreferrer">
                    View Shipping Label
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={shipment.shippingLabelUrl} download target="_blank" rel="noopener noreferrer">
                    Download Shipping Label
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={shipment.shippingLabelUrl} target="_blank" rel="noopener noreferrer">
                    Print Shipping Label
                  </a>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={!!actionLoading || !shipment.shiprocketShipmentId}
                onClick={() => void runShiprocket('label')}
              >
                {actionLoading === 'label' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                Generate Shipping Label
              </Button>
            )}
            {!shipment.shiprocketOrderId && (
              <Button
                size="sm"
                disabled={!!actionLoading}
                onClick={() => void runShiprocket('sync')}
              >
                {actionLoading === 'sync' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                Create Shiprocket Shipment
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!!actionLoading || !shipment.shiprocketShipmentId}
              onClick={() => void runShiprocket('pickup')}
            >
              {actionLoading === 'pickup' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Request Pickup
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!!actionLoading}
              onClick={() => void runShiprocket('refresh')}
            >
              {actionLoading === 'refresh' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Refresh Tracking
            </Button>
            {shipment.trackingUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer">
                  Track Shipment
                </a>
              </Button>
            )}
            {shipment.shiprocketOrderId && shipment.status !== 'CANCELLED' && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/40 text-red-600"
                disabled={!!actionLoading}
                onClick={() => void runShiprocket('cancel')}
              >
                Cancel Shipment
              </Button>
            )}
            {['DELIVERED', 'OUT_FOR_DELIVERY', 'RETURNED'].includes(shipment.status) && (
              <Button
                size="sm"
                variant="outline"
                disabled={!!actionLoading}
                onClick={() => void runShiprocket('return')}
              >
                Create Return
              </Button>
            )}
            {shipment.order.payment?.status === 'CAPTURED' && (
              <Button
                size="sm"
                variant="outline"
                disabled={!!actionLoading}
                onClick={() => void runAction('INITIATE_REFUND')}
              >
                Refund
              </Button>
            )}
          </div>
          {(shipment.shiprocketOrderId || shipment.awbNumber) && (
            <p className="mt-3 text-xs text-muted-foreground">
              SR Order: {shipment.shiprocketOrderId ?? '—'} · SR Shipment:{' '}
              {shipment.shiprocketShipmentId ?? '—'} · AWB: {shipment.awbNumber ?? '—'}
            </p>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <InfoSection title="Order Information" icon={<Package className="h-4 w-4" />}>
              <InfoRow label="Order #" value={shipment.orderNumber} />
              <InfoRow label="Order Status" value={shipment.order.status} />
              <InfoRow label="Shipment Status" value={shipment.status} />
              <InfoRow
                label="Placed"
                value={shipment.order.placedAt ? formatDateTime(shipment.order.placedAt).date : '—'}
              />
              <InfoRow label="Shipping Method" value={shipment.shippingMethod.replace(/_/g, ' ')} />
            </InfoSection>

            <InfoSection title="Customer" icon={<User className="h-4 w-4" />}>
              <InfoRow label="Name" value={shipment.customerName} />
              <InfoRow label="Email" value={shipment.customerEmail} />
              {shipment.customerPhone && (
                <InfoRow label="Phone" value={shipment.customerPhone} icon={<Phone className="h-3 w-3" />} />
              )}
            </InfoSection>

            <InfoSection title="Shipping Address" icon={<MapPin className="h-4 w-4" />}>
              <p className="text-sm text-foreground">
                {addr.street}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
              </p>
            </InfoSection>

            <InfoSection title="Courier Details" icon={<Truck className="h-4 w-4" />}>
              <InfoRow label="Courier" value={shipment.courierName} />
              <InfoRow label="Tracking #" value={shipment.trackingNumber} mono />
              <InfoRow label="AWB" value={shipment.awbNumber ?? '—'} mono />
              <InfoRow label="Pickup Status" value={shipment.pickupStatus ?? 'NOT_REQUESTED'} />
              <InfoRow label="Delivery Status" value={shipment.deliveryStatus ?? '—'} />
              <InfoRow
                label="Est. Delivery"
                value={new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN')}
              />
              {shipment.warehouse && <InfoRow label="Warehouse" value={shipment.warehouse} />}
              {shipment.packageWeight && <InfoRow label="Weight" value={shipment.packageWeight} />}
              {shipment.packageDimensions && <InfoRow label="Dimensions" value={shipment.packageDimensions} />}
            </InfoSection>

            <InfoSection title="Payment" icon={<CreditCard className="h-4 w-4" />}>
              {shipment.order.payment ? (
                <>
                  <InfoRow label="Method" value={shipment.order.payment.method} />
                  <InfoRow label="Status" value={shipment.order.payment.status} />
                  <InfoRow label="Amount" value={formatPrice(shipment.order.payment.amount)} />
                  {shipment.order.payment.transactionId && (
                    <InfoRow label="Transaction" value={shipment.order.payment.transactionId} mono />
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No payment record</p>
              )}
            </InfoSection>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
              <h3 className="font-display text-lg">Products</h3>
              <div className="mt-4 divide-y divide-border/60">
                {shipment.order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">
                        {item.productName}
                        {item.variantName ? ` (${item.variantName})` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.productSku} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                  </div>
                ))}
                <div className="space-y-1 pt-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(shipment.order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{formatPrice(shipment.order.shippingCharges)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(shipment.order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <TrackingTimeline steps={timelineSteps} />
            <TrackingHistoryList items={historyItems} />

            <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-display text-lg">Shipment Notes</h3>
              </div>

              <div className="mt-4 space-y-3">
                {shipment.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : (
                  shipment.notes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-xs font-medium text-brand">{note.type.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(note.createdAt).date} · {note.createdByLabel ?? 'Admin'}
                        </span>
                      </div>
                      <p className="mt-1">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Add Delivery Note
                </p>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as ShipmentNoteType)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {NOTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add special instructions or delivery notes..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <Button size="sm" onClick={handleAddNote} disabled={!noteContent.trim() || actionLoading === 'note'}>
                  {actionLoading === 'note' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-right font-medium', mono && 'font-mono text-xs')}>
        {icon && <span className="mr-1 inline">{icon}</span>}
        {value}
      </span>
    </div>
  );
}
