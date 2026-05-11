import type { FastifyInstance, FastifyRequest } from 'fastify';
import { AppError } from '../shared/app-error.js';
import { ErrorCode } from '../shared/error-code.js';
import { getBodyHash, getCanonicalPathname, hmacSha256, timingSafeStringEqual } from '../shared/security.js';
import type { AppEnv } from '@tetap/config';

const timestampToleranceSeconds = 300;
const nonceTtlMs = 24 * 60 * 60 * 1000;
const nonceStore = new Map<string, number>();

const readHeader = (request: FastifyRequest, name: string) => {
  const value = request.headers[name.toLowerCase()];

  return typeof value === 'string' ? value : value?.[0];
};

const shouldSkipSecurity = (request: FastifyRequest) => request.routeOptions.config?.skipSecurity === true;

const pruneExpiredNonces = (now = Date.now()) => {
  for (const [nonce, expiresAt] of nonceStore.entries()) {
    if (expiresAt <= now) {
      nonceStore.delete(nonce);
    }
  }
};

const assertNonceIsFresh = (nonce: string) => {
  const now = Date.now();
  pruneExpiredNonces(now);

  const expiresAt = nonceStore.get(nonce);

  if (expiresAt && expiresAt > now) {
    throw new AppError({ code: ErrorCode.SecurityNonceReused });
  }

  nonceStore.set(nonce, now + nonceTtlMs);
};

export const registerSecurityMiddleware = (app: FastifyInstance, env: AppEnv) => {
  app.addHook('preHandler', async request => {
    if (request.method === 'OPTIONS' || shouldSkipSecurity(request)) {
      return;
    }

    const appId = readHeader(request, 'x-app-id');
    const timestamp = readHeader(request, 'x-timestamp');
    const nonce = readHeader(request, 'x-nonce');
    const signature = readHeader(request, 'x-signature');

    if (!appId || !timestamp || !nonce || !signature) {
      throw new AppError({ code: ErrorCode.SecurityMissingHeaders });
    }

    if (appId !== env.APP_ID) {
      throw new AppError({ code: ErrorCode.SecurityInvalidAppId });
    }

    if (!/^\d+$/.test(timestamp)) {
      throw new AppError({ code: ErrorCode.SecurityInvalidTimestamp });
    }

    const requestTimestamp = Number.parseInt(timestamp, 10);

    if (!Number.isFinite(requestTimestamp)) {
      throw new AppError({ code: ErrorCode.SecurityInvalidTimestamp });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (Math.abs(currentTimestamp - requestTimestamp) > timestampToleranceSeconds) {
      throw new AppError({ code: ErrorCode.SecurityRequestExpired });
    }

    const canonical = [
      request.method.toUpperCase(),
      getCanonicalPathname(request.url),
      timestamp,
      nonce,
      getBodyHash(request.body),
    ].join('\n');
    const expectedSignature = hmacSha256(env.APP_SECRET, canonical);

    if (!timingSafeStringEqual(signature, expectedSignature)) {
      throw new AppError({ code: ErrorCode.SecurityInvalidSignature });
    }

    assertNonceIsFresh(nonce);
  });
};
