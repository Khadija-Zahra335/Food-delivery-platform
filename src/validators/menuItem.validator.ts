import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  price: z.number().positive('price must be a positive number'),
  isAvailable: z.boolean().optional(),
  restaurantId: z.number().int('restaurantId must be an integer'),
  categoryId: z.number().int('categoryId must be an integer'),
});