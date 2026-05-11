import { useContext } from 'react';
import { PublicI18nContext, type PublicI18nReactContextValue } from '@tetap/i18n/public';

export const usePublicI18n = (): PublicI18nReactContextValue => {
  const context = useContext(PublicI18nContext);

  if (!context) {
    throw new Error('usePublicI18n must be used within PublicI18nProvider.');
  }

  return context;
};

export const usePublicT = (): PublicI18nReactContextValue['t'] => usePublicI18n().t;
