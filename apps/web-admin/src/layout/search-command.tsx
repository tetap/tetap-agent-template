import { useState } from 'react';
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
  ScrollArea,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, type AdminSessionMenuNode } from '@tetap/hooks';

const flattenMenus = (menus: readonly AdminSessionMenuNode[]): AdminSessionMenuNode[] =>
  menus.flatMap(menu => [menu, ...flattenMenus(menu.children)]);

export const SearchCommand = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const menus = useAdminSessionStore(state => state.auth.menus);
  const [open, setOpen] = useState(false);
  const searchableMenus = flattenMenus(menus);

  const runCommand = (path: string) => {
    setOpen(false);
    void navigate(path);
  };

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
          <ScrollArea>
            <CommandEmpty>{t('webAdmin.layout.search.empty')}</CommandEmpty>
            <CommandGroup heading={t('webAdmin.navigation.groups.backendMenus')}>
              {searchableMenus.map(menu => (
                <CommandItem key={`${menu.id}-${menu.path}`} onSelect={() => runCommand(menu.path)} value={menu.name}>
                  <ArrowRight />
                  {menu.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </ScrollArea>
        </CommandList>
      </CommandDialog>
    </>
  );
};
