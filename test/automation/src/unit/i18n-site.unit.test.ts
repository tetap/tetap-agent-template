import { createSiteI18n } from '@tetap/i18n/site';
import { describe, expect, it } from 'vitest';

describe('site i18n scope', () => {
  it('loads VitePress site copy from the isolated site scope', () => {
    const zh = createSiteI18n({ locale: 'zh-CN' });
    const en = createSiteI18n({ locale: 'en-US' });

    expect(zh.t('site.hero.titleLine2')).toBe('应用工程基座');
    expect(en.t('site.hero.titleLine2')).toBe('application foundation');
  });
});
