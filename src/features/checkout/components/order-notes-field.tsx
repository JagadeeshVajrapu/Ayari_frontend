'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormField } from '@/features/auth/components/form-field';
import { Textarea } from '@/components/ui/textarea';
import type { CheckoutFormData } from '@/features/checkout/schemas/checkout.schema';

interface OrderNotesFieldProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export function OrderNotesField({ register, errors }: OrderNotesFieldProps) {
  return (
    <FormField label="Order Notes (optional)" error={errors.orderNotes?.message}>
      <Textarea
        placeholder="Delivery instructions, gift message, or special requests..."
        rows={4}
        maxLength={500}
        {...register('orderNotes')}
      />
      <p className="text-[10px] text-ink-faint">Max 500 characters</p>
    </FormField>
  );
}
