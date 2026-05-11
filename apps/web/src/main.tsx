import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicI18nProvider } from '@tetap/i18n/public';
import '@tetap/ui/styles.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error();
}

createRoot(rootElement).render(
  <StrictMode>
    <PublicI18nProvider initialLocale={navigator.language}>
      <App />
    </PublicI18nProvider>
  </StrictMode>,
);
