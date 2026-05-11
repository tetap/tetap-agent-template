import { createI18n, normalizeLocale } from './core.js';
import { defaultLocale, supportedLocales, type Locale } from './locales/index.js';
import { enUS } from './locales/en-US.js';
import { zhCN } from './locales/zh-CN.js';
import type { DotPath, LocaleResourceShape, MissingKeyHandler } from './types.js';

export const siteZhCN = {
  site: zhCN.site,
} as const;

export const siteEnUS = {
  site: enUS.site,
} as const satisfies LocaleResourceShape<typeof siteZhCN>;

export const siteResources = {
  'en-US': siteEnUS,
  'zh-CN': siteZhCN,
} as const;

export type SiteMessages = typeof siteZhCN;
export type SiteMessageKey = DotPath<SiteMessages>;

export type CreateSiteI18nOptions = {
  locale?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

export const createSiteI18n = ({ locale, fallbackLocale = defaultLocale, onMissingKey }: CreateSiteI18nOptions = {}) =>
  createI18n({
    resources: siteResources,
    locale: normalizeLocale(locale, supportedLocales, fallbackLocale),
    fallbackLocale,
    onMissingKey,
  });
