import { describe, expect, it } from 'vitest';
import { readAppEnv, type EnvSource } from '@tetap/config';

const requiredEnv = {
  DATABASE_URL: 'mysql://root:password@127.0.0.1:3306/tetap',
  APP_ID: 'tetap-test-app',
  APP_SECRET: 'tetap-test-secret',
  AUTH_SECRET: 'tetap-auth-secret',
  REFRESH_AUTH_SECRET: 'tetap-refresh-auth-secret',
  AUTH_SALT: 'tetap-auth-salt',
  AES_SECRET_KEY: '12345678901234567890123456789012',
  AES_IV: '1234567890123456',
} satisfies EnvSource;

describe('readAppEnv', () => {
  it('applies defaults for optional runtime values', () => {
    expect(readAppEnv(requiredEnv)).toMatchObject({
      NODE_ENV: 'development',
      HOST: '0.0.0.0',
      PORT: 3000,
      BACKEND_ADMIN_HOST: '0.0.0.0',
      BACKEND_ADMIN_PORT: 3001,
      BODY_LIMIT_BYTES: 1048576,
      CORS_ORIGINS: [],
      REDIS_PORT: 6379,
      RATE_LIMIT_MAX: 100,
      RATE_LIMIT_WINDOW: '1 minute',
      AUTH_ACCESS_TOKEN_TTL_SECONDS: 900,
      AUTH_REFRESH_TOKEN_TTL_SECONDS: 604800,
      ENABLE_DEMO_SEED: false,
      SKIP_ROUTES: [],
    });
  });

  it('parses numbers, booleans, and comma-separated route lists', () => {
    expect(
      readAppEnv({
        ...requiredEnv,
        PORT: '4000',
        BACKEND_ADMIN_HOST: '127.0.0.1',
        BACKEND_ADMIN_PORT: '4001',
        CORS_ORIGINS: 'http://localhost:5173, http://localhost:5174 ,,',
        ENABLE_DEMO_SEED: 'true',
        SKIP_ROUTES: '/health, /metrics ,,',
      }),
    ).toMatchObject({
      PORT: 4000,
      BACKEND_ADMIN_HOST: '127.0.0.1',
      BACKEND_ADMIN_PORT: 4001,
      CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:5174'],
      ENABLE_DEMO_SEED: true,
      SKIP_ROUTES: ['/health', '/metrics'],
    });
  });

  it('fails fast when a required secret is missing', () => {
    const missingSecretEnv = Object.fromEntries(
      Object.entries(requiredEnv).filter(([key]) => key !== 'APP_SECRET'),
    ) as EnvSource;

    expect(() => readAppEnv(missingSecretEnv)).toThrow('Missing required environment variable: APP_SECRET');
  });
});
