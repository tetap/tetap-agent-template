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
  readJson<AdminSessionMenuNode[]>(ADMIN_MENUS_STORAGE_KEY) ?? [];

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
        writeStorage(ADMIN_MENUS_STORAGE_KEY, JSON.stringify(menus));
        return { ...state, auth: { ...state.auth, menus } };
      }),
    setContext: context =>
      set(state => {
        if (context.accessToken) {
          writeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY, context.accessToken);
        }

        writeStorage(ADMIN_USER_STORAGE_KEY, JSON.stringify(context.user));
        writeStorage(ADMIN_CAPABILITIES_STORAGE_KEY, JSON.stringify(context.capabilities));
        writeStorage(ADMIN_MENUS_STORAGE_KEY, JSON.stringify(context.menus));

        return {
          ...state,
          auth: {
            ...state.auth,
            accessToken: context.accessToken ?? state.auth.accessToken,
            capabilities: context.capabilities,
            menus: context.menus,
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
    can: capability => get().auth.capabilities.includes(capability),
    isAuthenticated: () => Boolean(get().auth.accessToken),
  },
}));
