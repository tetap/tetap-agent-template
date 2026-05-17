import { memo } from 'react';
import { usePublicT } from '@tetap/hooks';
import { SectionHeading } from './section-heading.js';
import { HomeSummaryCard } from './summary-card.js';

export const HomeWorkflowSection = memo(function HomeWorkflowSection() {
  const t = usePublicT();

  return (
    <section id="workflow">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 lg:px-8">
        <SectionHeading title={t('web.home.workflowTitle')} description={t('web.home.workflowDescription')} />
        <div className="grid gap-4 md:grid-cols-3">
          <HomeSummaryCard
            title={t('web.home.workflow.inspect.title')}
            description={t('web.home.workflow.inspect.description')}
          />
          <HomeSummaryCard
            title={t('web.home.workflow.compose.title')}
            description={t('web.home.workflow.compose.description')}
          />
          <HomeSummaryCard
            title={t('web.home.workflow.verify.title')}
            description={t('web.home.workflow.verify.description')}
          />
        </div>
      </div>
    </section>
  );
});
