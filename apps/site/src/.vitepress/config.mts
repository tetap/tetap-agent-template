import { createSiteI18n } from '@tetap/i18n/site';
import { defineConfig } from 'vitepress';

const i18n = createSiteI18n({ locale: 'zh-CN' });

export default defineConfig({
  title: i18n.t('site.meta.title'),
  description: i18n.t('site.meta.description'),
  lang: 'zh-CN',
  cleanUrls: true,
  outDir: '../dist',
  themeConfig: {
    nav: [
      { text: i18n.t('site.nav.docs'), link: '/' },
      { text: i18n.t('site.nav.architecture'), link: '/#features' },
      { text: i18n.t('site.nav.quality'), link: '/#workflow' },
    ],
    search: {
      provider: 'local',
    },
  },
});
