import { createBackendI18n } from '@tetap/i18n/backend';
import { createApiResponseSchema, z } from '@tetap/schema';
import { defaultLocale } from '@tetap/i18n/locales';
import type { FastifyError, FastifyInstance, FastifyRequest } from 'fastify';
import { AppError, isAppError } from '../shared/app-error.js';
import { ErrorCode, getErrorDefinition, type ErrorDefinition } from '../shared/error-code.js';

type ZodLikeError = {
  issues: unknown[];
};

const isZodLikeError = (error: unknown): error is ZodLikeError =>
  Boolean(error && typeof error === 'object' && Array.isArray((error as ZodLikeError).issues));

const resolveDefinition = (error: unknown): ErrorDefinition => {
  if (isAppError(error)) {
    return error.definition;
  }

  if (isZodLikeError(error)) {
    return getErrorDefinition(ErrorCode.ValidationFailed);
  }

  const fastifyError = error as FastifyError;

  if (fastifyError.statusCode === 400) {
    return getErrorDefinition(ErrorCode.BadRequest);
  }

  if (fastifyError.statusCode === 401) {
    return getErrorDefinition(ErrorCode.Unauthorized);
  }

  if (fastifyError.statusCode === 403) {
    return getErrorDefinition(ErrorCode.Forbidden);
  }

  if (fastifyError.statusCode === 404) {
    return getErrorDefinition(ErrorCode.NotFound);
  }

  return getErrorDefinition(ErrorCode.InternalServerError);
};

const resolveErrorData = (error: unknown) => {
  if (isAppError(error) && error.exposeDetails) {
    return error.details ?? null;
  }

  if (isZodLikeError(error)) {
    return { issues: error.issues };
  }

  return null;
};

const errorResponseSchema = createApiResponseSchema(z.unknown().nullable());

const sendError = (request: FastifyRequest, definition: ErrorDefinition, error: unknown) => {
  const locale = request.locale ?? defaultLocale;
  const t = createBackendI18n({ locale }).t;

  request.log.error({ error, code: definition.code });

  return errorResponseSchema.parse({
    code: definition.code,
    message: t(definition.messageKey),
    data: resolveErrorData(error),
  });
};

export const registerErrorHandler = (app: FastifyInstance) => {
  app.setNotFoundHandler((request, reply) => {
    const error = new AppError({ code: ErrorCode.NotFound });
    const definition = error.definition;

    return reply
      .status(definition.httpStatus)
      .header('content-language', request.locale ?? defaultLocale)
      .send(sendError(request, definition, error));
  });

  app.setErrorHandler((error, request, reply) => {
    const definition = resolveDefinition(error);

    return reply
      .status(definition.httpStatus)
      .header('content-language', request.locale ?? defaultLocale)
      .send(sendError(request, definition, error));
  });
};
