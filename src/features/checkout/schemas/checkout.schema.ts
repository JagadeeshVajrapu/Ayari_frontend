import { z } from 'zod';

const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Enter a valid Indian mobile number'),
  street: z.string().min(5, 'Address must be at least 5 characters').max(200),
  city: z.string().min(2, 'City is required').max(80),
  state: z.string().min(1, 'Please select a state'),
  zipCode: z
    .string()
    .regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  country: z.literal('IN'),
});

export const checkoutSchema = z.object({
  shipping: shippingAddressSchema,
  paymentMethod: z.enum(['razorpay', 'cod']),
  orderNotes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  saveAddress: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
