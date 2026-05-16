import { memo, useCallback } from 'react';
import { Laptop, Moon, Sun, type LucideIcon } from 'lucide-react';
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

type ThemeOptionItemProps = {
  icon: LucideIcon;
  label: string;
  onSelect: (theme: AdminTheme) => void;
  theme: AdminTheme;
};

const ThemeOptionItem = memo(function ThemeOptionItem({ icon: Icon, label, onSelect, theme }: ThemeOptionItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(theme);
  }, [onSelect, theme]);

  return (
    <DropdownMenuItem onClick={handleSelect}>
      <Icon />
      {label}
    </DropdownMenuItem>
  );
});

export const ThemeSwitch = memo(function ThemeSwitch() {
  const t = useAdminT();
  const setTheme = useAdminThemeStore(state => state.setTheme);
  const theme = useAdminThemeStore(state => state.theme);
  const selectTheme = useCallback(
    (nextTheme: AdminTheme) => {
      setTheme(nextTheme);
    },
    [setTheme],
  );

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
            return (
              <ThemeOptionItem
                icon={option.icon}
                key={option.key}
                label={t(option.labelKey)}
                onSelect={selectTheme}
                theme={option.key}
              />
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
