import { createI18n, normalizeLocale } from './core.js';
import { defaultLocale, resources, supportedLocales, type Locale } from './locales/registry.js';
import type { MissingKeyHandler } from './types.js';

export type CreateAppI18nOptions = {
  locale?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

export const createAppI18n = ({ locale, fallbackLocale = defaultLocale, onMissingKey }: CreateAppI18nOptions = {}) => {
  const resolvedLocale = normalizeLocale(locale, supportedLocales, fallbackLocale);

  return createI18n({
    resources,
    locale: resolvedLocale,
    fallbackLocale,
    onMissingKey,
  });
};
