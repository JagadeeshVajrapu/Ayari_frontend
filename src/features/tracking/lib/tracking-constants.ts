import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Package,
  PackageOpen,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export const TIMELINE_ICON_MAP: Record<string, LucideIcon> = {
  'shopping-bag': ShoppingBag,
  'credit-card': CreditCard,
  'check-circle': CheckCircle2,
  store: Store,
  'package-open': PackageOpen,
  package: Package,
  clock: Clock,
  truck: Truck,
  navigation: Navigation,
  building: Building2,
  'map-pin': MapPin,
  check: Check,
  'x-circle': XCircle,
  'rotate-ccw': RotateCcw,
  'refresh-cw': RefreshCw,
  wallet: Wallet,
};

export function getTimelineIcon(icon: string): LucideIcon {
  return TIMELINE_ICON_MAP[icon] ?? Package;
}

export function formatTrackingDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getStatusBadgeClass(status: string) {
  const normalized = status.toUpperCase();
  if (['DELIVERED', 'CAPTURED', 'PAID'].some((s) => normalized.includes(s))) {
    return 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400';
  }
  if (['CANCELLED', 'FAILED', 'RETURNED'].some((s) => normalized.includes(s))) {
    return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400';
  }
  if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'SHIPPED', 'PROCESSING'].some((s) => normalized.includes(s))) {
    return 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400';
  }
  return 'border-champagne/30 bg-champagne/10 text-champagne-dark';
}
