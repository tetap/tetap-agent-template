export type TranslationLeaf = string;

export type TranslationTree = {
  readonly [key: string]: TranslationLeaf | TranslationTree;
};

export type LocaleResourceShape<T> = {
  readonly [Key in keyof T]: T[Key] extends TranslationLeaf ? string : LocaleResourceShape<T[Key]>;
};

export type DotPath<T, Prefix extends string = ''> = T extends TranslationLeaf
  ? never
  : {
      [Key in Extract<keyof T, string>]: T[Key] extends TranslationLeaf
        ? `${Prefix}${Key}`
        : T[Key] extends TranslationTree
          ? DotPath<T[Key], `${Prefix}${Key}.`>
          : never;
    }[Extract<keyof T, string>];

export type InterpolationValue = string | number | boolean | null | undefined;

export type InterpolationValues = Record<string, InterpolationValue> | readonly InterpolationValue[];

export type TranslateFunction<TMessages extends TranslationTree> = (
  key: DotPath<TMessages>,
  values?: InterpolationValues,
) => string;

export type MissingKeyHandler<TLocale extends string> = (key: string, locale: TLocale) => string;

export type CreateI18nOptions<TMessages extends TranslationTree, TLocale extends string> = {
  resources: Record<TLocale, TMessages>;
  locale: TLocale;
  fallbackLocale?: TLocale;
  onMissingKey?: MissingKeyHandler<TLocale>;
};

export type I18nInstance<TMessages extends TranslationTree, TLocale extends string> = {
  readonly locale: TLocale;
  readonly fallbackLocale: TLocale;
  readonly locales: readonly TLocale[];
  setLocale: (locale: TLocale) => void;
  t: TranslateFunction<TMessages>;
  exists: (key: DotPath<TMessages>, locale?: TLocale) => boolean;
};
