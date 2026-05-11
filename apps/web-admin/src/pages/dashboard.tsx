import { Link } from 'react-router';
import { useAdminT } from '@tetap/hooks';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tetap/ui';

const navigationLinks = [
  { href: '/', labelKey: 'webAdmin.navigation.dashboard' },
  { href: '/', labelKey: 'webAdmin.navigation.users' },
  { href: '/', labelKey: 'webAdmin.navigation.settings' },
] as const;

const metrics = [
  {
    labelKey: 'webAdmin.dashboard.metrics.activeUsers.label',
    valueKey: 'webAdmin.dashboard.metrics.activeUsers.value',
    trendKey: 'webAdmin.dashboard.metrics.activeUsers.trend',
  },
  {
    labelKey: 'webAdmin.dashboard.metrics.adminTasks.label',
    valueKey: 'webAdmin.dashboard.metrics.adminTasks.value',
    trendKey: 'webAdmin.dashboard.metrics.adminTasks.trend',
  },
  {
    labelKey: 'webAdmin.dashboard.metrics.securityEvents.label',
    valueKey: 'webAdmin.dashboard.metrics.securityEvents.value',
    trendKey: 'webAdmin.dashboard.metrics.securityEvents.trend',
  },
  {
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

export const AdminDashboardPage = () => {
  const t = useAdminT();

  return (
    <main aria-labelledby="admin-dashboard-title">
      <Card>
        <CardHeader>
          <Badge>{t('webAdmin.badge')}</Badge>
          <CardTitle id="admin-dashboard-title">{t('webAdmin.dashboard.title')}</CardTitle>
          <CardDescription>{t('webAdmin.dashboard.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <nav aria-label={t('webAdmin.navigation.label')}>
            {navigationLinks.map(link => (
              <Button asChild key={link.labelKey} variant="ghost">
                <Link to={link.href}>{t(link.labelKey)}</Link>
              </Button>
            ))}
          </nav>
          <Separator />
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t('webAdmin.dashboard.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="users">{t('webAdmin.dashboard.tabs.users')}</TabsTrigger>
              <TabsTrigger value="security">{t('webAdmin.dashboard.tabs.security')}</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              {metrics.map(metric => (
                <Card key={metric.labelKey}>
                  <CardHeader>
                    <CardTitle>{t(metric.labelKey)}</CardTitle>
                    <CardDescription>{t(metric.trendKey)}</CardDescription>
                  </CardHeader>
                  <CardContent>{t(metric.valueKey)}</CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.dashboard.users.title')}</CardTitle>
                  <CardDescription>{t('webAdmin.dashboard.users.description')}</CardDescription>
                </CardHeader>
                <CardContent>{t('webAdmin.dashboard.users.content')}</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.dashboard.activity.title')}</CardTitle>
                  <CardDescription>{t('webAdmin.dashboard.activity.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul>
                    {recentActivities.map(activityKey => (
                      <li key={activityKey}>{t(activityKey)}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button>{t('webAdmin.actions.sync')}</Button>
          <Button asChild variant="outline">
            <Link to="/">{t('webAdmin.actions.openDashboard')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
