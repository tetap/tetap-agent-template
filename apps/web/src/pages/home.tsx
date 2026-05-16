import { memo } from 'react';
import { usePublicT } from '@tetap/hooks';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, TetapLogo } from '@tetap/ui';

export const HomePage = memo(function HomePage() {
  const t = usePublicT();

  return (
    <main className="min-h-svh bg-background text-foreground">
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
            <Card>
              <CardHeader>
                <CardDescription>{t('web.home.metrics.workspaces.label')}</CardDescription>
                <CardTitle className="text-4xl">{t('web.home.metrics.workspaces.value')}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t('web.home.metrics.gates.label')}</CardDescription>
                <CardTitle className="text-4xl">{t('web.home.metrics.gates.value')}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t('web.home.metrics.scopes.label')}</CardDescription>
                <CardTitle className="text-4xl">{t('web.home.metrics.scopes.value')}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b" id="capabilities">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal">{t('web.home.capabilitiesTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('web.home.capabilitiesDescription')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.capabilities.frontend.title')}</CardTitle>
                <CardDescription>{t('web.home.capabilities.frontend.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">apps/web</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.capabilities.admin.title')}</CardTitle>
                <CardDescription>{t('web.home.capabilities.admin.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">apps/web-admin</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.capabilities.contracts.title')}</CardTitle>
                <CardDescription>{t('web.home.capabilities.contracts.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">@tetap/schema</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.capabilities.gates.title')}</CardTitle>
                <CardDescription>{t('web.home.capabilities.gates.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">pnpm check</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="workflow">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal">{t('web.home.workflowTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('web.home.workflowDescription')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.workflow.inspect.title')}</CardTitle>
                <CardDescription>{t('web.home.workflow.inspect.description')}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.workflow.compose.title')}</CardTitle>
                <CardDescription>{t('web.home.workflow.compose.description')}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('web.home.workflow.verify.title')}</CardTitle>
                <CardDescription>{t('web.home.workflow.verify.description')}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
});
