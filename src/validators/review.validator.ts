import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.number().int('orderId must be an integer'),
  targetType: z.enum(['RESTAURANT', 'RIDER']),
  rating: z
    .number()
    .int('rating must be a whole number')
    .min(1, 'rating must be between 1 and 5')
    .max(5, 'rating must be between 1 and 5'),
  comment: z.string().optional(),
});