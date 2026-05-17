import { createContext, createElement, useCallback, useMemo, useState } from 'react';
import { createI18n, normalizeLocale } from './core.js';
import { defaultLocale, supportedLocales, type Locale } from './locales/registry.js';
import { enUS } from './locales/en-US.js';
import { zhCN } from './locales/zh-CN.js';
import type { DotPath, LocaleResourceShape, MissingKeyHandler, TranslateFunction } from './types.js';
import type { ReactNode } from 'react';

export const adminZhCN = {
  common: zhCN.common,
  validation: zhCN.validation,
  webAdmin: zhCN.webAdmin,
} as const;

export const adminEnUS = {
  common: enUS.common,
  validation: enUS.validation,
  webAdmin: enUS.webAdmin,
} as const satisfies LocaleResourceShape<typeof adminZhCN>;

export const adminResources = {
  'en-US': adminEnUS,
  'zh-CN': adminZhCN,
} as const;

export type AdminMessages = typeof adminZhCN;
export type AdminMessageKey = DotPath<AdminMessages>;

export type CreateAdminI18nOptions = {
  locale?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

export const createAdminI18n = ({
  locale,
  fallbackLocale = defaultLocale,
  onMissingKey,
}: CreateAdminI18nOptions = {}) =>
  createI18n({
    resources: adminResources,
    locale: normalizeLocale(locale, supportedLocales, fallbackLocale),
    fallbackLocale,
    onMissingKey,
  });

export type AdminI18nReactContextValue = {
  locale: Locale;
  setLocale: (locale: string) => void;
  t: TranslateFunction<AdminMessages>;
};

export type AdminI18nProviderProps = {
  children: ReactNode;
  initialLocale?: string;
  fallbackLocale?: Locale;
};

export const AdminI18nContext = createContext<AdminI18nReactContextValue | undefined>(undefined);

export const AdminI18nProvider = ({
  children,
  initialLocale,
  fallbackLocale = defaultLocale,
}: AdminI18nProviderProps) => {
  const [locale, setResolvedLocale] = useState(() => normalizeLocale(initialLocale, supportedLocales, fallbackLocale));
  const i18n = useMemo(() => createAdminI18n({ locale, fallbackLocale }), [fallbackLocale, locale]);

  const setLocale = useCallback(
    (nextLocale: string) => {
      setResolvedLocale(normalizeLocale(nextLocale, supportedLocales, fallbackLocale));
    },
    [fallbackLocale],
  );

  const value = useMemo<AdminI18nReactContextValue>(
    () => ({ locale, setLocale, t: i18n.t }),
    [i18n.t, locale, setLocale],
  );

  return createElement(AdminI18nContext.Provider, { value }, children);
};
