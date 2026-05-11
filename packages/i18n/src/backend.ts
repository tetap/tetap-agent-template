import { createI18n, normalizeLocale } from './core.js';
import { defaultLocale, supportedLocales, type Locale } from './locales/index.js';
import { enUS } from './locales/en-US.js';
import { zhCN } from './locales/zh-CN.js';
import type { DotPath, LocaleResourceShape, MissingKeyHandler } from './types.js';

export const backendZhCN = {
  backend: zhCN.backend,
  common: zhCN.common,
  error: zhCN.error,
  validation: zhCN.validation,
} as const;

export const backendEnUS = {
  backend: enUS.backend,
  common: enUS.common,
  error: enUS.error,
  validation: enUS.validation,
} as const satisfies LocaleResourceShape<typeof backendZhCN>;

export const backendResources = {
  'en-US': backendEnUS,
  'zh-CN': backendZhCN,
} as const;

export type BackendMessages = typeof backendZhCN;
export type BackendMessageKey = DotPath<BackendMessages>;

export type CreateBackendI18nOptions = {
  locale?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

export const createBackendI18n = ({
  locale,
  fallbackLocale = defaultLocale,
  onMissingKey,
}: CreateBackendI18nOptions = {}) =>
  createI18n({
    resources: backendResources,
    locale: normalizeLocale(locale, supportedLocales, fallbackLocale),
    fallbackLocale,
    onMissingKey,
  });
