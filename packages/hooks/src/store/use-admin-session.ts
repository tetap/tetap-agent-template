import { create } from 'zustand';

const ADMIN_ACCESS_TOKEN_STORAGE_KEY = 'tetap.admin.accessToken';
const ADMIN_USER_STORAGE_KEY = 'tetap.admin.user';

export type AdminSessionUser = {
  accountNo: string;
  email: string;
  name: string;
  roles: readonly string[];
  exp: number;
};

type AdminSessionAuthState = {
  user: AdminSessionUser | null;
  accessToken: string;
  setUser: (user: AdminSessionUser | null) => void;
  setAccessToken: (accessToken: string) => void;
  resetAccessToken: () => void;
  reset: () => void;
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

const readAdminUser = (): AdminSessionUser | null => {
  const storedValue = readStorage(ADMIN_USER_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as AdminSessionUser;
  } catch {
    removeStorage(ADMIN_USER_STORAGE_KEY);
    return null;
  }
};

export const useAdminSessionStore = create<AdminSessionStoreState>()((set, get) => ({
  auth: {
    user: readAdminUser(),
    accessToken: readStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY) ?? '',
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
    resetAccessToken: () =>
      set(state => {
        removeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
        return { ...state, auth: { ...state.auth, accessToken: '' } };
      }),
    reset: () =>
      set(state => {
        removeStorage(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
        removeStorage(ADMIN_USER_STORAGE_KEY);

        return {
          ...state,
          auth: { ...state.auth, accessToken: '', user: null },
        };
      }),
    isAuthenticated: () => Boolean(get().auth.accessToken),
  },
}));
