import { createBrowserRouter, Navigate } from 'react-router';
import {
  AdminDashboardPage,
  AdminFieldPermissionsPage,
  AdminMenusPage,
  AdminOperationLogsPage,
  AdminPermissionsPage,
  AdminPoliciesPage,
  AdminRolesPage,
  AdminSessionsPage,
  AdminShell,
  AdminStatePage,
  AdminUsersPage,
  OtpPage,
  SignInPage,
} from './lazy-pages.js';
import { withRouteFallback } from './route-fallback.js';
import { PermissionRoute, ProtectedRoute } from './route-guards.js';

export const adminRouter = createBrowserRouter([
  {
    element: <ProtectedRoute>{withRouteFallback(<AdminShell />)}</ProtectedRoute>,
    path: '/',
    children: [
      {
        index: true,
        element: withRouteFallback(<AdminDashboardPage />),
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
        element: <PermissionRoute permission="user:read">{withRouteFallback(<AdminUsersPage />)}</PermissionRoute>,
      },
      {
        path: 'system/roles',
        element: <Navigate replace to="/system/role" />,
      },
      {
        path: 'system/role',
        element: <PermissionRoute permission="role:read">{withRouteFallback(<AdminRolesPage />)}</PermissionRoute>,
      },
      {
        path: 'system/permissions',
        element: <Navigate replace to="/system/permission" />,
      },
      {
        path: 'system/permission',
        element: <PermissionRoute permission="iam:read">{withRouteFallback(<AdminPermissionsPage />)}</PermissionRoute>,
      },
      {
        path: 'system/menus',
        element: <Navigate replace to="/system/menu" />,
      },
      {
        path: 'system/menu',
        element: <PermissionRoute permission="menu:read">{withRouteFallback(<AdminMenusPage />)}</PermissionRoute>,
      },
      {
        path: 'system/sessions',
        element: <Navigate replace to="/system/session" />,
      },
      {
        path: 'system/session',
        element: (
          <PermissionRoute permission="session:read">{withRouteFallback(<AdminSessionsPage />)}</PermissionRoute>
        ),
      },
      {
        path: 'system/fields',
        element: <Navigate replace to="/system/field" />,
      },
      {
        path: 'system/field',
        element: (
          <PermissionRoute permission="field:read">{withRouteFallback(<AdminFieldPermissionsPage />)}</PermissionRoute>
        ),
      },
      {
        path: 'system/policies',
        element: <Navigate replace to="/system/policy" />,
      },
      {
        path: 'system/policy',
        element: <PermissionRoute permission="policy:read">{withRouteFallback(<AdminPoliciesPage />)}</PermissionRoute>,
      },
      {
        path: 'system/operation-logs',
        element: <Navigate replace to="/system/operation-log" />,
      },
      {
        path: 'system/operation-log',
        element: (
          <PermissionRoute permission="operation-log:read">
            {withRouteFallback(<AdminOperationLogsPage />)}
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
        element: withRouteFallback(
          <AdminStatePage
            descriptionKey="webAdmin.statePages.unauthorized.description"
            titleKey="webAdmin.statePages.unauthorized.title"
          />,
        ),
      },
      {
        path: 'errors/forbidden',
        element: withRouteFallback(
          <AdminStatePage
            descriptionKey="webAdmin.statePages.forbidden.description"
            titleKey="webAdmin.statePages.forbidden.title"
          />,
        ),
      },
      {
        path: 'errors/not-found',
        element: withRouteFallback(
          <AdminStatePage
            descriptionKey="webAdmin.statePages.notFound.description"
            titleKey="webAdmin.statePages.notFound.title"
          />,
        ),
      },
      {
        path: 'errors/internal-server-error',
        element: withRouteFallback(
          <AdminStatePage
            descriptionKey="webAdmin.statePages.internalError.description"
            titleKey="webAdmin.statePages.internalError.title"
          />,
        ),
      },
      {
        path: '*',
        element: withRouteFallback(
          <AdminStatePage
            descriptionKey="webAdmin.statePages.notFound.description"
            titleKey="webAdmin.statePages.notFound.title"
          />,
        ),
      },
    ],
  },
  {
    path: '/sign-in',
    element: withRouteFallback(<SignInPage />),
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
    element: withRouteFallback(<OtpPage />),
  },
]);
