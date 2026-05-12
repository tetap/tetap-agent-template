import { create } from 'zustand';

const ADMIN_ACCESS_TOKEN_STORAGE_KEY = 'tetap.admin.accessToken';
const ADMIN_USER_STORAGE_KEY = 'tetap.admin.user';
const ADMIN_CAPABILITIES_STORAGE_KEY = 'tetap.admin.capabilities';
const ADMIN_MENUS_STORAGE_KEY = 'tetap.admin.menus';

export type AdminSessionUser = {
  accountNo: string;
  email: string;
  name: string;
  roles: readonly string[];
  isSuperAdmin?: boolean;
  exp: number;
};

export type AdminSessionMenuNode = {
  id: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  parentId?: string;
  permissionCodes: readonly string[];
  order: number;
  children: readonly AdminSessionMenuNode[];
};

const legacySecurityPathMap = new Map([
  ['/security', '/system'],
  ['/security/iam', '/system/permission'],
  ['/security/roles', '/system/role'],
  ['/security/permissions', '/system/permission'],
  ['/security/menus', '/system/menu'],
  ['/security/fields', '/system/field'],
  ['/security/policies', '/system/policy'],
  ['/security/sessions', '/system/session'],
  ['/security/operation-logs', '/system/operation-log'],
]);

const legacySecurityIdMap = new Map([
  ['security', 'system'],
  ['iam', 'permissions'],
]);

