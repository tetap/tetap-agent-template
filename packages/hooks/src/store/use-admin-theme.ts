import { useEffect } from 'react';
import { create } from 'zustand';

export type AdminTheme = 'light' | 'dark' | 'system';

type AdminThemeState = {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
};

const storageKey = 'tetap-admin-theme';

const readStoredTheme = (): AdminTheme => {
  if (typeof localStorage === 'undefined') {
    return 'system';
  }

  const storedTheme = localStorage.getItem(storageKey);

  return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' ? storedTheme : 'system';
};

const applyTheme = (theme: AdminTheme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const systemTheme =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
};

export const useAdminThemeStore = create<AdminThemeState>(set => ({
  theme: readStoredTheme(),
  setTheme: theme => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, theme);
    }

    applyTheme(theme);
    set({ theme });
  },
}));

export const useAdminThemeEffect = () => {
  const theme = useAdminThemeStore(state => state.theme);

  useEffect(() => {
    applyTheme(theme);

    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(theme);

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
};
