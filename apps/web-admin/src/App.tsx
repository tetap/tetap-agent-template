import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router';
import { useAdminSessionStore, useAdminI18n } from '@tetap/hooks';
import { fetchAdminBootstrap } from './api/backend-admin.js';
import { AdminShell } from './layout/admin-shell.js';
import { ForgotPasswordPage } from './pages/auth/forgot-password.js';
import { OtpPage } from './pages/auth/otp.js';
import { SignInPage } from './pages/auth/sign-in.js';
import { SignUpPage } from './pages/auth/sign-up.js';
import { toSessionMenus } from './pages/auth/auth-session.js';
import { AdminDashboardPage } from './pages/dashboard.js';
import { AdminIamPage } from './pages/iam.js';
import { AdminStatePage } from './pages/state-page.js';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = useAdminSessionStore(state => state.auth.isAuthenticated());
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const currentUser = useAdminSessionStore(state => state.auth.user);
  const reset = useAdminSessionStore(state => state.auth.reset);
  const setContext = useAdminSessionStore(state => state.auth.setContext);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive = true;

    const refreshSessionContext = async () => {
      try {
        const bootstrap = await fetchAdminBootstrap(accessToken);

        if (!isActive) {
          return;
        }

        setContext({
          user: {
            accountNo: bootstrap.user.id,
            email: bootstrap.user.email,
            exp: currentUser?.exp ?? Math.floor(Date.now() / 1000) + 60 * 60,
            name: bootstrap.user.username,
            roles: bootstrap.user.roleCodes,
          },
          capabilities: bootstrap.capabilities,
          menus: toSessionMenus(bootstrap.menus),
        });
      } catch {
        if (isActive) {
          reset();
        }
      }
    };

    void refreshSessionContext();

    return () => {
      isActive = false;
    };
  }, [accessToken, currentUser?.exp, reset, setContext]);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);

    return <Navigate replace to={`/sign-in?redirect=${redirect}`} />;
  }

  return children;
};

const PermissionRoute = ({ children, permission }: { children: ReactNode; permission: string }) => {
  const can = useAdminSessionStore(state => state.auth.can);

  if (!can(permission)) {
    return <Navigate replace to="/errors/forbidden" />;
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
          <PermissionRoute permission="user:read">
            <AdminIamPage defaultTab="users" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security',
        element: <Navigate replace to="/security/iam" />,
      },
      {
        path: 'security/iam',
        element: (
          <PermissionRoute permission="iam:read">
            <AdminIamPage defaultTab="overview" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/audit',
        element: (
          <PermissionRoute permission="audit:read">
            <AdminIamPage defaultTab="audit" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/roles',
        element: (
          <PermissionRoute permission="role:read">
            <AdminIamPage defaultTab="roles" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/sessions',
        element: (
          <PermissionRoute permission="session:read">
            <AdminIamPage defaultTab="sessions" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/permissions',
        element: (
          <PermissionRoute permission="iam:read">
            <AdminIamPage defaultTab="permissions" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/fields',
        element: (
          <PermissionRoute permission="field:read">
            <AdminIamPage defaultTab="fields" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/menus',
        element: (
          <PermissionRoute permission="menu:read">
            <AdminIamPage defaultTab="menus" />
          </PermissionRoute>
        ),
      },
      {
        path: 'security/policies',
        element: (
          <PermissionRoute permission="policy:read">
            <AdminIamPage defaultTab="policies" />
          </PermissionRoute>
        ),
      },
      {
        path: 'errors/unauthorized',
        element: (
          <AdminStatePage
            descriptionKey="webAdmin.statePages.unauthorized.description"
            titleKey="webAdmin.statePages.unauthorized.title"
          />
        ),
      },
      {
        path: 'errors/forbidden',
        element: (
          <AdminStatePage
            descriptionKey="webAdmin.statePages.forbidden.description"
            titleKey="webAdmin.statePages.forbidden.title"
          />
        ),
      },
      {
        path: 'errors/not-found',
        element: (
          <AdminStatePage
            descriptionKey="webAdmin.statePages.notFound.description"
            titleKey="webAdmin.statePages.notFound.title"
          />
        ),
      },
      {
        path: 'errors/internal-server-error',
        element: (
          <AdminStatePage
            descriptionKey="webAdmin.statePages.internalError.description"
            titleKey="webAdmin.statePages.internalError.title"
          />
        ),
      },
      {
        path: '*',
        element: (
          <AdminStatePage
            descriptionKey="webAdmin.statePages.notFound.description"
            titleKey="webAdmin.statePages.notFound.title"
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
