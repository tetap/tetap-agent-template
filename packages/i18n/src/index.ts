export { createI18n, getMessageByKey, interpolate, normalizeLocale } from './core.js';
export type {
  CreateI18nOptions,
  DotPath,
  I18nInstance,
  InterpolationValue,
  InterpolationValues,
  LocaleResourceShape,
  MissingKeyHandler,
  TranslateFunction,
  TranslationLeaf,
  TranslationTree,
} from './types.js';
export { defaultLocale, resources, supportedLocales } from './locales/index.js';
export type { AppMessageKey, AppMessages, Locale } from './locales/index.js';

import { createI18n } from './core.js';
import { defaultLocale, resources, supportedLocales, type Locale } from './locales/index.js';
import { normalizeLocale } from './core.js';
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
