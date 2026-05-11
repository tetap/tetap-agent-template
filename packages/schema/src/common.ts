import { z } from 'zod/v3';

export const idSchema = z.coerce.bigint().positive();

export const isoDatetimeSchema = z.string().datetime();

export const emptyObjectSchema = z.object({}).strict();

export const paginationInputSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const apiCodeSchema = z.number().int();

export const apiMessageSchema = z.string().min(1);

export const createApiResponseSchema = <TData extends z.ZodTypeAny>(data: TData) =>
  z.object({
    code: apiCodeSchema,
    message: apiMessageSchema,
    data,
  });

export const apiErrorSchema = createApiResponseSchema(z.unknown().nullable());

export const createApiSuccessSchema = <TData extends z.ZodTypeAny>(data: TData) => createApiResponseSchema(data);

export const createApiFailureSchema = () => createApiResponseSchema(z.unknown().nullable());
