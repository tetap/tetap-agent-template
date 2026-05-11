import { useAdminSessionStore } from '@tetap/hooks';
import { AdminI18nProvider, createAdminI18n } from '@tetap/i18n/admin';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { AdminShell } from '../../../../apps/web-admin/src/layout/admin-shell.tsx';
import { SignInPage } from '../../../../apps/web-admin/src/pages/auth/sign-in.tsx';
import { AdminDashboardPage } from '../../../../apps/web-admin/src/pages/dashboard.tsx';
import { AdminRolesPage, AdminUsersPage } from '../../../../apps/web-admin/src/pages/iam.tsx';

const i18n = createAdminI18n({ locale: 'en-US' });
const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
const testMenus = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/',
    component: 'AdminDashboardPage',
    icon: 'LayoutDashboard',
    permissionCodes: [],
    order: 1,
    children: [],
  },
  {
    id: 'system',
    name: 'System Management',
    path: '/system',
    component: 'AdminSystemRedirectPage',
    icon: 'Settings',
    permissionCodes: [],
    order: 10,
    children: [
      {
        id: 'users',
        name: 'Users',
        path: '/system/user',
        component: 'AdminUsersPage',
        icon: 'Users',
        permissionCodes: ['user:read'],
        order: 11,
        children: [],
      },
      {
        id: 'roles',
        name: 'Roles',
        path: '/system/role',
        component: 'AdminRolesPage',
        icon: 'UserCog',
        permissionCodes: ['role:read'],
        order: 12,
        children: [],
      },
    ],
  },
  {
    id: 'security',
    name: 'Security Center',
    path: '/security',
    component: 'AdminSecurityRedirectPage',
    icon: 'ShieldCheck',
    permissionCodes: [],
    order: 20,
    children: [
      {
        id: 'sessions',
        name: 'Online Users',
        path: '/security/sessions',
        component: 'AdminSessionsPage',
        icon: 'MonitorCog',
        permissionCodes: ['session:read'],
        order: 24,
        children: [],
      },
    ],
  },
] as const;
const testCapabilities = [
  'iam:read',
  'iam:manage',
  'operation-log:read',
  'field:read',
  'menu:read',
  'user:read',
  'user:update',
  'role:read',
  'role:update',
  'session:read',
  'session:revoke',
  'policy:read',
  'policy:update',
] as const;

const renderWithI18n = (router: ReturnType<typeof createMemoryRouter>) =>
  render(
    <AdminI18nProvider initialLocale="en-US">
      <RouterProvider router={router} />
    </AdminI18nProvider>,
  );

const seedAdminSession = () => {
  const auth = useAdminSessionStore.getState().auth;

  auth.setContext({
    accessToken: 'browser-test-token',
    capabilities: testCapabilities,
    menus: testMenus,
    user: {
      accountNo: 'browser-test-admin',
      email: 'admin@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      name: 'Admin',
      roles: ['admin'],
    },
  });
};

const createLoginResponse = () => ({
  code: 0,
  message: 'ok',
  data: {
    accessToken: 'browser-test-token',
    refreshToken: 'browser-refresh-token',
    accessTokenExpiresAt: expiresAt,
    refreshTokenExpiresAt: expiresAt,
    tokenId: 'browser-token-id',
    capabilities: testCapabilities,
    menus: testMenus,
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@tetap.local',
      status: 'ACTIVE',
      deptId: '100',
      tenantId: 'tenant-default',
      isSuperAdmin: true,
      roleCodes: ['super-admin'],
      tokenVersion: 1,
    },
  },
});

const createOverviewResponse = () => ({
  code: 0,
  message: 'ok',
  data: {
    users: [
      {
        id: '1',
        username: 'admin',
        email: 'admin@tetap.local',
        status: 'ACTIVE',
        deptId: '100',
        tenantId: 'tenant-default',
        isSuperAdmin: true,
        roleCodes: ['super-admin'],
        tokenVersion: 1,
      },
    ],
    roles: [
      {
        id: '1',
        name: 'Super Admin',
        code: 'super-admin',
        description: 'Full access',
        permissionCodes: ['iam:read'],
        dataScope: { type: 'ALL' },
      },
    ],
    permissions: [
      {
        id: '1',
        code: 'iam:read',
        name: 'Read IAM',
        type: 'API',
        resource: 'iam',
        action: 'read',
      },
    ],
    menus: testMenus,
    fieldPermissions: [],
    policies: [],
    sessions: [],
    operationLogs: [],
  },
});

