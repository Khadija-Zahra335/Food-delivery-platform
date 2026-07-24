import { z } from 'zod';

export const createRiderSchema = z.object({
  name: z.string().min(1, 'name is required'),
  phoneNo: z.string().min(1, 'phoneNo is required'),
  isAvailable: z.boolean().optional(),
});