import { chromium, type Page } from 'playwright';

type AuditPage = {
  label: string;
  path: string;
};

const baseUrl = process.env.ADMIN_AUDIT_BASE_URL ?? 'http://127.0.0.1:5174';
const backendUrl = process.env.ADMIN_AUDIT_BACKEND_URL ?? 'http://127.0.0.1:3001';
const username = process.env.ADMIN_AUDIT_USERNAME ?? 'admin@tetap.local';
const password = process.env.ADMIN_AUDIT_PASSWORD ?? process.env.IAM_BOOTSTRAP_ADMIN_PASSWORD;

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'tablet', width: 1024, height: 768 },
  { label: 'mobile', width: 390, height: 844 },
] as const;

const auditPages: AuditPage[] = [
  { label: 'dashboard', path: '/' },
  { label: 'users', path: '/system/user' },
  { label: 'roles', path: '/system/role' },
  { label: 'permissions', path: '/system/permission' },
  { label: 'menus', path: '/system/menu' },
  { label: 'field permissions', path: '/system/field' },
  { label: 'policies', path: '/system/policy' },
  { label: 'online users', path: '/system/session' },
  { label: 'operation logs', path: '/system/operation-log' },
  { label: 'not found', path: '/errors/not-found' },
  { label: 'internal server error', path: '/errors/internal-server-error' },
];

const waitForAdminPage = async (page: Page) => {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('body').waitFor({ state: 'visible' });
};

const fetchAdminSession = async () => {
  const response = await fetch(`${backendUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      deviceType: 'WEB',
      rememberMe: false,
    }),
  });
  const body = (await response.json()) as {
    code?: number;
    data?: {
      accessToken: string;
      accessTokenExpiresAt: string;
      capabilities: string[];
      menus: unknown[];
      user: {
        id: string;
        email: string;
        isSuperAdmin: boolean;
        roleCodes: string[];
        username: string;
      };
    };
    message?: string;
  };

  if (!response.ok || body.code !== 0 || !body.data) {
    throw new Error(`Admin audit login failed: ${body.message ?? response.statusText}`);
  }

  return {
    accessToken: body.data.accessToken,
    capabilities: body.data.capabilities,
    menus: body.data.menus,
    user: {
      accountNo: body.data.user.id,
      email: body.data.user.email,
      exp: Math.floor(new Date(body.data.accessTokenExpiresAt).getTime() / 1000),
      isSuperAdmin: body.data.user.isSuperAdmin,
      name: body.data.user.username,
      roles: body.data.user.roleCodes,
    },
  };
};

const signIn = async (page: Page) => {
  const session = await fetchAdminSession();

  await page.goto(`${baseUrl}/sign-in`);
  await waitForAdminPage(page);
  await page.evaluate(
    auth => {
      window.localStorage.setItem('tetap.admin.accessToken', auth.accessToken);
      window.localStorage.setItem('tetap.admin.user', JSON.stringify(auth.user));
      window.localStorage.setItem('tetap.admin.capabilities', JSON.stringify(auth.capabilities));
      window.localStorage.setItem('tetap.admin.menus', JSON.stringify(auth.menus));
    },
    {
      accessToken: session.accessToken,
      capabilities: session.capabilities,
      menus: session.menus,
      user: session.user,
    },
  );
  await page.goto(`${baseUrl}/`);
  await page.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10_000 });
};

const assertPageContained = async (page: Page, auditPage: AuditPage) => {
  console.log(`checking ${auditPage.label}: ${auditPage.path}`);
  await page.evaluate(path => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, auditPage.path);
  await page.locator('body').waitFor({ state: 'visible' });

  const content = page.locator('main#content');
  await content.waitFor({ state: 'attached', timeout: 10_000 });

  const metrics = await page.evaluate(() => {
    const contentElement = document.querySelector('main#content');
    const contentRect = contentElement?.getBoundingClientRect();
    const contentStyle = contentElement ? getComputedStyle(contentElement) : null;

    return {
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      contentRight: contentRect?.right ?? 0,
      contentScrollHeight: contentElement?.scrollHeight ?? 0,
      contentClientHeight: contentElement?.clientHeight ?? 0,
      contentOverflowY: contentStyle?.overflowY ?? '',
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
    };
  });

  const maxWidth = metrics.windowWidth + 1;

  if (metrics.documentScrollWidth > maxWidth || metrics.bodyScrollWidth > maxWidth) {
    throw new Error(
      `${auditPage.label} has page-level horizontal overflow: document=${metrics.documentScrollWidth}, body=${metrics.bodyScrollWidth}, viewport=${metrics.windowWidth}`,
    );
  }

  if (metrics.contentRight > maxWidth) {
    throw new Error(
      `${auditPage.label} content escapes viewport: right=${metrics.contentRight}, viewport=${metrics.windowWidth}`,
    );
  }

  if (metrics.contentOverflowY !== 'auto') {
    throw new Error(`${auditPage.label} content is not the scroll container: overflow-y=${metrics.contentOverflowY}`);
  }

  if (metrics.contentScrollHeight > metrics.contentClientHeight && metrics.contentClientHeight <= 0) {
    throw new Error(`${auditPage.label} content scroller has invalid height.`);
  }
};

const run = async () => {
  if (!password) {
    throw new Error('Set ADMIN_AUDIT_PASSWORD or IAM_BOOTSTRAP_ADMIN_PASSWORD before running admin responsive audit.');
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await signIn(page);

      for (const auditPage of auditPages) {
        await assertPageContained(page, auditPage);
      }

      await context.close();
      console.log(`admin responsive audit passed: ${viewport.label} ${viewport.width}x${viewport.height}`);
    }
  } finally {
    await browser.close();
  }
};

run().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
