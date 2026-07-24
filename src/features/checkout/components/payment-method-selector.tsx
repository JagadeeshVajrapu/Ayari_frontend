'use client';

import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import type { CheckoutFormData } from '@/features/checkout/schemas/checkout.schema';
import { isRazorpayConfigured } from '@/features/checkout/lib/razorpay';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  register: UseFormRegister<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

const METHODS = [
  {
    id: 'razorpay' as const,
    label: 'Pay Online',
    description: 'Cards, UPI, Net Banking & Wallets via Razorpay',
    icon: CreditCard,
    badges: [
      { icon: CreditCard, label: 'Cards' },
      { icon: Smartphone, label: 'UPI' },
      { icon: Building2, label: 'Net Banking' },
    ],
  },
  {
    id: 'cod' as const,
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives at your doorstep',
    icon: Banknote,
    badges: [],
  },
];

export function PaymentMethodSelector({
  register,
  watch,
  errors,
}: PaymentMethodSelectorProps) {
  const selected = watch('paymentMethod');
  const liveTestMode = isRazorpayConfigured();

  return (
    <div className="space-y-3">
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {liveTestMode ? (
            <>
              <p className="font-medium">Razorpay Test Mode</p>
              <p className="mt-1 text-amber-800/90 dark:text-amber-200/80">
                Use test cards only — e.g.{' '}
                <span className="font-mono">4111 1111 1111 1111</span>, any future expiry, any
                CVV. UPI/Net Banking test options appear in the Razorpay modal.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Local mock checkout</p>
              <p className="mt-1 text-amber-800/90 dark:text-amber-200/80">
                Online Pay completes without the Razorpay modal until you set matching Test Mode
                keys in <span className="font-mono">backend/.env</span> and{' '}
                <span className="font-mono">frontend/.env.local</span>, with{' '}
                <span className="font-mono">RAZORPAY_MOCK=false</span>.
              </p>
            </>
          )}
        </div>
      )}

      {METHODS.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.id;

        return (
          <label
            key={method.id}
            className={cn(
              'flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all',
              isSelected
                ? 'border-champagne bg-champagne/5 shadow-glow'
                : 'border-border hover:border-champagne/40',
            )}
          >
            <input
              type="radio"
              value={method.id}
              className="sr-only"
              {...register('paymentMethod')}
            />
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                isSelected ? 'bg-champagne/20' : 'bg-muted',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isSelected && 'text-champagne-dark dark:text-champagne',
                )}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{method.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{method.description}</p>
              {method.badges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {method.badges.map((badge) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <span
                        key={badge.label}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] text-ink-muted"
                      >
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div
              className={cn(
                'mt-1 h-4 w-4 shrink-0 rounded-full border-2',
                isSelected ? 'border-champagne bg-champagne' : 'border-border',
              )}
            />
          </label>
        );
      })}

      {errors.paymentMethod && (
        <p className="text-xs text-red-500" role="alert">
          {errors.paymentMethod.message}
        </p>
      )}

      <p className="text-[10px] text-ink-faint">
        Secured by Razorpay · PCI DSS compliant · 256-bit encryption
      </p>
    </div>
  );
}
