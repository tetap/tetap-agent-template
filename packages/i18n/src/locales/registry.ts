import type { DotPath, LocaleResourceShape } from '../types.js';
import { enUS } from './en-US.js';
import { zhCN } from './zh-CN.js';

export const defaultLocale = 'zh-CN';

export const supportedLocales = ['zh-CN', 'en-US'] as const;

export type Locale = (typeof supportedLocales)[number];

export type AppMessages = LocaleResourceShape<typeof zhCN>;

export type AppMessageKey = DotPath<AppMessages>;

export const resources: Record<Locale, AppMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};
