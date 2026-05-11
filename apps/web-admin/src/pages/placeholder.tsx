import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import type { AdminMessageKey } from '@tetap/i18n/admin';

export const AdminPlaceholderPage = ({
  descriptionKey,
  titleKey,
}: {
  descriptionKey: AdminMessageKey;
  titleKey: AdminMessageKey;
}) => {
  const t = useAdminT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
        <CardDescription>{t(descriptionKey)}</CardDescription>
      </CardHeader>
      <CardContent>{t('webAdmin.placeholder.content')}</CardContent>
    </Card>
  );
};
