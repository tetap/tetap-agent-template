import type {
  CreateI18nOptions,
  DotPath,
  I18nInstance,
  InterpolationValue,
  InterpolationValues,
  TranslationTree,
} from './types.js';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stringifyValue = (value: InterpolationValue) => (value === null || value === undefined ? '' : String(value));

const replaceAll = (message: string, token: string, value: string) => message.split(token).join(value);

export const interpolate = (message: string, values?: InterpolationValues) => {
  if (!values) {
    return message.replace(/\$\d+/g, '');
  }

  if (Array.isArray(values)) {
    return values.reduce((currentMessage, value, index) => {
      const replacement = stringifyValue(value);
      const zeroBasedIndex = String(index);
      const oneBasedIndex = String(index + 1);

      return replaceAll(currentMessage, `$${oneBasedIndex}`, replacement)
        .replace(new RegExp(`\\{\\{\\s*${zeroBasedIndex}\\s*\\}\\}`, 'g'), replacement)
        .replace(new RegExp(`\\{${zeroBasedIndex}\\}`, 'g'), replacement);
    }, message);
  }

  return Object.entries(values).reduce((currentMessage, [key, value]) => {
    const replacement = stringifyValue(value);
    const escapedKey = escapeRegExp(key);

    return currentMessage
      .replace(new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g'), replacement)
      .replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), replacement);
  }, message);
};

export const getMessageByKey = <TMessages extends TranslationTree>(messages: TMessages, key: string) => {
  const value = key.split('.').reduce<TranslationTree | string | undefined>((currentValue, segment) => {
    if (!currentValue || typeof currentValue === 'string') {
      return undefined;
    }

    return currentValue[segment];
  }, messages);

  return typeof value === 'string' ? value : undefined;
};

export const normalizeLocale = <TLocale extends string>(
  locale: string | undefined,
  supportedLocales: readonly TLocale[],
  fallbackLocale: TLocale,
) => {
  if (!locale) {
    return fallbackLocale;
  }

  const normalizedLocale = locale.trim().replace(/_/g, '-').toLowerCase();
  const exactLocale = supportedLocales.find(item => item.toLowerCase() === normalizedLocale);

  if (exactLocale) {
    return exactLocale;
  }

  const language = normalizedLocale.split('-')[0];
  const languageLocale = supportedLocales.find(item => item.toLowerCase().split('-')[0] === language);

  return languageLocale ?? fallbackLocale;
};

export const createI18n = <TMessages extends TranslationTree, TLocale extends string>({
  resources,
  locale,
  fallbackLocale = locale,
  onMissingKey,
}: CreateI18nOptions<TMessages, TLocale>): I18nInstance<TMessages, TLocale> => {
  let currentLocale = locale;
  const locales = Object.keys(resources) as TLocale[];

  const findMessage = (key: DotPath<TMessages>, targetLocale: TLocale) => getMessageByKey(resources[targetLocale], key);

  const t = (key: DotPath<TMessages>, values?: InterpolationValues) => {
    const message = findMessage(key, currentLocale) ?? findMessage(key, fallbackLocale);

    if (!message) {
      return onMissingKey?.(key, currentLocale) ?? key;
    }

    return interpolate(message, values);
  };

  return {
    get locale() {
      return currentLocale;
    },
    fallbackLocale,
    locales,
    setLocale(nextLocale) {
      currentLocale = nextLocale;
    },
    t,
    exists(key, targetLocale = currentLocale) {
      return Boolean(findMessage(key, targetLocale) ?? findMessage(key, fallbackLocale));
    },
  };
};
