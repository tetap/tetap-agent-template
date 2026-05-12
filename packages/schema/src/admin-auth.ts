import { z } from 'zod/v3';

export const adminSessionUserSchema = z.object({
  accountNo: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  roles: z.array(z.string().min(1)).min(1),
  isSuperAdmin: z.boolean().optional(),
  exp: z.number().int().positive(),
});

export const adminSignInInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7),
  rememberMe: z.boolean().default(false),
});

export const adminOtpInputSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

export const adminAuthOutputSchema = z.object({
  user: adminSessionUserSchema,
  accessToken: z.string().min(1),
});

export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;
export type AdminSignInInput = z.input<typeof adminSignInInputSchema>;
export type AdminOtpInput = z.input<typeof adminOtpInputSchema>;
export type AdminAuthOutput = z.infer<typeof adminAuthOutputSchema>;
