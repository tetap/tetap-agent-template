import { Laptop, Moon, Sun } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tetap/ui';
import { useAdminT, useAdminThemeStore, type AdminTheme } from '@tetap/hooks';

const themeOptions = [
  { icon: Sun, key: 'light', labelKey: 'webAdmin.settings.theme.light' },
  { icon: Moon, key: 'dark', labelKey: 'webAdmin.settings.theme.dark' },
  { icon: Laptop, key: 'system', labelKey: 'webAdmin.settings.theme.system' },
] as const;

export const ThemeSwitch = () => {
  const t = useAdminT();
  const setTheme = useAdminThemeStore(state => state.setTheme);
  const theme = useAdminThemeStore(state => state.theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('webAdmin.layout.themeToggle')}
          size="icon"
          title={t('webAdmin.layout.themeToggle')}
          variant="ghost">
          {theme === 'dark' ? <Moon /> : theme === 'light' ? <Sun /> : <Laptop />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {themeOptions.map(option => {
            const Icon = option.icon;

            return (
              <DropdownMenuItem key={option.key} onClick={() => setTheme(option.key as AdminTheme)}>
                <Icon />
                {t(option.labelKey)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
