import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { useAdminI18n, useAdminThemeEffect } from '@tetap/hooks';
import { ErrorBoundary } from '@tetap/ui';
import { AdminErrorBoundaryFallback } from './pages/error-boundary-fallback.js';
import { adminRouter } from './router/admin-router.js';

function App() {
  const { locale, t } = useAdminI18n();

  useAdminThemeEffect();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('webAdmin.title');
  }, [locale, t]);

  return (
    <ErrorBoundary fallback={<AdminErrorBoundaryFallback />}>
      <RouterProvider router={adminRouter} />
    </ErrorBoundary>
  );
}

export default App;
