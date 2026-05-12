import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Search } from 'lucide-react';
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, type AdminSessionMenuNode } from '@tetap/hooks';
import { adminMenuTitleKeyMap } from './menu-labels.js';

const flattenMenus = (menus: readonly AdminSessionMenuNode[]): AdminSessionMenuNode[] =>
  menus.flatMap(menu => [menu, ...flattenMenus(menu.children)]);

export const SearchCommand = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const menus = useAdminSessionStore(state => state.auth.menus);
  const [open, setOpen] = useState(false);
  const searchableMenus = flattenMenus(menus);
  const getMenuLabel = (menu: AdminSessionMenuNode) => {
    const titleKey = adminMenuTitleKeyMap[menu.id];

    return titleKey ? t(titleKey) : menu.name;
  };

  const runCommand = (path: string) => {
    setOpen(false);
    void navigate(path);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(open => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        className="relative h-9 w-40 justify-start text-sm text-muted-foreground sm:pe-12 md:w-64"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline">
        <Search />
        <span className="hidden md:inline-flex">{t('webAdmin.layout.search.trigger')}</span>
        <kbd className="pointer-events-none absolute end-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog closeLabel={t('common.close')} onOpenChange={setOpen} open={open}>
        <CommandInput placeholder={t('webAdmin.layout.search.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('webAdmin.layout.search.empty')}</CommandEmpty>
          <CommandGroup>
            {searchableMenus.map(menu => {
              const label = getMenuLabel(menu);

              return (
                <CommandItem key={`${menu.id}-${menu.path}`} onSelect={() => runCommand(menu.path)} value={label}>
                  <ArrowRight />
                  {label}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
};
