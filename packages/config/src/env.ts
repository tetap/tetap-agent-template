export type EnvSource = Record<string, string | undefined>;

export type AppEnv = {
  NODE_ENV: string;
  HOST: string;
  PORT: number;
  BACKEND_ADMIN_HOST: string;
  BACKEND_ADMIN_PORT: number;
  DATABASE_URL: string;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
  REDIS_KEY_PREFIX?: string;
  CORS_ORIGINS: string[];
  BODY_LIMIT_BYTES: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW: string;
  APP_ID: string;
  APP_SECRET: string;
  AUTH_SECRET: string;
  REFRESH_AUTH_SECRET: string;
  AUTH_SALT: string;
  AUTH_ACCESS_TOKEN_TTL_SECONDS: number;
  AUTH_REFRESH_TOKEN_TTL_SECONDS: number;
  AES_SECRET_KEY: string;
  AES_IV: string;
  ENABLE_DEMO_SEED: boolean;
  SKIP_ROUTES: string[];
};

const readString = (source: EnvSource, key: string, fallback?: string) => {
  const value = source[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const readOptionalString = (source: EnvSource, key: string) => {
  const value = source[key];

  return value && value.length > 0 ? value : undefined;
};

const readNumber = (source: EnvSource, key: string, fallback: number) => {
  const value = source[key];

  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Environment variable ${key} must be a number.`);
  }

  return parsedValue;
};

const readBoolean = (source: EnvSource, key: string, fallback: boolean) => {
  const value = source[key];

  if (!value) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const readList = (source: EnvSource, key: string) =>
  (source[key] ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

export const readAppEnv = (source: EnvSource): AppEnv => ({
  NODE_ENV: source.NODE_ENV ?? 'development',
  HOST: readString(source, 'HOST', '0.0.0.0'),
  PORT: readNumber(source, 'PORT', 3000),
  BACKEND_ADMIN_HOST: readString(source, 'BACKEND_ADMIN_HOST', source.HOST ?? '0.0.0.0'),
  BACKEND_ADMIN_PORT: readNumber(source, 'BACKEND_ADMIN_PORT', 3001),
  DATABASE_URL: readString(source, 'DATABASE_URL'),
  REDIS_HOST: readOptionalString(source, 'REDIS_HOST'),
  REDIS_PORT: readNumber(source, 'REDIS_PORT', 6379),
  REDIS_PASSWORD: readOptionalString(source, 'REDIS_PASSWORD'),
  REDIS_KEY_PREFIX: readOptionalString(source, 'REDIS_KEY_PREFIX'),
  CORS_ORIGINS: readList(source, 'CORS_ORIGINS'),
  BODY_LIMIT_BYTES: readNumber(source, 'BODY_LIMIT_BYTES', 1024 * 1024),
  RATE_LIMIT_MAX: readNumber(source, 'RATE_LIMIT_MAX', 100),
  RATE_LIMIT_WINDOW: source.RATE_LIMIT_WINDOW ?? '1 minute',
  APP_ID: readString(source, 'APP_ID'),
  APP_SECRET: readString(source, 'APP_SECRET'),
  AUTH_SECRET: readString(source, 'AUTH_SECRET'),
  REFRESH_AUTH_SECRET: readString(source, 'REFRESH_AUTH_SECRET'),
  AUTH_SALT: readString(source, 'AUTH_SALT'),
  AUTH_ACCESS_TOKEN_TTL_SECONDS: readNumber(source, 'AUTH_ACCESS_TOKEN_TTL_SECONDS', 15 * 60),
  AUTH_REFRESH_TOKEN_TTL_SECONDS: readNumber(source, 'AUTH_REFRESH_TOKEN_TTL_SECONDS', 7 * 24 * 60 * 60),
  AES_SECRET_KEY: readString(source, 'AES_SECRET_KEY'),
  AES_IV: readString(source, 'AES_IV'),
  ENABLE_DEMO_SEED: readBoolean(source, 'ENABLE_DEMO_SEED', false),
  SKIP_ROUTES: readList(source, 'SKIP_ROUTES'),
});