const normalizeMenuPath = (path: string) =>
  legacySecurityPathMap.get(path) ?? path.replace(/^\/security\//, '/system/');

const dedupeMenus = (menus: readonly AdminSessionMenuNode[]) => {
  const seen = new Set<string>();

  return menus.filter(menu => {
    const key = `${menu.parentId ?? 'root'}:${menu.path}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const normalizeMenuNode = (menu: AdminSessionMenuNode, parentId?: string): AdminSessionMenuNode => {
  const isLegacySecurityChild =
    parentId === 'system' || menu.parentId === 'security' || menu.path.startsWith('/security/');
  const id = isLegacySecurityChild ? (legacySecurityIdMap.get(menu.id) ?? menu.id) : menu.id;

  return {
    ...menu,
    id,
    path: normalizeMenuPath(menu.path),
    parentId: parentId ?? (isLegacySecurityChild ? 'system' : menu.parentId),
    children: dedupeMenus(menu.children.map(child => normalizeMenuNode(child, id))),
  };
};

const normalizeAdminMenus = (menus: readonly AdminSessionMenuNode[]): readonly AdminSessionMenuNode[] => {
  const regularRoots: AdminSessionMenuNode[] = [];
  const legacySecurityChildren: AdminSessionMenuNode[] = [];

  for (const menu of menus) {
    if (menu.id === 'security' || menu.path === '/security') {
      legacySecurityChildren.push(...menu.children.map(child => normalizeMenuNode(child, 'system')));
      continue;
    }

    regularRoots.push(normalizeMenuNode(menu));
  }

  const systemIndex = regularRoots.findIndex(menu => menu.id === 'system' || menu.path === '/system');

  if (systemIndex >= 0) {
    const systemMenu = regularRoots[systemIndex];
    regularRoots[systemIndex] = {
      ...systemMenu,
      children: dedupeMenus([...systemMenu.children, ...legacySecurityChildren]),
    };
  } else if (legacySecurityChildren.length > 0) {
    regularRoots.push({
      id: 'system',
      name: 'System Management',
      path: '/system',
      component: 'AdminSystemRedirectPage',
      icon: 'Settings',
      permissionCodes: [],
      order: 10,
      children: dedupeMenus(legacySecurityChildren),
    });
  }

  return dedupeMenus(regularRoots);
};

type AdminSessionAuthState = {
  user: AdminSessionUser | null;
  accessToken: string;
  capabilities: readonly string[];
  menus: readonly AdminSessionMenuNode[];
  setUser: (user: AdminSessionUser | null) => void;
  setAccessToken: (accessToken: string) => void;
  setCapabilities: (capabilities: readonly string[]) => void;
  setMenus: (menus: readonly AdminSessionMenuNode[]) => void;
  setContext: (context: {
    accessToken?: string;
    user: AdminSessionUser;
    capabilities: readonly string[];
    menus: readonly AdminSessionMenuNode[];
  }) => void;
  resetAccessToken: () => void;
  reset: () => void;
  can: (capability: string) => boolean;
  isAuthenticated: () => boolean;
};

export type AdminSessionStoreState = {
  auth: AdminSessionAuthState;
};

const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readStorage = (key: string) => {
  if (!hasStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
};

const writeStorage = (key: string, value: string) => {
  if (hasStorage()) {
    window.localStorage.setItem(key, value);
  }
};

const removeStorage = (key: string) => {
  if (hasStorage()) {
    window.localStorage.removeItem(key);
  }
};

const readJson = <TValue>(key: string): TValue | null => {
  const storedValue = readStorage(key);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as TValue;
  } catch {
    removeStorage(key);
    return null;
  }
};

const readAdminUser = (): AdminSessionUser | null => readJson<AdminSessionUser>(ADMIN_USER_STORAGE_KEY);

const readCapabilities = (): readonly string[] => readJson<string[]>(ADMIN_CAPABILITIES_STORAGE_KEY) ?? [];

const readMenus = (): readonly AdminSessionMenuNode[] =>
  normalizeAdminMenus(readJson<AdminSessionMenuNode[]>(ADMIN_MENUS_STORAGE_KEY) ?? []);

const isSuperAdminUser = (user: AdminSessionUser | null) =>
  Boolean(user?.isSuperAdmin || user?.roles.some(role => role === 'super-admin' || role === 'SUPER_ADMIN'));

export const useAdminSessionStore = create<AdminSessionStoreState>()((set, get) => ({
  auth: {
    user: readAdminUser(),
    accessToken: readStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY) ?? '',
    capabilities: readCapabilities(),
    menus: readMenus(),
    setUser: user =>
      set(state => {
        if (user) {
          writeStorage(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
        } else {
          removeStorage(ADMIN_USER_STORAGE_KEY);
        }

        return { ...state, auth: { ...state.auth, user } };
      }),
    setAccessToken: accessToken =>
      set(state => {
        writeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY, accessToken);
        return { ...state, auth: { ...state.auth, accessToken } };
      }),
    setCapabilities: capabilities =>
      set(state => {
        writeStorage(ADMIN_CAPABILITIES_STORAGE_KEY, JSON.stringify(capabilities));
        return { ...state, auth: { ...state.auth, capabilities } };
      }),
    setMenus: menus =>
      set(state => {
        const normalizedMenus = normalizeAdminMenus(menus);

        writeStorage(ADMIN_MENUS_STORAGE_KEY, JSON.stringify(normalizedMenus));
        return { ...state, auth: { ...state.auth, menus: normalizedMenus } };
      }),
    setContext: context =>
      set(state => {
        const normalizedMenus = normalizeAdminMenus(context.menus);

        if (context.accessToken) {
          writeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY, context.accessToken);
        }

        writeStorage(ADMIN_USER_STORAGE_KEY, JSON.stringify(context.user));
        writeStorage(ADMIN_CAPABILITIES_STORAGE_KEY, JSON.stringify(context.capabilities));
        writeStorage(ADMIN_MENUS_STORAGE_KEY, JSON.stringify(normalizedMenus));

        return {
          ...state,
          auth: {
            ...state.auth,
            accessToken: context.accessToken ?? state.auth.accessToken,
            capabilities: context.capabilities,
            menus: normalizedMenus,
            user: context.user,
          },
        };
      }),
    resetAccessToken: () =>
      set(state => {
        removeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
        return { ...state, auth: { ...state.auth, accessToken: '' } };
      }),
    reset: () =>
      set(state => {
        removeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
        removeStorage(ADMIN_USER_STORAGE_KEY);
        removeStorage(ADMIN_CAPABILITIES_STORAGE_KEY);
        removeStorage(ADMIN_MENUS_STORAGE_KEY);

        return {
          ...state,
          auth: { ...state.auth, accessToken: '', capabilities: [], menus: [], user: null },
        };
      }),
    can: capability => isSuperAdminUser(get().auth.user) || get().auth.capabilities.includes(capability),
    isAuthenticated: () => Boolean(get().auth.accessToken),
  },
}));
