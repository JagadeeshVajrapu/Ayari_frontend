import { z } from 'zod';

const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), 'Enter a valid Indian mobile number'),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(30),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  phone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
