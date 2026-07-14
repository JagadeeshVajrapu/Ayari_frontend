import { placeholderImage } from '@/lib/placeholder-image';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface AccountOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  total: number;
  itemCount: number;
  items: OrderItem[];
}

export interface AccountAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  label: string;
  last4?: string;
  brand?: string;
  upiId?: string;
  expiry?: string;
  isDefault: boolean;
}

export interface AccountNotification {
  id: string;
  title: string;
  description: string;
  category: 'orders' | 'promotions' | 'account' | 'wishlist';
  read: boolean;
  createdAt: string;
}

export const MOCK_ORDERS: AccountOrder[] = [
  {
    id: 'ord_1',
    orderNumber: 'AYARI-MK8X2F-A3B7',
    status: 'DELIVERED',
    placedAt: '2026-06-18T10:30:00Z',
    total: 24899,
    itemCount: 2,
    items: [
      {
        id: '1',
        name: 'Silk Drape Blazer',
        image: placeholderImage('order-1', 400, 400),
        quantity: 1,
        price: 18999,
      },
      {
        id: '2',
        name: 'Sculpted Leather Tote',
        image: placeholderImage('order-2', 400, 400),
        quantity: 1,
        price: 5900,
      },
    ],
  },
  {
    id: 'ord_2',
    orderNumber: 'AYARI-MK7P1Q-C9D2',
    status: 'SHIPPED',
    placedAt: '2026-06-28T14:15:00Z',
    total: 12500,
    itemCount: 1,
    items: [
      {
        id: '3',
        name: 'Merino Wool Overcoat',
        image: placeholderImage('order-3', 400, 400),
        quantity: 1,
        price: 12500,
      },
    ],
  },
  {
    id: 'ord_3',
    orderNumber: 'AYARI-MK6N0R-E1F4',
    status: 'PROCESSING',
    placedAt: '2026-07-01T09:00:00Z',
    total: 8900,
    itemCount: 1,
    items: [
      {
        id: '4',
        name: 'Cashmere Crew Neck',
        image: placeholderImage('order-4', 400, 400),
        quantity: 1,
        price: 8900,
      },
    ],
  },
];

export const MOCK_ADDRESSES: AccountAddress[] = [
  {
    id: 'addr_1',
    label: 'Home',
    firstName: 'Jane',
    lastName: 'Doe',
    street: '42 Marine Drive, Apartment 12B',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400002',
    country: 'India',
    phone: '+91 98765 43210',
    isDefault: true,
  },
  {
    id: 'addr_2',
    label: 'Office',
    firstName: 'Jane',
    lastName: 'Doe',
    street: 'Bandra Kurla Complex, Tower 3, Floor 8',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400051',
    country: 'India',
    phone: '+91 98765 43210',
    isDefault: false,
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    label: 'Visa ending in 4242',
    last4: '4242',
    brand: 'Visa',
    expiry: '12/28',
    isDefault: true,
  },
  {
    id: 'pm_2',
    type: 'upi',
    label: 'UPI',
    upiId: 'jane@upi',
    isDefault: false,
  },
];

export const MOCK_NOTIFICATIONS: AccountNotification[] = [
  {
    id: 'notif_1',
    title: 'Order Shipped',
    description: 'Your order AYARI-MK7P1Q-C9D2 is on its way. Track your package.',
    category: 'orders',
    read: false,
    createdAt: '2026-06-29T08:00:00Z',
  },
  {
    id: 'notif_2',
    title: 'Exclusive Summer Sale',
    description: 'Early access to our summer collection — 20% off for members.',
    category: 'promotions',
    read: false,
    createdAt: '2026-06-27T12:00:00Z',
  },
  {
    id: 'notif_3',
    title: 'Wishlist Price Drop',
    description: 'Merino Wool Overcoat is now ₹12,500 — save ₹2,000.',
    category: 'wishlist',
    read: true,
    createdAt: '2026-06-25T16:30:00Z',
  },
  {
    id: 'notif_4',
    title: 'Profile Updated',
    description: 'Your account information was successfully updated.',
    category: 'account',
    read: true,
    createdAt: '2026-06-20T10:00:00Z',
  },
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline' | 'dark'
> = {
  PENDING: 'outline',
  CONFIRMED: 'secondary',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'dark',
  CANCELLED: 'outline',
};
