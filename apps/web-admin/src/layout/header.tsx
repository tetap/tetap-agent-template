import { useEffect, useState, type HTMLAttributes } from 'react';
import { cn, SidebarTrigger } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';

type AdminHeaderProps = HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export const AdminHeader = ({ children, className, fixed, ...props }: AdminHeaderProps) => {
  const t = useAdminT();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    document.addEventListener('scroll', onScroll, { passive: true });

    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'z-50 h-16 shrink-0',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className,
      )}
      {...props}>
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg',
        )}>
        <SidebarTrigger className="max-md:scale-125" label={t('webAdmin.layout.sidebarToggle')} variant="outline" />
        {children}
      </div>
    </header>
  );
};
