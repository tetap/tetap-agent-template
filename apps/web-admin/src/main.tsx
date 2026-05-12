import { createRoot } from 'react-dom/client';
import { AdminI18nProvider } from '@tetap/i18n/admin';
import { Toaster } from '@tetap/ui';
import '@tetap/ui/styles.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error();
}

createRoot(rootElement).render(
  <AdminI18nProvider initialLocale={navigator.language}>
    <App />
    <Toaster richColors />
  </AdminI18nProvider>,
);
