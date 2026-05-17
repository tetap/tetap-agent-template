import { describe, expect, it } from 'vitest';
import { getAcceptLanguage, parseAcceptLanguage, resolveLocale } from '@tetap/i18n/node';

describe('node i18n helpers', () => {
  it('parses accept-language candidates by descending quality', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.8, zh-CN;q=0.9, , ja-JP;q=bad')).toEqual([
      'en-US',
      'ja-JP',
      'zh-CN',
      'en',
    ]);
  });

  it('reads accept-language headers from case-insensitive records', () => {
    expect(
      getAcceptLanguage({
        headers: {
          'Accept-Language': 'en-US,zh-CN;q=0.8',
        },
      }),
    ).toBe('en-US,zh-CN;q=0.8');
  });

  it('resolves only supported locales and falls back for unsupported candidates', () => {
    expect(resolveLocale('en-US,en;q=0.8')).toBe('en-US');
    expect(resolveLocale('ja-JP,ko-KR;q=0.9')).toBe('zh-CN');
  });
});
