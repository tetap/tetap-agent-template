import type { AdminMessageKey } from '@tetap/i18n/admin';

type AdminAuthFieldError = {
  message?: string;
};

export const getAdminAuthFieldErrorKey = (
  error: AdminAuthFieldError | undefined,
  fallbackKey: AdminMessageKey,
): AdminMessageKey | undefined => {
  if (!error) {
    return undefined;
  }

  return fallbackKey;
};
