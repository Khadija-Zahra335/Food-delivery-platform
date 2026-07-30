import { z } from 'zod';

const orderItemSchema = z.object({
  menuItemId: z.number().int(),
  quantity: z.number().int().positive('quantity must be a positive whole number'),
  priceAtOrder: z.number().positive(),
});

export const createOrderSchema = z.object({
  restaurantId: z.number().int(),
  deliveryStreet: z.string().min(1, 'a delivery address is required'),
  deliveryCity: z.string().min(1, 'a delivery city is required'),
  items: z.array(orderItemSchema).min(1, 'an order must contain at least one item'),
});