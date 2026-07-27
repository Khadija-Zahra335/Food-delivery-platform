import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('must be a valid email address'),
  password: z.string().min(6, 'password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER', 'RIDER', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('must be a valid email address'),
  password: z.string().min(1, 'password is required'),
});
