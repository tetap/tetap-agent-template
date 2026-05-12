import { useAdminSessionStore } from '@tetap/hooks';
import { AdminI18nProvider, createAdminI18n } from '@tetap/i18n/admin';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { AdminShell } from '../../../../apps/web-admin/src/layout/admin-shell.tsx';
import { SignInPage } from '../../../../apps/web-admin/src/pages/auth/sign-in.tsx';
import { AdminDashboardPage } from '../../../../apps/web-admin/src/pages/dashboard.tsx';
import {
  AdminFieldPermissionsPage,
  AdminOperationLogsPage,
  AdminPoliciesPage,
  AdminRolesPage,
  AdminUsersPage,
} from '../../../../apps/web-admin/src/pages/iam.tsx';

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
      {
        id: 'sessions',
        name: 'Online Users',
        path: '/system/session',
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

const createUsersResponse = () => ({
  code: 0,
  message: 'ok',
  data: [
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
});

const createRolesResponse = () => ({
  code: 0,
  message: 'ok',
  data: [
    {
      id: '1',
      name: 'Super Admin',
      code: 'super-admin',
      description: 'Full access',
      permissionCodes: ['iam:read'],
      dataScope: { type: 'ALL' },
    },
  ],
});

const createPermissionsResponse = () => ({
  code: 0,
  message: 'ok',
  data: [
    {
      id: '1',
      code: 'iam:read',
      name: 'Read IAM',
      type: 'API',
      resource: 'iam',
      action: 'read',
    },
  ],
});

const createFieldPermissionsResponse = () => ({
  code: 0,
  message: 'ok',
  data: [
    {
      id: 'field-1',
      roleCode: 'super-admin',
      resource: 'user',
      fieldName: 'email',
      permissionType: 'MASK',
    },
  ],
});

const createPoliciesResponse = () => ({
  code: 0,
  message: 'ok',
  data: [
    {
      id: 'policy-1',
      resource: 'session',
      action: 'revoke',
      effect: 'ALLOW',
      conditions: {
        any: [{ source: 'user', path: 'isSuperAdmin', operator: 'eq', value: true }],
      },
    },
  ],
});

const createOperationLogsResponse = () => ({
  code: 0,
  message: 'ok',
  data: {
    items: [],
    page: 1,
    pageSize: 5,
    search: '',
    sort: 'desc',
    total: 0,
    totalPages: 1,
  },
});

const createOverviewResponse = () => ({
  code: 0,
  message: 'ok',
  data: {
    metrics: {
      users: 1,
      roles: 1,
      permissions: 1,
      menus: testMenus.length,
      fieldPermissions: 0,
      policies: 0,
      sessions: 0,
      operationLogs: 0,
    },
  },
});

const createAdminApiResponse = (input: RequestInfo | URL) => {
  const url = String(input);

  if (url.includes('/auth/login')) {
    return createLoginResponse();
  }

  if (url.includes('/iam/overview')) {
    return createOverviewResponse();
  }

  if (url.includes('/iam/operation-logs')) {
    return createOperationLogsResponse();
  }

  if (url.includes('/iam/field-permissions')) {
    return createFieldPermissionsResponse();
  }

  if (url.includes('/iam/policies')) {
    return createPoliciesResponse();
  }

  if (url.includes('/iam/users')) {
    return createUsersResponse();
  }

  if (url.includes('/iam/roles')) {
    return createRolesResponse();
  }

  if (url.includes('/iam/permissions')) {
    return createPermissionsResponse();
  }

  return createLoginResponse();
};

const renderAdminShell = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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
    vi.fn(async (input: RequestInfo | URL) => {
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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
    vi.fn(async (input: RequestInfo | URL) => {
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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

const renderOperationLogsPage = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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
          element: <AdminOperationLogsPage />,
        },
      ],
    },
  ]);

  return renderWithI18n(router);
};

const renderFieldPermissionsPage = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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
          element: <AdminFieldPermissionsPage />,
        },
      ],
    },
  ]);

  return renderWithI18n(router);
};

const renderPoliciesPage = async () => {
  seedAdminSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      return new Response(JSON.stringify(createAdminApiResponse(input)), {
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
          element: <AdminPoliciesPage />,
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

  it('uses an input group and explicit submit button for operation log search', async () => {
    const screen = await renderOperationLogsPage();

    await expect
      .poll(() => screen.getByRole('heading', { name: i18n.t('webAdmin.iam.pages.operationLogs.title') }).query())
      .not.toBeNull();

    await screen.getByLabelText(i18n.t('webAdmin.iam.operationLogs.search')).fill('admin login');
    expect(vi.mocked(fetch).mock.calls.some(([input]) => String(input).includes('search=admin+login'))).toBe(false);

    await screen.getByRole('button', { name: i18n.t('webAdmin.iam.operationLogs.search') }).click();

    await expect
      .poll(() => vi.mocked(fetch).mock.calls.some(([input]) => String(input).includes('search=admin+login')))
      .toBe(true);
  });

  it('renders field permissions as a headed management table', async () => {
    const screen = await renderFieldPermissionsPage();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.iam.fields.roleCode')).query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.iam.fields.permissionType')).query()).not.toBeNull();
  });

  it('renders policies as a headed management table', async () => {
    const screen = await renderPoliciesPage();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.iam.fields.effect')).query()).not.toBeNull();
    expect(screen.getByText(i18n.t('webAdmin.iam.fields.conditions')).query()).not.toBeNull();
  });
});
