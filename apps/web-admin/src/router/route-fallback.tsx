import { Suspense, type ReactNode } from 'react';
import { useAdminI18n } from '@tetap/hooks';

export const AdminRouteFallback = () => {
  const { t } = useAdminI18n();

  return (
    <div
      aria-busy="true"
      aria-label={t('common.loading')}
      className="flex min-h-80 w-full items-center justify-center p-6"
      role="status">
      <span className="sr-only">{t('common.loading')}</span>
      <span aria-hidden="true" className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
};

export const withRouteFallback = (children: ReactNode) => (
  <Suspense fallback={<AdminRouteFallback />}>{children}</Suspense>
);
