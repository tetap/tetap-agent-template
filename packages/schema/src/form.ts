import type { z } from 'zod/v3';

export type AnySchema = z.ZodTypeAny;

export type SchemaInput<TSchema extends z.ZodTypeAny> = z.input<TSchema>;

export type SchemaOutput<TSchema extends z.ZodTypeAny> = z.output<TSchema>;

export const parseFormValues = <TSchema extends z.ZodTypeAny>(schema: TSchema, values: unknown): z.output<TSchema> =>
  schema.parse(values);

export const safeParseFormValues = <TSchema extends z.ZodTypeAny>(schema: TSchema, values: unknown) =>
  schema.safeParse(values);
