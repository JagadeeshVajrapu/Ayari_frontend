'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormField } from '@/features/auth/components/form-field';
import { Input } from '@/components/ui/input';
import { INDIAN_STATES } from '@/features/checkout/lib/indian-states';
import type { CheckoutFormData } from '@/features/checkout/schemas/checkout.schema';
import { cn } from '@/lib/utils';

interface ShippingAddressFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

const selectClassName =
  'flex h-12 w-full rounded-2xl border border-border/80 bg-surface-elevated px-5 py-2 text-sm text-foreground shadow-soft transition-all duration-300 focus-visible:border-champagne/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/20 dark:border-border dark:bg-surface';

export function ShippingAddressForm({ register, errors }: ShippingAddressFormProps) {
  const shippingErrors = errors.shipping;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First Name" error={shippingErrors?.firstName?.message}>
          <Input placeholder="Jane" {...register('shipping.firstName')} />
        </FormField>
        <FormField label="Last Name" error={shippingErrors?.lastName?.message}>
          <Input placeholder="Doe" {...register('shipping.lastName')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" error={shippingErrors?.email?.message}>
          <Input type="email" placeholder="you@example.com" {...register('shipping.email')} />
        </FormField>
        <FormField label="Phone" error={shippingErrors?.phone?.message}>
          <Input type="tel" placeholder="+91 98765 43210" {...register('shipping.phone')} />
        </FormField>
      </div>

      <FormField label="Street Address" error={shippingErrors?.street?.message}>
        <Input placeholder="House no., street, locality" {...register('shipping.street')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="City" error={shippingErrors?.city?.message}>
          <Input placeholder="Mumbai" {...register('shipping.city')} />
        </FormField>
        <FormField label="State" error={shippingErrors?.state?.message}>
          <select
            {...register('shipping.state')}
            className={cn(selectClassName, !shippingErrors?.state && 'text-foreground')}
            defaultValue=""
          >
            <option value="" disabled>
              Select state
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="PIN Code" error={shippingErrors?.zipCode?.message}>
          <Input placeholder="400001" maxLength={6} {...register('shipping.zipCode')} />
        </FormField>
        <FormField label="Country">
          <Input readOnly defaultValue="India" className="bg-muted/50" />
        </FormField>
      </div>
    </div>
  );
}
