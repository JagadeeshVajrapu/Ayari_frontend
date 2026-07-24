import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ListingProduct } from '@/types/product.types';
import { matchCartItem, matchCartItemForRemove } from '@/features/shop/lib/cart-keys';

const MAX_COMPARE = 4;

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

export type ShippingMethod = 'standard' | 'express';

interface ShopState {
  wishlist: string[];
  compare: string[];
  cart: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  shippingMethod: ShippingMethod;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleCompare: (productId: string) => boolean;
  isInCompare: (productId: string) => boolean;
  addToCart: (productId: string, quantity?: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  moveToWishlist: (productId: string, variantId?: string) => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  clearCart: () => void;
  cartCount: () => number;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      compare: [],
      cart: [],
      appliedCoupon: null,
      shippingMethod: 'standard' as ShippingMethod,

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      isInWishlist: (productId) => get().wishlist.includes(productId),

      toggleCompare: (productId) => {
        const { compare } = get();
        if (compare.includes(productId)) {
          set({ compare: compare.filter((id) => id !== productId) });
          return false;
        }
        if (compare.length >= MAX_COMPARE) return false;
        set({ compare: [...compare, productId] });
        return true;
      },

      isInCompare: (productId) => get().compare.includes(productId),

      addToCart: (productId, quantity = 1, variantId) =>
        set((state) => {
          const existing = state.cart.find((item) => matchCartItem(item, productId, variantId));
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                matchCartItem(item, productId, variantId)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return {
            cart: [...state.cart, { productId, ...(variantId ? { variantId } : {}), quantity }],
          };
        }),

      removeFromCart: (productId, variantId) =>
        set((state) => {
          const next = state.cart.filter(
            (item) => !matchCartItemForRemove(item, productId, variantId),
          );
          if (next.length === state.cart.length) {
            return { cart: state.cart.filter((item) => item.productId !== productId) };
          }
          return { cart: next };
        }),

      updateCartQuantity: (productId, quantity, variantId) =>
        set((state) => {
          if (quantity < 1) {
            return {
              cart: state.cart.filter(
                (item) => !matchCartItemForRemove(item, productId, variantId),
              ),
            };
          }
          const hasMatch = state.cart.some((item) => matchCartItem(item, productId, variantId));
          if (!hasMatch) {
            return {
              cart: state.cart.map((item) =>
                matchCartItemForRemove(item, productId, variantId)
                  ? { ...item, quantity }
                  : item,
              ),
            };
          }
          return {
            cart: state.cart.map((item) =>
              matchCartItem(item, productId, variantId) ? { ...item, quantity } : item,
            ),
          };
        }),

      moveToWishlist: (productId, variantId) => {
        const { wishlist, cart } = get();
        set({
          wishlist: wishlist.includes(productId) ? wishlist : [...wishlist, productId],
          cart: cart.filter((item) => !matchCartItemForRemove(item, productId, variantId)),
        });
      },

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

      setShippingMethod: (method) => set({ shippingMethod: method }),

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'ayari-shop',
      version: 2,
      migrate: (persisted) => {
        // Clear stale local cart/wishlist history after account data reset
        const state = (persisted ?? {}) as Partial<ShopState>;
        return {
          wishlist: [],
          compare: [],
          cart: [],
          appliedCoupon: null,
          shippingMethod: state.shippingMethod ?? 'standard',
        };
      },
      partialize: (state) => ({
        wishlist: state.wishlist,
        compare: state.compare,
        cart: state.cart,
        appliedCoupon: state.appliedCoupon,
        shippingMethod: state.shippingMethod,
      }),
    },
  ),
);

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export type { ListingProduct };
