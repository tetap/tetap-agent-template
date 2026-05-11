import { useAdminSessionStore } from '@tetap/hooks';
import { AdminI18nProvider, createAdminI18n } from '@tetap/i18n/admin';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { AdminShell } from '../../../../apps/web-admin/src/layout/admin-shell.tsx';
import { SignInPage } from '../../../../apps/web-admin/src/pages/auth/sign-in.tsx';
import { AdminDashboardPage } from '../../../../apps/web-admin/src/pages/dashboard.tsx';
import { AdminIamPage } from '../../../../apps/web-admin/src/pages/iam.tsx';

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
    id: 'iam',
    name: 'IAM',
    path: '/security/iam',
    component: 'AdminIamPage',
    icon: 'ShieldCheck',
    permissionCodes: ['iam:read'],
    order: 20,
    children: [
      {
        id: 'roles',
        name: 'Roles',
        path: '/security/roles',
        component: 'AdminRolesPage',
        icon: 'UserCog',
        permissionCodes: ['role:read'],
        order: 22,
        children: [],
      },
    ],
  },
] as const;
const testCapabilities = [
  'iam:read',
  'iam:manage',
  'audit:read',
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
    auditLogs: [],
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
          element: <AdminIamPage />,
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

  it('renders the shadcn-admin adapted shell and switches dashboard tabs', async () => {
    const screen = await renderAdminShell();

    expect(screen.getByText(i18n.t('webAdmin.dashboard.title')).query()).not.toBeNull();
    expect(screen.getByRole('link', { name: i18n.t('webAdmin.dashboard.topNav.overview') }).query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.layout.search.trigger')).query()).not.toBeNull();

    await screen.getByRole('tab', { name: i18n.t('webAdmin.dashboard.tabs.analytics') }).click();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.dashboard.users.title')).query()).not.toBeNull();
  });

  it('submits the sign-in form and stores the admin session with zustand', async () => {
    const screen = await renderSignIn();

    await screen.getByLabelText(i18n.t('webAdmin.auth.fields.email')).fill('admin@example.com');
    await screen.getByRole('textbox', { name: i18n.t('webAdmin.auth.fields.password') }).fill('password1');
    await screen.getByRole('button', { name: i18n.t('webAdmin.auth.actions.signIn') }).click();

    await expect.poll(() => useAdminSessionStore.getState().auth.accessToken).not.toBe('');
    await expect.poll(() => screen.getByText(i18n.t('webAdmin.dashboard.title')).query()).not.toBeNull();
  });

  it('loads IAM overview data through the backend-admin API client', async () => {
    const screen = await renderIamPage();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.iam.title')).query()).not.toBeNull();
    await expect.poll(() => screen.getByText('admin@tetap.local').query()).not.toBeNull();
    expect(screen.getByRole('tab', { exact: true, name: i18n.t('webAdmin.iam.tabs.users') }).query()).not.toBeNull();
    expect(
      screen.getByRole('tab', { exact: true, name: i18n.t('webAdmin.iam.tabs.permissions') }).query(),
    ).not.toBeNull();
    expect(fetch).toHaveBeenCalled();
  });
});
