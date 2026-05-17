import { createAppI18n } from './app.js';
import { defaultLocale, supportedLocales, type Locale } from './locales/registry.js';
import { normalizeLocale } from './core.js';
import type { MissingKeyHandler } from './types.js';

export type HeaderValue = string | readonly string[] | undefined;

export type HeaderRecord = Record<string, HeaderValue>;

export type RequestLike = {
  headers?: HeaderRecord;
  get?: (name: string) => string | undefined;
  header?: (name: string) => string | undefined;
};

export type CreateNodeI18nOptions = {
  locale?: string;
  acceptLanguage?: string;
  fallbackLocale?: Locale;
  onMissingKey?: MissingKeyHandler<Locale>;
};

const stringifyHeaderValue = (value: HeaderValue): string | undefined =>
  typeof value === 'string' ? value : value?.join(',');

const getHeaderFromRecord = (headers: HeaderRecord | undefined, name: string) => {
  if (!headers) {
    return undefined;
  }

  const exactValue = headers[name];
  const lowerName = name.toLowerCase();
  const lowerValue = Object.entries(headers).find(([key]) => key.toLowerCase() === lowerName)?.[1];
  const value = exactValue ?? lowerValue;

  return stringifyHeaderValue(value);
};

export const parseAcceptLanguage = (acceptLanguage: string | undefined) => {
  if (!acceptLanguage) {
    return [];
  }

  const candidates: Array<{ locale: string; quality: number }> = [];

  for (const item of acceptLanguage.split(',')) {
    const [locale = '', qValue] = item.trim().split(';q=');
    const trimmedLocale = locale.trim();

    if (!trimmedLocale) {
      continue;
    }

    const quality = qValue ? Number(qValue) : 1;

    candidates.push({
      locale: trimmedLocale,
      quality: Number.isFinite(quality) ? quality : 1,
    });
  }

  return candidates.sort((left, right) => right.quality - left.quality).map(item => item.locale);
};

export const getAcceptLanguage = (request: RequestLike): string | undefined =>
  request.get?.('accept-language') ??
  request.header?.('accept-language') ??
  getHeaderFromRecord(request.headers, 'accept-language');

export const resolveLocale = (input?: string | RequestLike, fallbackLocale: Locale = defaultLocale) => {
  const candidates =
    typeof input === 'string'
      ? parseAcceptLanguage(input)
      : parseAcceptLanguage(input ? getAcceptLanguage(input) : undefined);
  const [firstCandidate] = candidates;

  return normalizeLocale(firstCandidate, supportedLocales, fallbackLocale);
};

export const createNodeI18n = ({
  locale,
  acceptLanguage,
  fallbackLocale = defaultLocale,
  onMissingKey,
}: CreateNodeI18nOptions = {}) =>
  createAppI18n({
    locale: locale ?? resolveLocale(acceptLanguage, fallbackLocale),
    fallbackLocale,
    onMissingKey,
  });

export const createRequestI18n = (
  request: RequestLike,
  options: Omit<CreateNodeI18nOptions, 'acceptLanguage' | 'locale'> = {},
) =>
  createNodeI18n({
    ...options,
    acceptLanguage: getAcceptLanguage(request),
  });
