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
export { defaultLocale, resources, supportedLocales } from './locales/registry.js';
export type { AppMessageKey, AppMessages, Locale } from './locales/registry.js';
export { createAppI18n } from './app.js';
export type { CreateAppI18nOptions } from './app.js';
