import { useEffect, useState } from 'react';
import { Activity, KeyRound, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { formatUserDateTime, getUserTimeZone, useAdminSessionStore, useAdminT } from '@tetap/hooks';
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
} from '@tetap/ui';
import type { IamOperationLogsData, IamOverviewData } from '@tetap/schema/iam';
import { fetchIamOperationLogs, fetchIamOverview } from '../api/backend-admin.js';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { SearchCommand } from '../layout/search-command.js';
import { ThemeSwitch } from '../layout/theme-switch.js';

export const AdminDashboardPage = () => {
  const t = useAdminT();
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const capabilities = useAdminSessionStore(state => state.auth.capabilities);
  const [overview, setOverview] = useState<IamOverviewData | null>(null);
  const [activityLogs, setActivityLogs] = useState<IamOperationLogsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canReadIam = capabilities.includes('iam:read');
  const canReadOperationLogs = capabilities.includes('operation-log:read');
  const timeZone = getUserTimeZone();

  const loadOverview = async () => {
    if (!accessToken || !canReadIam) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [overviewData, operationLogsData] = await Promise.all([
        fetchIamOverview(accessToken),
        canReadOperationLogs
          ? fetchIamOperationLogs(accessToken, { page: 1, pageSize: 5, sort: 'desc' })
          : Promise.resolve(null),
      ]);

      setOverview(overviewData);
      setActivityLogs(operationLogsData);
    } catch {
      setError(t('webAdmin.dashboard.states.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, [accessToken, canReadIam, canReadOperationLogs]);

  const metrics = [
    {
      icon: Users,
      label: t('webAdmin.dashboard.metrics.activeUsers.label'),
      value: overview?.metrics.users ?? 0,
      trend: t('webAdmin.dashboard.metrics.activeUsers.trend'),
    },
    {
      icon: KeyRound,
      label: t('webAdmin.dashboard.metrics.adminTasks.label'),
      value: overview?.metrics.roles ?? 0,
      trend: t('webAdmin.dashboard.metrics.adminTasks.trend'),
    },
    {
      icon: ShieldCheck,
      label: t('webAdmin.dashboard.metrics.securityEvents.label'),
      value: overview?.metrics.operationLogs ?? 0,
      trend: t('webAdmin.dashboard.metrics.securityEvents.trend'),
    },
    {
      icon: Activity,
      label: t('webAdmin.dashboard.metrics.backendStatus.label'),
      value: overview?.metrics.sessions ?? 0,
      trend: t('webAdmin.dashboard.metrics.backendStatus.trend'),
    },
  ];
  const chartItems = overview
    ? [
        { key: 'users', value: overview.metrics.users },
        { key: 'roles', value: overview.metrics.roles },
        { key: 'permissions', value: overview.metrics.permissions },
        { key: 'menus', value: overview.metrics.menus },
        { key: 'field-permissions', value: overview.metrics.fieldPermissions },
        { key: 'policies', value: overview.metrics.policies },
        { key: 'sessions', value: overview.metrics.sessions },
        { key: 'operation-logs', value: overview.metrics.operationLogs },
      ]
    : [];
  const chartMax = Math.max(...chartItems.map(item => item.value), 1);

  return (
    <>
      <AdminHeader>
        <div className="me-auto" />
        <SearchCommand />
        <ThemeSwitch />
      </AdminHeader>
      <AdminMain className="flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight">{t('webAdmin.dashboard.title')}</h1>
          <Button disabled={isLoading} onClick={() => void loadOverview()} variant="outline">
            <RefreshCw className={isLoading ? 'animate-spin' : undefined} data-icon="inline-start" />
            {t('webAdmin.dashboard.actions.refresh')}
          </Button>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <section className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(metric => {
              const Icon = metric.icon;

              return (
                <Card key={metric.label}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="min-w-0 truncate text-sm font-medium">{metric.label}</CardTitle>
                    <Icon className="text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold">{metric.value}</div>
                    )}
                    <p className="truncate text-xs text-muted-foreground">{metric.trend}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>
          <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle className="truncate">{t('webAdmin.dashboard.overview.title')}</CardTitle>
                <CardDescription className="truncate">{t('webAdmin.dashboard.overview.description')}</CardDescription>
              </CardHeader>
              <CardContent className="ps-2">
                <div className="flex h-72 min-w-0 items-end gap-3 overflow-x-auto pb-1">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton className="h-full flex-1" key={`dashboard-chart-skeleton-${index}`} />
                      ))
                    : chartItems.map((item, index) => (
                        <div className="flex h-full flex-1 flex-col justify-end gap-2" key={item.key}>
                          <div
                            className="w-full rounded-md bg-primary"
                            style={{ height: `${Math.max((item.value / chartMax) * 100, item.value > 0 ? 12 : 4)}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{index + 1}</span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="truncate">{t('webAdmin.dashboard.activity.title')}</CardTitle>
                <CardDescription className="truncate">{t('webAdmin.dashboard.activity.description')}</CardDescription>
              </CardHeader>
              <CardContent className="flex min-w-0 flex-col gap-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  (activityLogs?.items ?? []).map((activity, index) => (
                    <div className="flex min-w-0 items-center gap-4" key={activity.id}>
                      <Avatar className="size-9">
                        <AvatarFallback>{`0${index + 1}`}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="truncate text-sm font-medium leading-none">{`${activity.operation}:${activity.result}`}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {formatUserDateTime(activity.operationTime, timeZone)}
                        </p>
                      </div>
                      <Badge className="max-w-28 shrink-0 truncate" variant="secondary">
                        {activity.resource}
                      </Badge>
                    </div>
                  ))
                )}
                {!isLoading && !activityLogs?.items.length ? (
                  <p className="text-sm text-muted-foreground">{t('webAdmin.dashboard.activity.empty')}</p>
                ) : null}
              </CardContent>
            </Card>
          </section>
        </div>
      </AdminMain>
    </>
  );
};
