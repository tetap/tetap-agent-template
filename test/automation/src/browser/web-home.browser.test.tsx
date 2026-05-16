import { PublicI18nProvider, createPublicI18n } from '@tetap/i18n/public';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import '@tetap/ui/styles.css';
import { HomePage } from '../../../../apps/web/src/pages/home.tsx';

const i18n = createPublicI18n({ locale: 'zh-CN' });

const homeText = {
  capability: i18n.t('web.home.capabilities.frontend.title'),
  primaryAction: i18n.t('web.home.primaryAction'),
  title: i18n.t('web.home.title'),
  workflow: i18n.t('web.home.workflow.verify.title'),
};

describe('web promotional home page', () => {
  it('renders the public promotional landing content', async () => {
    const screen = await render(
      <PublicI18nProvider initialLocale="zh-CN">
        <HomePage />
      </PublicI18nProvider>,
    );

    expect(screen.getByRole('heading', { name: homeText.title }).query()).not.toBeNull();
    expect(screen.getByRole('link', { name: homeText.primaryAction }).query()).not.toBeNull();
    expect(screen.getByText(homeText.capability).query()).not.toBeNull();
    expect(screen.getByText(homeText.workflow).query()).not.toBeNull();
  });
});