const renderAdminShell = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      return new Response(JSON.stringify(createOverviewResponse()), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    }),
  );

  const router = createMemoryRouter([
    {
      path: '/',
      element: <AdminShell />,
      children: [
        {
          index: true,
          element: <AdminDashboardPage />,
        },
      ],
    },
  ]);

  return renderWithI18n(router);
};

const renderSignIn = async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes('/iam/overview') ? createOverviewResponse() : createLoginResponse();

      return new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    }),
  );

  const router = createMemoryRouter(
    [
      {
        path: '/sign-in',
        element: <SignInPage />,
      },
      {
        path: '/',
        element: <AdminShell />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
        ],
      },
    ],
    {
      initialEntries: ['/sign-in'],
    },
  );

  return renderWithI18n(router);
};

const renderIamPage = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      return new Response(JSON.stringify(createOverviewResponse()), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    }),
  );

  const router = createMemoryRouter([
    {
      path: '/',
      element: <AdminShell />,
      children: [
        {
          index: true,
          element: <AdminUsersPage />,
        },
      ],
    },
  ]);

  return renderWithI18n(router);
};

const renderRolePage = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      return new Response(JSON.stringify(createOverviewResponse()), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    }),
  );

  const router = createMemoryRouter([
    {
      path: '/',
      element: <AdminShell />,
      children: [
        {
          index: true,
          element: <AdminRolesPage />,
        },
      ],
    },
  ]);

  return renderWithI18n(router);
};

describe('admin web dashboard browser behavior', () => {
  beforeEach(() => {
    useAdminSessionStore.getState().auth.reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the cleaned admin shell and backend-driven menu', async () => {
    const screen = await renderAdminShell();

    expect(screen.getByText(i18n.t('webAdmin.dashboard.title')).query()).not.toBeNull();
    expect(useAdminSessionStore.getState().auth.menus.some(menu => menu.id === 'system')).toBe(true);
    expect(screen.getByRole('button', { name: i18n.t('webAdmin.dashboard.actions.refresh') }).query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.layout.search.trigger')).query()).not.toBeNull();
  });

  it('submits the sign-in form and stores the admin session with zustand', async () => {
    const screen = await renderSignIn();

    await screen.getByLabelText(i18n.t('webAdmin.auth.fields.email')).fill('admin@example.com');
    await screen.getByRole('textbox', { name: i18n.t('webAdmin.auth.fields.password') }).fill('password1');
    expect(screen.getByText('Or continue with').query()).toBeNull();
    expect(screen.getByText('GitHub').query()).toBeNull();
    expect(screen.getByText('Facebook').query()).toBeNull();
    expect(screen.getByText('Forgot password?').query()).toBeNull();
    expect(screen.getByText('Sign up').query()).toBeNull();
    expect(screen.getByText('Terms of Service').query()).toBeNull();
    expect(screen.getByText('Privacy Policy').query()).toBeNull();
    await screen.getByRole('button', { name: i18n.t('webAdmin.auth.actions.signIn') }).click();

    await expect.poll(() => useAdminSessionStore.getState().auth.accessToken).not.toBe('');
    await expect.poll(() => screen.getByText(i18n.t('webAdmin.dashboard.title')).query()).not.toBeNull();
  });

  it('loads the user management page through the backend-admin API client', async () => {
    const screen = await renderIamPage();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.iam.pages.users.title')).query()).not.toBeNull();
    await expect.poll(() => screen.getByText('admin@tetap.local').query()).not.toBeNull();
    expect(screen.getByRole('cell', { name: i18n.t('webAdmin.iam.fields.username') }).query()).not.toBeNull();
    expect(screen.getByRole('tab').query()).toBeNull();
    expect(fetch).toHaveBeenCalled();
  });

  it('renders a RuoYi-style role management workflow backed by IAM data', async () => {
    const screen = await renderRolePage();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.iam.pages.roles.title')).query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.iam.roleManager.filters.title')).query()).not.toBeNull();
    expect(screen.getByRole('button', { name: i18n.t('webAdmin.iam.roleManager.actions.add') }).query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.iam.roleManager.columns.index')).query()).not.toBeNull();
    expect(screen.getByText('super-admin').query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.iam.roleManager.actions.permissions')).query()).not.toBeNull();
  });
});
