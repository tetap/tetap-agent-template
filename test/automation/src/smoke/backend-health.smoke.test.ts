import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from '@tetap/schema/backend';
import { buildBackendApp } from '../../../../apps/backend/src/app.js';
import { ErrorCode } from '../../../../apps/backend/src/shared/error-code.js';
import type { AppEnv } from '@tetap/config';

const smokeEnv = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 0,
  BACKEND_ADMIN_HOST: '127.0.0.1',
  BACKEND_ADMIN_PORT: 0,
  DATABASE_URL: 'mysql://root:password@127.0.0.1:3306/tetap',
  CORS_ORIGINS: ['http://127.0.0.1:5173'],
  BODY_LIMIT_BYTES: 1024 * 1024,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: '1 minute',
  APP_ID: 'tetap-smoke-app',
  APP_SECRET: 'tetap-smoke-secret',
  AUTH_SECRET: 'tetap-auth-secret',
  REFRESH_AUTH_SECRET: 'tetap-refresh-auth-secret',
  AUTH_SALT: 'tetap-auth-salt',
  AUTH_ACCESS_TOKEN_TTL_SECONDS: 900,
  AUTH_REFRESH_TOKEN_TTL_SECONDS: 604800,
  AES_SECRET_KEY: '12345678901234567890123456789012',
  AES_IV: '1234567890123456',
  ENABLE_DEMO_SEED: false,
  SKIP_ROUTES: [],
} satisfies AppEnv;

describe('backend smoke: GET /health', () => {
  it('boots the Fastify app and returns the unified health response', async () => {
    const app = await buildBackendApp({ env: smokeEnv });

    try {
      const response = await app.inject({
        headers: {
          'accept-language': 'en-US',
        },
        method: 'GET',
        url: '/health',
      });
      const body = healthResponseSchema.parse(response.json());

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-language']).toBe('en-US');
      expect(body.code).toBe(ErrorCode.Success);
      expect(body.message).toBe('Service is healthy.');
      expect(body.data).toMatchObject({
        service: 'backend',
        status: 'ok',
      });
      expect(new Date(body.data.timestamp).toString()).not.toBe('Invalid Date');
    } finally {
      await app.close();
    }
  });
});
