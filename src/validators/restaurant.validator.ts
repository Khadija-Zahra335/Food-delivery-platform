import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  cuisineType: z.string().min(1, 'cuisineType is required'),
  isOpen: z.boolean().optional(),
  address: z.string().min(1, 'address is required'),
});