import { z } from 'zod/v3';
import { createApiResponseSchema, isoDatetimeSchema } from './common.js';

export const healthDataSchema = z.object({
  status: z.literal('ok'),
  service: z.string().min(1),
  timestamp: isoDatetimeSchema,
});

export const healthResponseSchema = createApiResponseSchema(healthDataSchema);

export type HealthData = z.output<typeof healthDataSchema>;

export type HealthResponse = z.output<typeof healthResponseSchema>;
