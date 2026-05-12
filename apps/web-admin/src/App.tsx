import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router';
import { useAdminSessionStore, useAdminI18n, useAdminThemeEffect } from '@tetap/hooks';
import { ErrorBoundary } from '@tetap/ui';
import { fetchAdminBootstrap } from './api/backend-admin.js';
import { AdminShell } from './layout/admin-shell.js';
import { OtpPage } from './pages/auth/otp.js';
import { SignInPage } from './pages/auth/sign-in.js';
import { toSessionMenus } from './pages/auth/auth-session.js';
import { AdminDashboardPage } from './pages/dashboard.js';
import {
  AdminFieldPermissionsPage,
  AdminMenusPage,
  AdminOperationLogsPage,
  AdminPermissionsPage,
  AdminPoliciesPage,
  AdminRolesPage,
  AdminSessionsPage,
  AdminUsersPage,
} from './pages/iam.js';
import { AdminStatePage } from './pages/state-page.js';
import { AdminErrorBoundaryFallback } from './pages/error-boundary-fallback.js';

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
        element: <Navigate replace to="/system/user" />,
      },
      {
        path: 'system',
        element: <Navigate replace to="/system/user" />,
      },
      {
        path: 'system/users',
        element: <Navigate replace to="/system/user" />,
      },
      {
        path: 'system/user',
        element: (
          <PermissionRoute permission="user:read">
            <AdminUsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/roles',
        element: <Navigate replace to="/system/role" />,
      },
      {
        path: 'system/role',
        element: (
          <PermissionRoute permission="role:read">
            <AdminRolesPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/permissions',
        element: <Navigate replace to="/system/permission" />,
      },
      {
        path: 'system/permission',
        element: (
          <PermissionRoute permission="iam:read">
            <AdminPermissionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/menus',
        element: <Navigate replace to="/system/menu" />,
      },
      {
        path: 'system/menu',
        element: (
          <PermissionRoute permission="menu:read">
            <AdminMenusPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/sessions',
        element: <Navigate replace to="/system/session" />,
      },
      {
        path: 'system/session',
        element: (
          <PermissionRoute permission="session:read">
            <AdminSessionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/fields',
        element: <Navigate replace to="/system/field" />,
      },
      {
        path: 'system/field',
        element: (
          <PermissionRoute permission="field:read">
            <AdminFieldPermissionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/policies',
        element: <Navigate replace to="/system/policy" />,
      },
      {
        path: 'system/policy',
        element: (
          <PermissionRoute permission="policy:read">
            <AdminPoliciesPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'system/operation-logs',
        element: <Navigate replace to="/system/operation-log" />,
      },
      {
        path: 'system/operation-log',
        element: (
          <PermissionRoute permission="operation-log:read">
            <AdminOperationLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'security',
        element: <Navigate replace to="/system/session" />,
      },
      {
        path: 'security/iam',
        element: <Navigate replace to="/system/permission" />,
      },
      {
        path: 'security/operation-logs',
        element: <Navigate replace to="/system/operation-log" />,
      },
      {
        path: 'security/roles',
        element: <Navigate replace to="/system/role" />,
      },
      {
        path: 'security/sessions',
        element: <Navigate replace to="/system/session" />,
      },
      {
        path: 'security/permissions',
        element: <Navigate replace to="/system/permission" />,
      },
      {
        path: 'security/fields',
        element: <Navigate replace to="/system/field" />,
      },
      {
        path: 'security/menus',
        element: <Navigate replace to="/system/menu" />,
      },
      {
        path: 'security/policies',
        element: <Navigate replace to="/system/policy" />,
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
    element: <Navigate replace to="/sign-in" />,
  },
  {
    path: '/forgot-password',
    element: <Navigate replace to="/sign-in" />,
  },
  {
    path: '/otp',
    element: <OtpPage />,
  },
]);

function App() {
  const { locale, t } = useAdminI18n();

  useAdminThemeEffect();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('webAdmin.title');
  }, [locale, t]);

  return (
    <ErrorBoundary fallback={<AdminErrorBoundaryFallback />}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
