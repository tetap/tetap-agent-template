import { z } from 'zod/v3';
import { idSchema, isoDatetimeSchema } from './common.js';

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().trim().min(1).max(80).nullable(),
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema,
});

export const createUserInputSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(80).optional(),
});

export const updateUserInputSchema = createUserInputSchema.partial().extend({
  id: idSchema,
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
