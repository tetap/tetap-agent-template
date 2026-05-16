import type { ComponentProps } from 'react';
import { memo, useCallback, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { usePublicI18n } from '@tetap/hooks';
import { ErrorBoundary } from '@tetap/ui';
import { WebStatePage } from './pages/state-page';

type AppProps = Pick<ComponentProps<typeof RouterProvider>, 'router'>;

const App = memo(function App({ router }: AppProps) {
  const { locale, t } = usePublicI18n();

  const syncDocumentMetadata = useCallback(() => {
    document.documentElement.lang = locale;
    document.title = t('app.title');
  }, [locale, t]);

  useEffect(() => {
    syncDocumentMetadata();
  }, [syncDocumentMetadata]);

  return (
    <ErrorBoundary fallback={<WebStatePage status="500" />}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
});

export default App;
