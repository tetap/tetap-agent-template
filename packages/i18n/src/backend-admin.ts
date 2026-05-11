import { createI18n, normalizeLocale } from './core.js';
import { defaultLocale, supportedLocales, type Locale } from './locales/index.js';
import { enUS } from './locales/en-US.js';
import { zhCN } from './locales/zh-CN.js';
import type { DotPath, LocaleResourceShape, MissingKeyHandler } from './types.js';

export const backendAdminZhCN = {
  backendAdmin: zhCN.backendAdmin,
  common: zhCN.common,
  error: zhCN.error,
  validation: zhCN.validation,
} as const;

export const backendAdminEnUS = {
  backendAdmin: enUS.backendAdmin,
  common: enUS.common,
  error: enUS.error,
  validation: enUS.validation,
} as const satisfies LocaleResourceShape<typeof backendAdminZhCN>;

export const backendAdminResources = {
  'en-US': backendAdminEnUS,
  'zh-CN': backendAdminZhCN,
} as const;

export type BackendAdminMessages = typeof backendAdminZhCN;
export type BackendAdminMessageKey = DotPath<BackendAdminMessages>;

export type CreateBackendAdminI18nOptions = {
  locale?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

export const createBackendAdminI18n = ({
  locale,
  fallbackLocale = defaultLocale,
  onMissingKey,
}: CreateBackendAdminI18nOptions = {}) =>
  createI18n({
    resources: backendAdminResources,
    locale: normalizeLocale(locale, supportedLocales, fallbackLocale),
    fallbackLocale,
    onMissingKey,
  });
