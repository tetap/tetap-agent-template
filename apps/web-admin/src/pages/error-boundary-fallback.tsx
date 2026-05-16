import { memo } from 'react';
import { Button, Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';

export const AdminErrorBoundaryFallback = memo(function AdminErrorBoundaryFallback() {
  const t = useAdminT();

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{t('webAdmin.statePages.internalError.title')}</CardTitle>
          <CardDescription>{t('webAdmin.statePages.internalError.description')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <a href="/">{t('webAdmin.actions.openDashboard')}</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
});
