import { createBackendAdminI18n } from '@tetap/i18n/backend-admin';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCode } from './error-code.js';
import type { BackendAdminMessageKey } from '@tetap/i18n/backend-admin';

export type ApiResponse<TData> = {
  code: number;
  message: string;
  data: TData;
};

type ApiResponseSchema<TData> = {
  parse(input: unknown): ApiResponse<TData>;
};

const getTranslator = (request: FastifyRequest) => createBackendAdminI18n({ locale: request.locale }).t;

export const createSuccessResponse = <TData>(
  request: FastifyRequest,
  responseSchema: ApiResponseSchema<TData>,
  data: TData,
  messageKey: BackendAdminMessageKey = 'common.success',
) => {
  const t = getTranslator(request);

  return responseSchema.parse({
    code: ErrorCode.Success,
    message: t(messageKey),
    data,
  });
};

export const sendSuccess = <TData>(
  reply: FastifyReply,
  request: FastifyRequest,
  responseSchema: ApiResponseSchema<TData>,
  data: TData,
  messageKey: BackendAdminMessageKey = 'common.success',
) =>
  reply
    .header('content-language', request.locale)
    .send(createSuccessResponse(request, responseSchema, data, messageKey));
