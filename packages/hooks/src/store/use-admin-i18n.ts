import { use } from 'react';
import { AdminI18nContext, type AdminI18nReactContextValue } from '@tetap/i18n/admin';

export const useAdminI18n = (): AdminI18nReactContextValue => {
  const context = use(AdminI18nContext);

  if (!context) {
    throw new Error('useAdminI18n must be used within AdminI18nProvider.');
  }

  return context;
};

export const useAdminT = (): AdminI18nReactContextValue['t'] => useAdminI18n().t;
