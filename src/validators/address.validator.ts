import { z } from 'zod';

export const createAddressSchema = z.object({
  street: z.string().min(1, 'street is required'),
  city: z.string().min(1, 'city is required'),
});

export const updateAddressSchema = z.object({
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
});