import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { usePublicI18n } from '@tetap/hooks';
import { HomePage } from './pages/home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);

function App() {
  const { locale, t } = usePublicI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('app.title');
  }, [locale, t]);

  return <RouterProvider router={router} />;
}

export default App;
