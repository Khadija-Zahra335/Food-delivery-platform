import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('must be a valid email address'),
});