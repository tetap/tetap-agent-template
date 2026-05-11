import { createSiteI18n } from '@tetap/i18n/site';
import { defineConfig } from 'vitepress';

const i18n = createSiteI18n({ locale: 'zh-CN' });

const normalizeBase = (base: string) => (base.endsWith('/') ? base : `${base}/`);

const resolveBase = () => {
  if (process.env.TETAP_SITE_BASE) {
    return normalizeBase(process.env.TETAP_SITE_BASE);
  }

  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const ownerPagesRepository = `${process.env.GITHUB_REPOSITORY_OWNER}.github.io`;

  if (process.env.GITHUB_ACTIONS === 'true' && repositoryName && repositoryName !== ownerPagesRepository) {
    return `/${repositoryName}/`;
  }

  return '/';
};

export default defineConfig({
  title: i18n.t('site.meta.title'),
  description: i18n.t('site.meta.description'),
  lang: 'zh-CN',
  base: resolveBase(),
  cleanUrls: true,
  outDir: '../dist',
  themeConfig: {
    nav: [
      { text: i18n.t('site.nav.docs'), link: '/' },
      { text: i18n.t('site.nav.story'), link: '/#scroll-story' },
      { text: i18n.t('site.nav.architecture'), link: '/#features' },
      { text: i18n.t('site.nav.quality'), link: '/#workflow' },
    ],
    search: {
      provider: 'local',
    },
  },
});
