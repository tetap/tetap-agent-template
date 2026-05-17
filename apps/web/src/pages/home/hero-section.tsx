import { memo } from 'react';
import { usePublicT } from '@tetap/hooks';
import { Badge, Button, TetapLogo } from '@tetap/ui';
import { HomeMetricCard } from './metric-card.js';

export const HomeHeroSection = memo(function HomeHeroSection() {
  const t = usePublicT();

  return (
    <section className="border-b">
      <div className="mx-auto grid min-h-[calc(100svh-6rem)] w-full max-w-6xl content-center gap-10 px-6 py-14 md:grid-cols-[1fr_22rem] md:items-center lg:px-8">
        <div className="flex max-w-3xl flex-col gap-7">
          <div className="flex items-center gap-3">
            <TetapLogo className="size-12" />
            <Badge variant="secondary">{t('web.home.eyebrow')}</Badge>
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-semibold tracking-normal text-balance md:text-6xl">{t('web.home.title')}</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{t('web.home.description')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#capabilities">{t('web.home.primaryAction')}</a>
            </Button>
            <Button asChild variant="outline">
              <a href="#workflow">{t('web.home.secondaryAction')}</a>
            </Button>
          </div>
        </div>
        <div aria-label={t('app.architectureTitle')} className="grid gap-3">
          <HomeMetricCard
            label={t('web.home.metrics.workspaces.label')}
            value={t('web.home.metrics.workspaces.value')}
          />
          <HomeMetricCard label={t('web.home.metrics.gates.label')} value={t('web.home.metrics.gates.value')} />
          <HomeMetricCard label={t('web.home.metrics.scopes.label')} value={t('web.home.metrics.scopes.value')} />
        </div>
      </div>
    </section>
  );
});
