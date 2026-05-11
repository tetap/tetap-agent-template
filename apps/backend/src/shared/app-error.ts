import type { ErrorCode } from './error-code.js';
import { getErrorDefinition, type ErrorDefinition } from './error-code.js';

export type AppErrorOptions = {
  code: Exclude<ErrorCode, 0>;
  cause?: unknown;
  exposeDetails?: boolean;
  details?: unknown;
};

export class AppError extends Error {
  readonly code: Exclude<ErrorCode, 0>;
  readonly definition: ErrorDefinition;
  readonly exposeDetails: boolean;
  readonly details: unknown;

  constructor({ code, cause, exposeDetails = false, details }: AppErrorOptions) {
    const definition = getErrorDefinition(code);
    super(definition.messageKey, { cause });
    this.name = 'AppError';
    this.code = code;
    this.definition = definition;
    this.exposeDetails = exposeDetails;
    this.details = details;
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
