import type { BackendMessageKey } from '@tetap/i18n/backend';

export const ErrorCode = {
  Success: 0,
  BadRequest: 40000,
  ValidationFailed: 40001,
  SecurityMissingHeaders: 40010,
  SecurityInvalidTimestamp: 40011,
  SecurityRequestExpired: 40810,
  SecurityNonceReused: 40910,
  SecurityInvalidAppId: 40110,
  SecurityInvalidSignature: 40111,
  Unauthorized: 40100,
  LoginExpired: 40101,
  Forbidden: 40300,
  PolicyDenied: 40301,
  NotFound: 40400,
  InternalServerError: 50000,
  SecurityServiceUnavailable: 50010,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ErrorDefinition = {
  code: ErrorCode;
  httpStatus: number;
  messageKey: BackendMessageKey;
};

export const errorDefinitions = {
  [ErrorCode.BadRequest]: {
    code: ErrorCode.BadRequest,
    httpStatus: 400,
    messageKey: 'error.badRequest',
  },
  [ErrorCode.ValidationFailed]: {
    code: ErrorCode.ValidationFailed,
    httpStatus: 400,
    messageKey: 'error.validationFailed',
  },
  [ErrorCode.SecurityMissingHeaders]: {
    code: ErrorCode.SecurityMissingHeaders,
    httpStatus: 400,
    messageKey: 'error.securityMissingHeaders',
  },
  [ErrorCode.SecurityInvalidTimestamp]: {
    code: ErrorCode.SecurityInvalidTimestamp,
    httpStatus: 400,
    messageKey: 'error.securityInvalidTimestamp',
  },
  [ErrorCode.SecurityRequestExpired]: {
    code: ErrorCode.SecurityRequestExpired,
    httpStatus: 408,
    messageKey: 'error.securityRequestExpired',
  },
  [ErrorCode.SecurityNonceReused]: {
    code: ErrorCode.SecurityNonceReused,
    httpStatus: 409,
    messageKey: 'error.securityNonceReused',
  },
  [ErrorCode.SecurityInvalidAppId]: {
    code: ErrorCode.SecurityInvalidAppId,
    httpStatus: 401,
    messageKey: 'error.securityInvalidAppId',
  },
  [ErrorCode.SecurityInvalidSignature]: {
    code: ErrorCode.SecurityInvalidSignature,
    httpStatus: 401,
    messageKey: 'error.securityInvalidSignature',
  },
  [ErrorCode.Unauthorized]: {
    code: ErrorCode.Unauthorized,
    httpStatus: 401,
    messageKey: 'error.unauthorized',
  },
  [ErrorCode.LoginExpired]: {
    code: ErrorCode.LoginExpired,
    httpStatus: 401,
    messageKey: 'error.loginExpired',
  },
  [ErrorCode.Forbidden]: {
    code: ErrorCode.Forbidden,
    httpStatus: 403,
    messageKey: 'error.forbidden',
  },
  [ErrorCode.PolicyDenied]: {
    code: ErrorCode.PolicyDenied,
    httpStatus: 403,
    messageKey: 'error.policyDenied',
  },
  [ErrorCode.NotFound]: {
    code: ErrorCode.NotFound,
    httpStatus: 404,
    messageKey: 'error.notFound',
  },
  [ErrorCode.InternalServerError]: {
    code: ErrorCode.InternalServerError,
    httpStatus: 500,
    messageKey: 'error.internalServerError',
  },
  [ErrorCode.SecurityServiceUnavailable]: {
    code: ErrorCode.SecurityServiceUnavailable,
    httpStatus: 500,
    messageKey: 'error.securityServiceUnavailable',
  },
} as const satisfies Record<Exclude<ErrorCode, 0>, ErrorDefinition>;

export const getErrorDefinition = (code: Exclude<ErrorCode, 0>): ErrorDefinition => errorDefinitions[code];
