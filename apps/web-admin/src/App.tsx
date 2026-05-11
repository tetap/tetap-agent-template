import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router';
import { useAdminSessionStore, useAdminI18n } from '@tetap/hooks';
import { AdminShell } from './layout/admin-shell.js';
import { ForgotPasswordPage } from './pages/auth/forgot-password.js';
import { OtpPage } from './pages/auth/otp.js';
import { SignInPage } from './pages/auth/sign-in.js';
import { SignUpPage } from './pages/auth/sign-up.js';
import { AdminDashboardPage } from './pages/dashboard.js';
import { AdminIamPage } from './pages/iam.js';
import { AdminPlaceholderPage } from './pages/placeholder.js';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = useAdminSessionStore(state => state.auth.isAuthenticated());

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);

    return <Navigate replace to={`/sign-in?redirect=${redirect}`} />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <AdminShell />
      </ProtectedRoute>
    ),
    path: '/',
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'users',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.users.description"
            titleKey="webAdmin.placeholder.users.title"
          />
        ),
      },
      {
        path: 'security',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.security.description"
            titleKey="webAdmin.placeholder.security.title"
          />
        ),
      },
      {
        path: 'security/iam',
        element: <AdminIamPage />,
      },
      {
        path: 'security/audit',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.audit.description"
            titleKey="webAdmin.placeholder.audit.title"
          />
        ),
      },
      {
        path: 'security/roles',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.roles.description"
            titleKey="webAdmin.placeholder.roles.title"
          />
        ),
      },
      {
        path: 'security/sessions',
        element: <AdminIamPage />,
      },
      {
        path: 'settings',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.settings.description"
            titleKey="webAdmin.placeholder.settings.title"
          />
        ),
      },
      {
        path: 'settings/account',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.account.description"
            titleKey="webAdmin.placeholder.account.title"
          />
        ),
      },
      {
        path: 'settings/billing',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.billing.description"
            titleKey="webAdmin.placeholder.billing.title"
          />
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <AdminPlaceholderPage
            descriptionKey="webAdmin.placeholder.notifications.description"
            titleKey="webAdmin.placeholder.notifications.title"
          />
        ),
      },
    ],
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/otp',
    element: <OtpPage />,
  },
]);

function App() {
  const { locale, t } = useAdminI18n();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('webAdmin.title');
  }, [locale, t]);

  return <RouterProvider router={router} />;
}

export default App;
