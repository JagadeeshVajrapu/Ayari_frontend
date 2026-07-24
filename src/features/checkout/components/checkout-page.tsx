'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useShopStore } from '@/features/shop/stores/shop.store';
import { calculateCartTotals } from '@/features/cart/lib/cart-calculations';
import { useCartLineItems } from '@/features/cart/hooks/use-cart-line-items';
import { CartCoupon } from '@/features/cart/components/cart-coupon';
import { CartShipping } from '@/features/cart/components/cart-shipping';
import { CartEmpty } from '@/features/cart/components/cart-empty';
import { checkoutSchema, type CheckoutFormData } from '@/features/checkout/schemas/checkout.schema';
import { CheckoutSection } from './checkout-section';
import { ShippingAddressForm } from './shipping-address-form';
import { PaymentMethodSelector } from './payment-method-selector';
import { OrderNotesField } from './order-notes-field';
import { CheckoutOrderSummary } from './checkout-order-summary';
import {
  checkoutService,
  getCheckoutErrorMessage,
  type CheckoutOrderResponse,
  type CreatePaymentOrderPayload,
  type VerifyPaymentPayload,
} from '@/services/checkout.service';
import { openRazorpayCheckout } from '@/features/checkout/lib/razorpay';
import { Button } from '@/components/ui/button';

