export interface CartItemRef {
  productId: string;
  variantId?: string;
  quantity: number;
}

export function cartLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function parseCartLineKey(key: string): { productId: string; variantId?: string } {
  const [productId, variantId] = key.split('::');
  return { productId, variantId: variantId || undefined };
}

export function matchCartItem(
  item: CartItemRef,
  productId: string,
  variantId?: string,
): boolean {
  return item.productId === productId && (item.variantId ?? undefined) === (variantId ?? undefined);
}
