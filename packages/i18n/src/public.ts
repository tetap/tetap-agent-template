import { createContext, createElement, useCallback, useMemo, useState } from 'react';
import { createI18n, normalizeLocale } from './core.js';
import { defaultLocale, supportedLocales, type Locale } from './locales/index.js';
import { enUS } from './locales/en-US.js';
import { zhCN } from './locales/zh-CN.js';
import type { DotPath, LocaleResourceShape, MissingKeyHandler, TranslateFunction } from './types.js';
import type { ReactNode } from 'react';

export const publicZhCN = {
  app: zhCN.app,
  common: zhCN.common,
  validation: zhCN.validation,
  web: zhCN.web,
} as const;

export const publicEnUS = {
  app: enUS.app,
  common: enUS.common,
  validation: enUS.validation,
  web: enUS.web,
} as const satisfies LocaleResourceShape<typeof publicZhCN>;

export const publicResources = {
  'en-US': publicEnUS,
  'zh-CN': publicZhCN,
} as const;

export type PublicMessages = typeof publicZhCN;
export type PublicMessageKey = DotPath<PublicMessages>;

export type CreatePublicI18nOptions = {
  locale?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

export const createPublicI18n = ({
  locale,
  fallbackLocale = defaultLocale,
  onMissingKey,
}: CreatePublicI18nOptions = {}) =>
  createI18n({
    resources: publicResources,
    locale: normalizeLocale(locale, supportedLocales, fallbackLocale),
    fallbackLocale,
    onMissingKey,
  });

export type PublicI18nReactContextValue = {
  locale: Locale;
  setLocale: (locale: string) => void;
  t: TranslateFunction<PublicMessages>;
};

export type PublicI18nProviderProps = {
  children: ReactNode;
  initialLocale?: string;
  fallbackLocale?: Locale;
};

export const PublicI18nContext = createContext<PublicI18nReactContextValue | undefined>(undefined);

export const PublicI18nProvider = ({
  children,
  initialLocale,
  fallbackLocale = defaultLocale,
}: PublicI18nProviderProps) => {
  const [locale, setResolvedLocale] = useState(() => normalizeLocale(initialLocale, supportedLocales, fallbackLocale));
  const i18n = useMemo(() => createPublicI18n({ locale, fallbackLocale }), [fallbackLocale, locale]);

  const setLocale = useCallback(
    (nextLocale: string) => {
      setResolvedLocale(normalizeLocale(nextLocale, supportedLocales, fallbackLocale));
    },
    [fallbackLocale],
  );

  const value = useMemo<PublicI18nReactContextValue>(
    () => ({ locale, setLocale, t: i18n.t }),
    [i18n.t, locale, setLocale],
  );

  return createElement(PublicI18nContext.Provider, { value }, children);
};
