import type { ListingProduct } from '@/types/product.types';
import type { ShippingMethod } from '@/features/shop/stores/shop.store';
import { resolveMediaUrl } from '@/lib/media';
import { PRODUCT_PLACEHOLDER } from '@/lib/catalog-constants';
import { resolveProductVariant } from '@/lib/product-variations';

export const FREE_SHIPPING_THRESHOLD = 5000;
export const TAX_RATE = 0.18;

export interface CartLineItem {
  product: ListingProduct;
  variantId?: string;
  variantName?: string;
  displayName: string;
  image: string;
  sku: string;
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
  lineTotal: number;
  stockCount: number;
  inStock: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  savings: number;
}

export function calculateShipping(subtotal: number, method: ShippingMethod): number {
  if (method === 'express') return 499;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 199;
}

export function calculateCartTotals(
  lineItems: CartLineItem[],
  shippingMethod: ShippingMethod,
  discount = 0,
): CartTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const savings = lineItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.unitPrice) * item.quantity;
    }
    return sum;
  }, 0);

  const shipping = lineItems.length > 0 ? calculateShipping(subtotal, shippingMethod) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * TAX_RATE);
  const total = taxableAmount + shipping + tax;

  return { subtotal, discount, shipping, tax, total, itemCount, savings };
}

export function getEstimatedDelivery(method: ShippingMethod): { from: Date; to: Date; label: string } {
  const today = new Date();
  const fromDays = method === 'express' ? 2 : 5;
  const toDays = method === 'express' ? 3 : 7;

  const from = new Date(today);
  from.setDate(from.getDate() + fromDays);

  const to = new Date(today);
  to.setDate(to.getDate() + toDays);

  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' });
  const label = `${formatter.format(from)} – ${formatter.format(to)}`;

  return { from, to, label };
}

export function buildCartLineItem(
  product: ListingProduct,
  quantity: number,
  variantId?: string,
): CartLineItem | null {
  const variant = resolveProductVariant(product, variantId);
  const unitPrice = variant?.price ?? product.price;
  const originalPrice = variant?.compareAtPrice ?? product.originalPrice;
  const stockCount = variant?.stockQuantity ?? product.stockCount;
  const image = variant?.image
    ? resolveMediaUrl(variant.image, PRODUCT_PLACEHOLDER)
    : product.image;
  const sku = variant?.sku ?? product.sku ?? '';
  const variantName = variant?.name;
  const displayName = variantName ? `${product.name} (${variantName})` : product.name;

  return {
    product,
    // Keep the cart's stored variant id so remove/update still match the bag entry
    variantId,
    variantName,
    displayName,
    image,
    sku,
    unitPrice,
    originalPrice,
    quantity,
    lineTotal: unitPrice * quantity,
    stockCount,
    inStock: stockCount > 0,
  };
}
