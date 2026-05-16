import { memo } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu } from 'lucide-react';
import { Button, cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import type { AdminMessageKey } from '@tetap/i18n/admin';

export type TopNavItem = {
  titleKey: AdminMessageKey;
  href: string;
  disabled?: boolean;
};

export const TopNav = memo(function TopNav({ className, links }: { className?: string; links: readonly TopNavItem[] }) {
  const t = useAdminT();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className={cn('md:size-7 lg:hidden', className)} size="icon" variant="outline">
            <Menu />
            <span className="sr-only">{t('webAdmin.navigation.label')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom">
          {links.map(link => {
            const isActive = pathname === link.href;

            return (
              <DropdownMenuItem asChild={!link.disabled} key={`${link.titleKey}-${link.href}`}>
                {link.disabled ? (
                  <span className="text-muted-foreground">{t(link.titleKey)}</span>
                ) : (
                  <Link className={isActive ? undefined : 'text-muted-foreground'} to={link.href}>
                    {t(link.titleKey)}
                  </Link>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <nav
        className={cn('hidden items-center gap-4 lg:flex xl:gap-6', className)}
        aria-label={t('webAdmin.navigation.label')}>
        {links.map(link => {
          const isActive = pathname === link.href;

          return link.disabled ? (
            <span className="text-sm font-medium text-muted-foreground" key={`${link.titleKey}-${link.href}`}>
              {t(link.titleKey)}
            </span>
          ) : (
            <Link
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                !isActive && 'text-muted-foreground',
              )}
              key={`${link.titleKey}-${link.href}`}
              to={link.href}>
              {t(link.titleKey)}
            </Link>
          );
        })}
      </nav>
    </>
  );
});
