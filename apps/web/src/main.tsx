import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicI18nProvider } from '@tetap/i18n/public';
import '@tetap/ui/styles.css';
import App from './App.tsx';
import { createWebRouter } from './router.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error();
}

const router = createWebRouter();

createRoot(rootElement).render(
  <StrictMode>
    <PublicI18nProvider initialLocale={navigator.language}>
      <App router={router} />
    </PublicI18nProvider>
  </StrictMode>,
);
