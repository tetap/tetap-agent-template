import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { usePublicI18n } from '@tetap/hooks';

type AppProps = Pick<ComponentProps<typeof RouterProvider>, 'router'>;

function App({ router }: AppProps) {
  const { locale, t } = usePublicI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('app.title');
  }, [locale, t]);

  return <RouterProvider router={router} />;
}

export default App;
