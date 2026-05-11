import { Bell, Monitor, Palette, UserRound } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, useAdminThemeStore, type AdminTheme } from '@tetap/hooks';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { ConfigDrawer } from '../layout/config-drawer.js';
import { ProfileDropdown } from '../layout/profile-dropdown.js';
import { SearchCommand } from '../layout/search-command.js';
import { ThemeSwitch } from '../layout/theme-switch.js';

type SettingsSection = 'account' | 'appearance' | 'display' | 'notifications';

const sectionMeta = {
  account: { icon: UserRound, titleKey: 'webAdmin.settings.account.title' },
  appearance: { icon: Palette, titleKey: 'webAdmin.settings.appearance.title' },
  display: { icon: Monitor, titleKey: 'webAdmin.settings.display.title' },
  notifications: { icon: Bell, titleKey: 'webAdmin.settings.notifications.title' },
} as const;

export const AdminSettingsPage = ({ section }: { section: SettingsSection }) => {
  const t = useAdminT();
  const user = useAdminSessionStore(state => state.auth.user);
  const theme = useAdminThemeStore(state => state.theme);
  const setTheme = useAdminThemeStore(state => state.setTheme);
  const meta = sectionMeta[section];
  const Icon = meta.icon;

  return (
    <>
      <AdminHeader>
        <div className="me-auto" />
        <SearchCommand />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </AdminHeader>
      <AdminMain className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Icon />
          <div>
            <h1 className="text-2xl font-semibold">{t(meta.titleKey)}</h1>
            <p className="text-muted-foreground">{t('webAdmin.settings.description')}</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t(meta.titleKey)}</CardTitle>
            <CardDescription>
              {t(`webAdmin.settings.${section}.description` as Parameters<typeof t>[0])}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {section === 'account' ? (
              <div className="grid gap-3 md:grid-cols-2">
                <InfoItem label={t('webAdmin.iam.fields.username')} value={user?.name ?? '-'} />
                <InfoItem label={t('webAdmin.iam.fields.email')} value={user?.email ?? '-'} />
                <InfoItem label={t('webAdmin.iam.fields.roleCodes')} value={user?.roles.join(', ') ?? '-'} />
              </div>
            ) : null}
            {section === 'appearance' || section === 'display' ? (
              <div className="max-w-sm">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {t('webAdmin.settings.theme.title')}
                  <Select onValueChange={value => setTheme(value as AdminTheme)} value={theme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="light">{t('webAdmin.settings.theme.light')}</SelectItem>
                        <SelectItem value="dark">{t('webAdmin.settings.theme.dark')}</SelectItem>
                        <SelectItem value="system">{t('webAdmin.settings.theme.system')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </label>
              </div>
            ) : null}
            {section === 'notifications' ? (
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{t('webAdmin.settings.notifications.system')}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('webAdmin.settings.notifications.systemDescription')}
                  </p>
                </div>
                <Badge variant="secondary">{t('webAdmin.settings.notifications.enabled')}</Badge>
              </div>
            ) : null}
            <div>
              <Button variant="outline">{t('common.confirm')}</Button>
            </div>
          </CardContent>
        </Card>
      </AdminMain>
    </>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border p-3">
    <p className="text-muted-foreground text-xs">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
