import { useEffect, useState } from 'react';
import { Activity, Download, KeyRound, Settings, ShieldCheck, Sun, Users } from 'lucide-react';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tetap/ui';
import type { IamOverviewData } from '@tetap/schema/iam';
import { fetchIamOverview } from '../api/backend-admin.js';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { ProfileDropdown } from '../layout/profile-dropdown.js';
import { SearchCommand } from '../layout/search-command.js';
import { TopNav, type TopNavItem } from '../layout/top-nav.js';

const topNav: readonly TopNavItem[] = [
  { href: '/', titleKey: 'webAdmin.dashboard.topNav.overview' },
  { disabled: true, href: '/customers', titleKey: 'webAdmin.dashboard.topNav.customers' },
  { disabled: true, href: '/products', titleKey: 'webAdmin.dashboard.topNav.products' },
  { disabled: true, href: '/settings', titleKey: 'webAdmin.dashboard.topNav.settings' },
];

export const AdminDashboardPage = () => {
  const t = useAdminT();
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const capabilities = useAdminSessionStore(state => state.auth.capabilities);
  const [overview, setOverview] = useState<IamOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canReadIam = capabilities.includes('iam:read');

  useEffect(() => {
    if (!accessToken || !canReadIam) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadOverview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchIamOverview(accessToken);

        if (isActive) {
          setOverview(data);
        }
      } catch {
        if (isActive) {
          setError(t('webAdmin.dashboard.states.loadFailed'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isActive = false;
    };
  }, [accessToken, canReadIam, t]);

  const metrics = [
    {
      icon: Users,
      label: t('webAdmin.dashboard.metrics.activeUsers.label'),
      value: overview?.users.length ?? 0,
      trend: t('webAdmin.dashboard.metrics.activeUsers.trend'),
    },
    {
      icon: KeyRound,
      label: t('webAdmin.dashboard.metrics.adminTasks.label'),
      value: overview?.roles.length ?? 0,
      trend: t('webAdmin.dashboard.metrics.adminTasks.trend'),
    },
    {
      icon: ShieldCheck,
      label: t('webAdmin.dashboard.metrics.securityEvents.label'),
      value: overview?.auditLogs.length ?? 0,
      trend: t('webAdmin.dashboard.metrics.securityEvents.trend'),
    },
    {
      icon: Activity,
      label: t('webAdmin.dashboard.metrics.backendStatus.label'),
      value: overview?.sessions.filter(session => session.status === 'ONLINE').length ?? 0,
      trend: t('webAdmin.dashboard.metrics.backendStatus.trend'),
    },
  ];
  const chartValues = overview
    ? [
        overview.users.length,
        overview.roles.length,
        overview.permissions.length,
        overview.menus.length,
        overview.fieldPermissions.length,
        overview.policies.length,
        overview.sessions.length,
        overview.auditLogs.length,
      ]
    : [];
  const chartMax = Math.max(...chartValues, 1);

  return (
    <>
      <AdminHeader>
        <TopNav className="me-auto" links={topNav} />
        <SearchCommand />
        <Button size="icon" variant="ghost">
          <Sun />
          <span className="sr-only">{t('webAdmin.layout.themeToggle')}</span>
        </Button>
        <Button size="icon" variant="ghost">
          <Settings />
          <span className="sr-only">{t('webAdmin.layout.configToggle')}</span>
        </Button>
        <ProfileDropdown />
      </AdminHeader>
      <AdminMain>
        <div className="mb-2 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{t('webAdmin.dashboard.title')}</h1>
          <Button>
            <Download data-icon="inline-start" />
            {t('webAdmin.dashboard.actions.download')}
          </Button>
        </div>
        <Tabs className="flex flex-col gap-4" defaultValue="overview" orientation="vertical">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">{t('webAdmin.dashboard.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('webAdmin.dashboard.tabs.analytics')}</TabsTrigger>
              <TabsTrigger disabled value="reports">
                {t('webAdmin.dashboard.tabs.reports')}
              </TabsTrigger>
              <TabsTrigger disabled value="notifications">
                {t('webAdmin.dashboard.tabs.notifications')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="flex flex-col gap-4" value="overview">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(metric => {
                const Icon = metric.icon;

                return (
                  <Card key={metric.label}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                      <Icon className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <div className="text-2xl font-bold">{metric.value}</div>
                      )}
                      <p className="text-xs text-muted-foreground">{metric.trend}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>{t('webAdmin.dashboard.overview.title')}</CardTitle>
                  <CardDescription>{t('webAdmin.dashboard.overview.description')}</CardDescription>
                </CardHeader>
                <CardContent className="ps-2">
                  <div className="flex h-72 items-end gap-3">
                    {isLoading
                      ? Array.from({ length: 8 }).map((_, index) => (
                          <Skeleton className="h-full flex-1" key={`dashboard-chart-skeleton-${index}`} />
                        ))
                      : chartValues.map((value, index) => (
                          <div className="flex h-full flex-1 flex-col justify-end gap-2" key={`${value}-${index}`}>
                            <div
                              className="w-full rounded-md bg-primary"
                              style={{ height: `${Math.max((value / chartMax) * 100, value > 0 ? 12 : 4)}%` }}
                            />
                            <span className="text-xs text-muted-foreground">{index + 1}</span>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>{t('webAdmin.dashboard.activity.title')}</CardTitle>
                  <CardDescription>{t('webAdmin.dashboard.activity.description')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </>
                  ) : (
                    (overview?.auditLogs.slice(0, 3) ?? []).map((activity, index) => (
                      <div className="flex items-center gap-4" key={activity.id}>
                        <Avatar className="size-9">
                          <AvatarFallback>{`0${index + 1}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm font-medium leading-none">{`${activity.action}:${activity.result}`}</p>
                          <p className="text-sm text-muted-foreground">{activity.createdAt}</p>
                        </div>
                        <Badge variant="secondary">{activity.resource}</Badge>
                      </div>
                    ))
                  )}
                  {!isLoading && !overview?.auditLogs.length ? (
                    <p className="text-sm text-muted-foreground">{t('webAdmin.dashboard.activity.empty')}</p>
                  ) : null}
                </CardContent>
              </Card>
            </section>
          </TabsContent>
          <TabsContent className="flex flex-col gap-4" value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>{t('webAdmin.dashboard.users.title')}</CardTitle>
                <CardDescription>{t('webAdmin.dashboard.users.description')}</CardDescription>
              </CardHeader>
              <CardContent>{t('webAdmin.dashboard.users.content')}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminMain>
    </>
  );
};
