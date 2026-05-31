import {
  createApiResponseSchema,
  emptyObjectSchema,
  iamBootstrapDataSchema,
  iamCurrentUserResponseSchema,
  iamLoginRequestSchema,
  iamLoginResponseSchema,
  iamRefreshRequestSchema,
  iamRefreshResponseSchema,
} from '@tetap/schema';
import type { IamLoginRequest } from '@tetap/schema';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../shared/app-error.js';
import { sendSuccess } from '../shared/api-response.js';
import { requireAuthContext, readUserAgent } from '../shared/auth-context.js';
import { ErrorCode } from '../shared/error-code.js';

const emptyResponseSchema = createApiResponseSchema(emptyObjectSchema);
const invalidCredentialsErrorMessage = 'Invalid credentials.';

const isInvalidCredentialsError = (error: unknown) =>
  error instanceof Error && error.message === invalidCredentialsErrorMessage;

const resolveLoginFailureCode = (request: FastifyRequest, input: IamLoginRequest) => {
  const user = request.server.iam.findUserByUsername(input.username);

  if (!user || !request.server.iam.verifyPassword(user, input.password)) {
    return ErrorCode.InvalidCredentials;
  }

  if (user.status === 'DISABLED') {
    return ErrorCode.AdminAccountDisabled;
  }

  if (user.status === 'LOCKED') {
    return ErrorCode.AdminAccountLocked;
  }

  return ErrorCode.InvalidCredentials;
};

const loginWithMappedFailure = async (request: FastifyRequest, input: IamLoginRequest) => {
  try {
    return await request.server.iam.login({
      ...input,
      ip: request.ip,
      userAgent: readUserAgent(request),
    });
  } catch (error) {
    if (isInvalidCredentialsError(error)) {
      throw new AppError({ code: resolveLoginFailureCode(request, input), cause: error });
    }

    throw error;
  }
};

const buildBootstrapData = (request: FastifyRequest) => {
  const auth = requireAuthContext(request);
  const user = request.server.iam.getUserById(auth.user.id);

  if (!user) {
    throw new AppError({ code: ErrorCode.LoginExpired });
  }

  return iamBootstrapDataSchema.parse({
    user: auth.user,
    roles: auth.roles,
    capabilities: auth.capabilities,
    menus: request.server.iam.getMenuTree(user),
    dataConstraint: request.server.iam.getDataConstraint(user, 'user'),
    fieldPermissions: request.server.iam.getFieldRulesForUser(user, 'user'),
  });
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const input = iamLoginRequestSchema.parse(request.body);
  const result = await loginWithMappedFailure(request, input);

  return sendSuccess(reply, request, iamLoginResponseSchema, result, 'backendAdmin.auth.loginOk');
};

export const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const input = iamRefreshRequestSchema.parse(request.body);
  const result = await request.server.iam.refresh(input.refreshToken);

  return sendSuccess(reply, request, iamRefreshResponseSchema, result, 'backendAdmin.auth.refreshOk');
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    throw new AppError({ code: ErrorCode.Unauthorized });
  }

  await request.server.iam.logout(token);

  return sendSuccess(reply, request, emptyResponseSchema, {}, 'backendAdmin.auth.logoutOk');
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(reply, request, iamCurrentUserResponseSchema, buildBootstrapData(request), 'backendAdmin.auth.meOk');
