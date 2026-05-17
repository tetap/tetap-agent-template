import { memo } from 'react';
import { usePublicT } from '@tetap/hooks';
import { SectionHeading } from './section-heading.js';
import { HomeSummaryCard } from './summary-card.js';

export const HomeCapabilitiesSection = memo(function HomeCapabilitiesSection() {
  const t = usePublicT();

  return (
    <section className="border-b" id="capabilities">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 lg:px-8">
        <SectionHeading title={t('web.home.capabilitiesTitle')} description={t('web.home.capabilitiesDescription')} />
        <div className="grid gap-4 md:grid-cols-2">
          <HomeSummaryCard
            title={t('web.home.capabilities.frontend.title')}
            description={t('web.home.capabilities.frontend.description')}
            label="apps/web"
          />
          <HomeSummaryCard
            title={t('web.home.capabilities.admin.title')}
            description={t('web.home.capabilities.admin.description')}
            label="apps/web-admin"
          />
          <HomeSummaryCard
            title={t('web.home.capabilities.contracts.title')}
            description={t('web.home.capabilities.contracts.description')}
            label="@tetap/schema"
          />
          <HomeSummaryCard
            title={t('web.home.capabilities.gates.title')}
            description={t('web.home.capabilities.gates.description')}
            label="pnpm check"
          />
        </div>
      </div>
    </section>
  );
});
