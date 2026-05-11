import { useAdminSessionStore } from '@tetap/hooks';
import { AdminI18nProvider, createAdminI18n } from '@tetap/i18n/admin';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { AdminShell } from '../../../../apps/web-admin/src/layout/admin-shell.tsx';
import { SignInPage } from '../../../../apps/web-admin/src/pages/auth/sign-in.tsx';
import { AdminDashboardPage } from '../../../../apps/web-admin/src/pages/dashboard.tsx';
import { AdminIamPage } from '../../../../apps/web-admin/src/pages/iam.tsx';
import { AdminPlaceholderPage } from '../../../../apps/web-admin/src/pages/placeholder.tsx';

const i18n = createAdminI18n({ locale: 'en-US' });

const renderWithI18n = (router: ReturnType<typeof createMemoryRouter>) =>
  render(
    <AdminI18nProvider initialLocale="en-US">
      <RouterProvider router={router} />
    </AdminI18nProvider>,
  );

const seedAdminSession = () => {
  const auth = useAdminSessionStore.getState().auth;

  auth.setAccessToken('browser-test-token');
  auth.setUser({
    accountNo: 'browser-test-admin',
    email: 'admin@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
    name: 'Admin',
    roles: ['admin'],
  });
};

const renderAdminShell = async () => {
  seedAdminSession();

  const router = createMemoryRouter([
    {
      path: '/',
      element: <AdminShell />,
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
      ],
    },
  ]);

  return renderWithI18n(router);
};

const renderSignIn = async () => {
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
      const body = {
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
          menus: [],
          fieldPermissions: [],
          policies: [],
          sessions: [],
          auditLogs: [],
        },
      };

      return new Response(JSON.stringify(body), {
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
    expect(screen.getByRole('link', { name: i18n.t('webAdmin.navigation.users') }).query()).not.toBeNull();
    expect(screen.getByRole('button', { name: i18n.t('webAdmin.layout.search.trigger') }).query()).not.toBeNull();

    await screen.getByRole('tab', { name: i18n.t('webAdmin.dashboard.tabs.security') }).click();

    await expect.poll(() => screen.getByText(i18n.t('webAdmin.dashboard.activity.title')).query()).not.toBeNull();
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
    expect(screen.getByRole('tab', { name: i18n.t('webAdmin.iam.tabs.permissions') }).query()).not.toBeNull();
    expect(fetch).toHaveBeenCalled();
  });
});
