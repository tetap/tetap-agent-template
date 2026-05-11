import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from '@tetap/schema/backend';
import { adminOtpInputSchema, adminSignInInputSchema } from '@tetap/schema/admin-auth';

describe('healthResponseSchema', () => {
  it('accepts the unified backend response body shape', () => {
    expect(
      healthResponseSchema.parse({
        code: 0,
        message: 'ok',
        data: {
          status: 'ok',
          service: 'backend',
          timestamp: new Date().toISOString(),
        },
      }),
    ).toMatchObject({
      code: 0,
      message: 'ok',
      data: {
        status: 'ok',
        service: 'backend',
      },
    });
  });

  it('rejects invalid smoke response timestamps', () => {
    expect(() =>
      healthResponseSchema.parse({
        code: 0,
        message: 'ok',
        data: {
          status: 'ok',
          service: 'backend',
          timestamp: 'not-a-date',
        },
      }),
    ).toThrow();
  });
});

describe('admin auth schemas', () => {
  it('accepts valid admin sign-in and otp form values', () => {
    expect(
      adminSignInInputSchema.parse({
        email: 'admin@example.com',
        password: 'password1',
        rememberMe: true,
      }),
    ).toMatchObject({
      email: 'admin@example.com',
      rememberMe: true,
    });

    expect(adminOtpInputSchema.parse({ otp: '123456' })).toEqual({ otp: '123456' });
  });

  it('rejects invalid admin sign-in and otp form values', () => {
    expect(() =>
      adminSignInInputSchema.parse({
        email: 'not-an-email',
        password: 'short',
      }),
    ).toThrow();

    expect(() => adminOtpInputSchema.parse({ otp: 'abcdef' })).toThrow();
  });
});