function isPaidOrder(order: CheckoutOrderResponse): boolean {
  return (
    order.status === 'CONFIRMED' ||
    order.status === 'PROCESSING' ||
    order.status === 'SHIPPED' ||
    order.status === 'DELIVERED' ||
    order.paymentStatus === 'CAPTURED'
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CheckoutPage() {
  const router = useRouter();
  const { cart, appliedCoupon, shippingMethod, clearCart } = useShopStore();
  const { lineItems, loading: cartLoading } = useCartLineItems(cart);
  const [apiError, setApiError] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  /** Tracks Razorpay modal lifecycle to avoid ondismiss cancelling a paid order. */
  const paymentGateRef = useRef<'idle' | 'open' | 'paid' | 'dismissed'>('idle');

  const totals = calculateCartTotals(lineItems, shippingMethod, 0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'razorpay',
      orderNotes: '',
      saveAddress: false,
      shipping: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'IN',
      },
    },
  });

  const paymentMethod = watch('paymentMethod');

  const buildPayload = (data: CheckoutFormData): CreatePaymentOrderPayload => ({
    items: lineItems.map((item) => ({
      productId: item.product.slug,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      quantity: item.quantity,
    })),
    shipping: data.shipping,
    paymentMethod: data.paymentMethod,
    shippingMethod,
    orderNotes: data.orderNotes,
    couponCode: appliedCoupon?.code,
    saveAddress: data.saveAddress,
  });

  const redirectToSuccess = (
    order: { orderId: string; orderNumber: string; status?: string; total?: number },
    method: string,
  ) => {
    clearCart();
    const params = new URLSearchParams({
      orderId: order.orderId,
      order: order.orderNumber,
      method,
      status: order.status ?? 'CONFIRMED',
    });
    if (typeof order.total === 'number') {
      params.set('total', String(order.total));
    }
    router.replace(`/checkout/success?${params.toString()}`);
  };

  const redirectToFailed = (reason: string, orderId?: string) => {
    const params = new URLSearchParams({ reason });
    if (orderId) params.set('orderId', orderId);
    router.replace(`/checkout/failed?${params.toString()}`);
  };

  const abandonPendingOrder = async (orderId: string) => {
    try {
      await checkoutService.abandonOrder(orderId);
    } catch {
      // Best-effort
    }
  };

  const pollUntilPaid = async (orderId: string): Promise<CheckoutOrderResponse | null> => {
    for (let i = 0; i < 6; i += 1) {
      try {
        const { data } = await checkoutService.getOrder(orderId);
        if (isPaidOrder(data.data)) return data.data;
      } catch {
        // keep polling
      }
      await sleep(400);
    }
    return null;
  };

  const verifyWithRetry = async (payload: VerifyPaymentPayload): Promise<CheckoutOrderResponse> => {
    try {
      const { data } = await checkoutService.verifyRazorpayPayment(payload);
      return data.data;
    } catch (firstError) {
      // Razorpay ondismiss may have briefly cancelled the order — wait and retry.
      await sleep(700);
      try {
        const { data } = await checkoutService.verifyRazorpayPayment(payload);
        return data.data;
      } catch {
        const paid = await pollUntilPaid(payload.orderId);
        if (paid) return paid;
        throw firstError;
      }
    }
  };

  const resolveAfterVerifyError = async (orderId: string) => {
    const paid = await pollUntilPaid(orderId);
    if (paid) {
      redirectToSuccess(paid, 'razorpay');
      return;
    }
    redirectToFailed('verification', orderId);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setApiError('');
    const payload = buildPayload(data);

    try {
      if (data.paymentMethod === 'cod') {
        const { data: response } = await checkoutService.placeCodOrder(payload);
        redirectToSuccess(response.data, 'cod');
        return;
      }

      const { data: orderResponse } = await checkoutService.createRazorpayOrder(payload);
      const order = orderResponse.data;

      if (order.mock) {
        setVerifyingPayment(true);
        try {
          const verified = await verifyWithRetry({
            orderId: order.orderId,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${order.orderId}`,
            razorpaySignature: 'mock_signature',
          });
          redirectToSuccess(verified, 'razorpay-demo');
        } catch (error) {
          await resolveAfterVerifyError(order.orderId);
          setApiError(getCheckoutErrorMessage(error));
        } finally {
          setVerifyingPayment(false);
        }
        return;
      }

      if (!order.keyId || !order.razorpayOrderId) {
        setApiError(
          'Payment is not configured correctly. Please try Cash on Delivery or contact support.',
        );
        void abandonPendingOrder(order.orderId);
        return;
      }

      paymentGateRef.current = 'open';

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'AYARI',
        description: 'Luxury Fashion Order',
        order_id: order.razorpayOrderId,
        prefill: {
          name: `${data.shipping.firstName} ${data.shipping.lastName}`,
          email: data.shipping.email,
          contact: data.shipping.phone.replace(/\D/g, '').slice(-10),
        },
        theme: { color: '#C9A96E' },
        handler: async (response) => {
          // Mark paid BEFORE anything async — ondismiss often races with handler.
          paymentGateRef.current = 'paid';
          setVerifyingPayment(true);
          setApiError('');

          try {
            if (
              !response.razorpay_order_id ||
              !response.razorpay_payment_id ||
              !response.razorpay_signature
            ) {
              throw new Error('Incomplete payment response from Razorpay');
            }

            const verified = await verifyWithRetry({
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            redirectToSuccess(verified, 'razorpay');
          } catch (error) {
            await resolveAfterVerifyError(order.orderId);
            setApiError(getCheckoutErrorMessage(error));
          } finally {
            setVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            // Delay: Razorpay frequently closes the modal (ondismiss) right after success.
            window.setTimeout(() => {
              if (paymentGateRef.current === 'paid') return;
              if (paymentGateRef.current !== 'open') return;
              paymentGateRef.current = 'dismissed';
              void abandonPendingOrder(order.orderId);
              setApiError('Payment was cancelled. You can try again or choose another method.');
            }, 1200);
          },
        },
      });
    } catch (error) {
      setApiError(getCheckoutErrorMessage(error));
    }
  };

  if (cartLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
      </div>
    );
  }

  if (lineItems.length === 0) {
    return (
      <div className="section-padding pt-8">
        <div className="container-premium">
          <CartEmpty />
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding pt-8">
      <div className="container-premium">
        {verifyingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-surface-elevated px-8 py-6 shadow-soft">
              <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
              <p className="text-sm font-medium text-foreground">Confirming payment…</p>
              <p className="text-xs text-ink-muted">Please wait — do not close this page.</p>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" className="mb-3 -ml-2" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4" />
                Back to Bag
              </Link>
            </Button>
            <h1 className="font-display text-display-md text-foreground">Checkout</h1>
            <p className="mt-2 text-ink-muted">Complete your order securely</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            >
              {apiError}
            </motion.div>
          )}

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="space-y-6 lg:col-span-2">
              <CheckoutSection
                step={1}
                title="Shipping Address"
                description="Where should we deliver your order?"
              >
                <ShippingAddressForm register={register} errors={errors} />
              </CheckoutSection>

              <CheckoutSection
                step={2}
                title="Payment Method"
                description="Choose how you'd like to pay"
              >
                <PaymentMethodSelector
                  register={register}
                  watch={watch}
                  errors={errors}
                />
              </CheckoutSection>

              <CheckoutSection step={3} title="Order Notes" description="Any special instructions?">
                <OrderNotesField register={register} errors={errors} />
              </CheckoutSection>

              <div className="grid gap-4 sm:grid-cols-2">
                <CartCoupon />
                <CartShipping subtotal={totals.subtotal} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <CheckoutOrderSummary
                lineItems={lineItems}
                totals={totals}
                shippingMethod={shippingMethod}
                isSubmitting={isSubmitting || verifyingPayment}
                paymentMethod={paymentMethod}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
