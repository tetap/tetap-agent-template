import { memo, useCallback, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { useAdminI18n, useAdminThemeEffect } from '@tetap/hooks';
import { ErrorBoundary } from '@tetap/ui';
import { AdminErrorBoundaryFallback } from './pages/error-boundary-fallback.js';
import { adminRouter } from './router/admin-router.js';

const App = memo(function App() {
  const { locale, t } = useAdminI18n();

  useAdminThemeEffect();

  const syncDocumentMetadata = useCallback(() => {
    document.documentElement.lang = locale;
    document.title = t('webAdmin.title');
  }, [locale, t]);

  useEffect(() => {
    syncDocumentMetadata();
  }, [syncDocumentMetadata]);

  return (
    <ErrorBoundary fallback={<AdminErrorBoundaryFallback />}>
      <RouterProvider router={adminRouter} />
    </ErrorBoundary>
  );
});

export default App;
