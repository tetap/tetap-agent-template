import type { FastifyInstance, FastifyRequest } from 'fastify';
import { readUserAgent } from '../shared/auth-context.js';

const healthPathPattern = /^\/health(?:\/|$)?/;

const resolveOperationItem = (request: FastifyRequest) => {
  const routePath = request.routeOptions.url ?? request.url;

  return `${request.method} ${routePath}`;
};

export const registerOperationLogMiddleware = (app: FastifyInstance) => {
  app.addHook('onResponse', async (request, reply) => {
    if (request.method === 'OPTIONS' || healthPathPattern.test(request.url)) {
      return;
    }

    await request.server.iam.recordOperation({
      actorUserId: request.auth?.user.id,
      operation: 'BACKEND_OPERATION',
      operationItem: resolveOperationItem(request),
      resource: request.routeOptions.url ?? request.url,
      ip: request.ip,
      userAgent: readUserAgent(request),
      result: reply.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
      detail: {
        method: request.method,
        statusCode: reply.statusCode,
        url: request.url,
      },
    });
  });
};
