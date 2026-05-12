import { normalizeBearerToken, type PermissionCode } from '@tetap/iam';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { AppError } from '../shared/app-error.js';
import { ErrorCode } from '../shared/error-code.js';

const isPublicRoute = (request: FastifyRequest) =>
  request.method === 'OPTIONS' ||
  request.routeOptions.config?.auth === false ||
  request.routeOptions.config?.auth?.public === true;

const readUserAgent = (request: FastifyRequest) => {
  const userAgent = request.headers['user-agent'];

  return Array.isArray(userAgent) ? userAgent.join(',') : (userAgent ?? 'unknown');
};

export const registerAuthMiddleware = (app: FastifyInstance) => {
  app.decorateRequest('auth', null);

  app.addHook('preHandler', async request => {
    if (isPublicRoute(request)) {
      return;
    }

    const token = normalizeBearerToken(request.headers.authorization);

    if (!token) {
      throw new AppError({ code: ErrorCode.Unauthorized });
    }

    try {
      request.auth = await request.server.iam.verifyAccessToken(token);
    } catch {
      throw new AppError({ code: ErrorCode.LoginExpired });
    }

    const authConfig = request.routeOptions.config?.auth;
    const permission =
      authConfig && typeof authConfig === 'object' ? (authConfig.permission as PermissionCode | undefined) : undefined;

    if (permission && !request.auth.capabilities.includes(permission) && !request.auth.user.isSuperAdmin) {
      await request.server.iam.recordOperation({
        actorUserId: request.auth.user.id,
        operation: 'PERMISSION_DENIED',
        operationItem: permission,
        resource: permission,
        result: 'FAILURE',
        detail: { permission },
        ip: request.ip,
        userAgent: readUserAgent(request),
      });
      throw new AppError({ code: ErrorCode.Forbidden });
    }
  });
};
