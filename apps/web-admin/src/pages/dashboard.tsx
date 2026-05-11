import { Activity, CreditCard, Download, ShieldCheck, Users } from 'lucide-react';
import { useAdminT } from '@tetap/hooks';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tetap/ui';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { ProfileDropdown } from '../layout/profile-dropdown.js';
import { SearchCommand } from '../layout/search-command.js';
import { TopNav, type TopNavItem } from '../layout/top-nav.js';

const topNav: readonly TopNavItem[] = [
  { href: '/', titleKey: 'webAdmin.navigation.dashboard' },
  { href: '/users', titleKey: 'webAdmin.navigation.users' },
  { href: '/security/iam', titleKey: 'webAdmin.navigation.iam' },
  { href: '/settings', titleKey: 'webAdmin.navigation.settings' },
];

const metrics = [
  {
    icon: Users,
    labelKey: 'webAdmin.dashboard.metrics.activeUsers.label',
    valueKey: 'webAdmin.dashboard.metrics.activeUsers.value',
    trendKey: 'webAdmin.dashboard.metrics.activeUsers.trend',
  },
  {
    icon: Activity,
    labelKey: 'webAdmin.dashboard.metrics.adminTasks.label',
    valueKey: 'webAdmin.dashboard.metrics.adminTasks.value',
    trendKey: 'webAdmin.dashboard.metrics.adminTasks.trend',
  },
  {
    icon: ShieldCheck,
    labelKey: 'webAdmin.dashboard.metrics.securityEvents.label',
    valueKey: 'webAdmin.dashboard.metrics.securityEvents.value',
    trendKey: 'webAdmin.dashboard.metrics.securityEvents.trend',
  },
  {
    icon: CreditCard,
    labelKey: 'webAdmin.dashboard.metrics.backendStatus.label',
    valueKey: 'webAdmin.dashboard.metrics.backendStatus.value',
    trendKey: 'webAdmin.dashboard.metrics.backendStatus.trend',
  },
] as const;

const recentActivities = [
  'webAdmin.dashboard.activity.items.audit',
  'webAdmin.dashboard.activity.items.userReview',
  'webAdmin.dashboard.activity.items.roleSync',
] as const;

const chartBars = [34, 52, 44, 68, 58, 74, 62, 86, 70, 92, 78, 96] as const;

export const AdminDashboardPage = () => {
  const t = useAdminT();

  return (
    <>
      <AdminHeader>
        <TopNav className="me-auto" links={topNav} />
        <SearchCommand />
        <ProfileDropdown />
      </AdminHeader>
      <AdminMain>
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('webAdmin.dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('webAdmin.dashboard.description')}</p>
          </div>
          <Button>
            <Download data-icon="inline-start" />
            {t('webAdmin.dashboard.actions.download')}
          </Button>
        </div>
        <Tabs className="flex flex-col gap-4" defaultValue="overview" orientation="vertical">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">{t('webAdmin.dashboard.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="users">{t('webAdmin.dashboard.tabs.users')}</TabsTrigger>
              <TabsTrigger value="security">{t('webAdmin.dashboard.tabs.security')}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="flex flex-col gap-4" value="overview">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(metric => {
                const Icon = metric.icon;

                return (
                  <Card key={metric.labelKey}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">{t(metric.labelKey)}</CardTitle>
                      <Icon className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{t(metric.valueKey)}</div>
                      <p className="text-xs text-muted-foreground">{t(metric.trendKey)}</p>
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
                <CardContent>
                  <div className="flex h-72 items-end gap-3">
                    {chartBars.map((height, index) => (
                      <div className="flex flex-1 flex-col items-center gap-2" key={`${height}-${index}`}>
                        <div className="w-full rounded-md bg-primary" style={{ height: `${height}%` }} />
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
                  {recentActivities.map((activityKey, index) => (
                    <div className="flex items-center gap-4" key={activityKey}>
                      <Avatar className="size-9">
                        <AvatarFallback>{`0${index + 1}`}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-sm font-medium leading-none">{t(activityKey)}</p>
                        <p className="text-sm text-muted-foreground">{t('webAdmin.dashboard.activity.timestamp')}</p>
                      </div>
                      <Badge variant="secondary">{t('webAdmin.badge')}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </TabsContent>
          <TabsContent className="flex flex-col gap-4" value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t('webAdmin.dashboard.users.title')}</CardTitle>
                <CardDescription>{t('webAdmin.dashboard.users.description')}</CardDescription>
              </CardHeader>
              <CardContent>{t('webAdmin.dashboard.users.content')}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent className="flex flex-col gap-4" value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t('webAdmin.dashboard.activity.title')}</CardTitle>
                <CardDescription>{t('webAdmin.dashboard.activity.description')}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {recentActivities.map(activityKey => (
                  <div className="rounded-lg border p-3" key={activityKey}>
                    {t(activityKey)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminMain>
    </>
  );
};
