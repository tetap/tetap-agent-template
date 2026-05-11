import type { FastifyRequest } from 'fastify';
import { AppError } from './app-error.js';
import { ErrorCode } from './error-code.js';

export const requireAuthContext = (request: FastifyRequest) => {
  if (!request.auth) {
    throw new AppError({ code: ErrorCode.Unauthorized });
  }

  return request.auth;
};

export const readUserAgent = (request: FastifyRequest) => {
  const userAgent = request.headers['user-agent'];

  return Array.isArray(userAgent) ? userAgent.join(',') : (userAgent ?? 'unknown');
};
