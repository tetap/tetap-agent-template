import { lazy } from 'react';

export const AdminShell = lazy(() =>
  import('../layout/admin-shell.js').then(module => ({ default: module.AdminShell })),
);
export const OtpPage = lazy(() => import('../pages/auth/otp.js').then(module => ({ default: module.OtpPage })));
export const SignInPage = lazy(() =>
  import('../pages/auth/sign-in.js').then(module => ({ default: module.SignInPage })),
);
export const AdminDashboardPage = lazy(() =>
  import('../pages/dashboard.js').then(module => ({ default: module.AdminDashboardPage })),
);
export const AdminStatePage = lazy(() =>
  import('../pages/state-page.js').then(module => ({ default: module.AdminStatePage })),
);

const loadIamPages = () => import('../pages/iam.js');

export const AdminUsersPage = lazy(() => loadIamPages().then(module => ({ default: module.AdminUsersPage })));
export const AdminRolesPage = lazy(() => loadIamPages().then(module => ({ default: module.AdminRolesPage })));
export const AdminPermissionsPage = lazy(() =>
  loadIamPages().then(module => ({ default: module.AdminPermissionsPage })),
);
export const AdminMenusPage = lazy(() => loadIamPages().then(module => ({ default: module.AdminMenusPage })));
export const AdminSessionsPage = lazy(() => loadIamPages().then(module => ({ default: module.AdminSessionsPage })));
export const AdminFieldPermissionsPage = lazy(() =>
  loadIamPages().then(module => ({ default: module.AdminFieldPermissionsPage })),
);
export const AdminPoliciesPage = lazy(() => loadIamPages().then(module => ({ default: module.AdminPoliciesPage })));
export const AdminOperationLogsPage = lazy(() =>
  loadIamPages().then(module => ({ default: module.AdminOperationLogsPage })),
);
