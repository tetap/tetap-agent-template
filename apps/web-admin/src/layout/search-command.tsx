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
import { useAdminT } from '@tetap/hooks';
import { sidebarData } from './data/sidebar-data.js';

export const SearchCommand = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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
            {sidebarData.navGroups.map(group => (
              <CommandGroup heading={t(group.titleKey)} key={group.titleKey}>
                {group.items
                  .flatMap(item => [item, ...(item.items ?? [])])
                  .map(item => (
                    <CommandItem
                      key={`${item.titleKey}-${item.url}`}
                      onSelect={() => runCommand(item.url)}
                      value={t(item.titleKey)}>
                      <ArrowRight />
                      {t(item.titleKey)}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
            <CommandSeparator />
          </ScrollArea>
        </CommandList>
      </CommandDialog>
    </>
  );
};
