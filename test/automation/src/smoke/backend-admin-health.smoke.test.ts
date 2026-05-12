import { healthResponseSchema } from '@tetap/schema/backend';
import type { AppEnv } from '@tetap/config';
import { describe, expect, it } from 'vitest';
import { buildBackendAdminApp } from '../../../../apps/backend-admin/src/app.js';
import { ErrorCode } from '../../../../apps/backend-admin/src/shared/error-code.js';
import { createManagedIamTestFixtureService } from '../fixtures/iam.js';

const smokeEnv = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 0,
  BACKEND_ADMIN_HOST: '127.0.0.1',
  BACKEND_ADMIN_PORT: 0,
  DATABASE_URL: 'mysql://root:password@127.0.0.1:3306/tetap',
  CORS_ORIGINS: ['http://127.0.0.1:5174'],
  BODY_LIMIT_BYTES: 1024 * 1024,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: '1 minute',
  APP_ID: 'tetap-admin-smoke-app',
  APP_SECRET: 'tetap-admin-smoke-secret',
  AUTH_SECRET: 'tetap-auth-secret',
  REFRESH_AUTH_SECRET: 'tetap-refresh-auth-secret',
  AUTH_SALT: 'tetap-auth-salt',
  AUTH_ACCESS_TOKEN_TTL_SECONDS: 900,
  AUTH_REFRESH_TOKEN_TTL_SECONDS: 604800,
  AES_SECRET_KEY: '12345678901234567890123456789012',
  AES_IV: '1234567890123456',
  SKIP_ROUTES: [],
} satisfies AppEnv;

describe('backend-admin smoke: GET /health', () => {
  it('boots the admin Fastify app and returns the unified health response', async () => {
    const app = await buildBackendAdminApp({
      env: smokeEnv,
      iamService: createManagedIamTestFixtureService('tetap-auth-salt'),
    });

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
      expect(body.message).toBe('Admin service is healthy.');
      expect(body.data).toMatchObject({
        service: 'backend-admin',
        status: 'ok',
      });
      expect(new Date(body.data.timestamp).toString()).not.toBe('Invalid Date');
    } finally {
      await app.close();
    }
  });
});
