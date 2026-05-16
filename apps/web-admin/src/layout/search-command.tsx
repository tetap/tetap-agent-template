import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type SearchCommandMenuItemProps = {
  label: string;
  onRun: (path: string) => void;
  path: string;
  value: string;
};

const SearchCommandMenuItem = memo(function SearchCommandMenuItem({
  label,
  onRun,
  path,
  value,
}: SearchCommandMenuItemProps) {
  const handleSelect = useCallback(() => {
    onRun(path);
  }, [onRun, path]);

  return (
    <CommandItem onSelect={handleSelect} value={value}>
      <ArrowRight />
      {label}
    </CommandItem>
  );
});

export const SearchCommand = memo(function SearchCommand() {
  const t = useAdminT();
  const navigate = useNavigate();
  const menus = useAdminSessionStore(state => state.auth.menus);
  const [open, setOpen] = useState(false);
  const handleKeyDownRef = useRef<(event: KeyboardEvent) => void>(() => undefined);
  const searchableMenus = useMemo(() => flattenMenus(menus), [menus]);
  const getMenuLabel = useCallback(
    (menu: AdminSessionMenuNode) => {
      const titleKey = adminMenuTitleKeyMap[menu.id];

      return titleKey ? t(titleKey) : menu.name;
    },
    [t],
  );

  const openSearch = useCallback(() => {
    setOpen(true);
  }, []);
  const runCommand = useCallback(
    (path: string) => {
      setOpen(false);
      void navigate(path);
    },
    [navigate],
  );
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setOpen(open => !open);
    }
  }, []);

  useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  }, [handleKeyDown]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      handleKeyDownRef.current(event);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        className="relative h-9 w-40 justify-start text-sm text-muted-foreground sm:pe-12 md:w-64"
        onClick={openSearch}
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
                <SearchCommandMenuItem
                  key={`${menu.id}-${menu.path}`}
                  label={label}
                  onRun={runCommand}
                  path={menu.path}
                  value={label}
                />
              );
            })}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
});
