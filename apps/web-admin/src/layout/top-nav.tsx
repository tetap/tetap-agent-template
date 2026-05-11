import { Link, useLocation } from 'react-router';
import { Button, cn } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import type { AdminMessageKey } from '@tetap/i18n/admin';

export type TopNavItem = {
  titleKey: AdminMessageKey;
  href: string;
  disabled?: boolean;
};

export const TopNav = ({ className, links }: { className?: string; links: readonly TopNavItem[] }) => {
  const t = useAdminT();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className={cn('hidden items-center gap-1 md:flex', className)} aria-label={t('webAdmin.navigation.label')}>
      {links.map(link => (
        <Button
          asChild={!link.disabled}
          disabled={link.disabled}
          key={`${link.titleKey}-${link.href}`}
          size="sm"
          variant={pathname === link.href ? 'secondary' : 'ghost'}>
          {link.disabled ? <span>{t(link.titleKey)}</span> : <Link to={link.href}>{t(link.titleKey)}</Link>}
        </Button>
      ))}
    </nav>
  );
};
