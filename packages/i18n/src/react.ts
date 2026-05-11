import { createContext, createElement, useCallback, useMemo, useState } from 'react';
import { createAppI18n } from './index.js';
import { defaultLocale, supportedLocales, type AppMessages, type Locale } from './locales/index.js';
import { normalizeLocale } from './core.js';
import type { ReactNode } from 'react';
import type { TranslateFunction } from './types.js';

export type I18nReactContextValue = {
  locale: Locale;
  setLocale: (locale: string) => void;
  t: TranslateFunction<AppMessages>;
};

export type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: string;
  fallbackLocale?: Locale;
};

export const I18nContext = createContext<I18nReactContextValue | undefined>(undefined);

export const I18nProvider = ({ children, initialLocale, fallbackLocale = defaultLocale }: I18nProviderProps) => {
  const [locale, setResolvedLocale] = useState(() => normalizeLocale(initialLocale, supportedLocales, fallbackLocale));
  const i18n = useMemo(() => createAppI18n({ locale, fallbackLocale }), [fallbackLocale, locale]);

  const setLocale = useCallback(
    (nextLocale: string) => {
      setResolvedLocale(normalizeLocale(nextLocale, supportedLocales, fallbackLocale));
    },
    [fallbackLocale],
  );

  const value = useMemo<I18nReactContextValue>(() => ({ locale, setLocale, t: i18n.t }), [i18n.t, locale, setLocale]);

  return createElement(I18nContext.Provider, { value }, children);
};
