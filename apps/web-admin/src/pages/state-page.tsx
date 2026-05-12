import { Card, CardDescription, CardHeader, CardTitle } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import type { AdminMessageKey } from '@tetap/i18n/admin';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { SearchCommand } from '../layout/search-command.js';
import { ThemeSwitch } from '../layout/theme-switch.js';

export const AdminStatePage = ({
  descriptionKey,
  titleKey,
}: {
  descriptionKey: AdminMessageKey;
  titleKey: AdminMessageKey;
}) => {
  const t = useAdminT();

  return (
    <>
      <AdminHeader>
        <div className="me-auto" />
        <SearchCommand />
        <ThemeSwitch />
      </AdminHeader>
      <AdminMain>
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{t(titleKey)}</h1>
          <p className="text-muted-foreground">{t(descriptionKey)}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t(titleKey)}</CardTitle>
            <CardDescription>{t(descriptionKey)}</CardDescription>
          </CardHeader>
        </Card>
      </AdminMain>
    </>
  );
};
