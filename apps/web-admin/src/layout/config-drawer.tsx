import { Settings } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@tetap/ui';
import { useAdminT, useAdminThemeStore } from '@tetap/hooks';
import { ThemeSwitch } from './theme-switch.js';

export const ConfigDrawer = () => {
  const t = useAdminT();
  const theme = useAdminThemeStore(state => state.theme);
  const themeLabelKey = {
    dark: 'webAdmin.settings.theme.dark',
    light: 'webAdmin.settings.theme.light',
    system: 'webAdmin.settings.theme.system',
  } as const;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label={t('webAdmin.layout.configToggle')}
          size="icon"
          title={t('webAdmin.layout.configToggle')}
          variant="ghost">
          <Settings />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('webAdmin.settings.display.title')}</SheetTitle>
          <SheetDescription>{t('webAdmin.settings.display.description')}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('webAdmin.settings.theme.title')}</CardTitle>
              <CardDescription>{t('webAdmin.settings.theme.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t(themeLabelKey[theme])}</span>
              <ThemeSwitch />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
