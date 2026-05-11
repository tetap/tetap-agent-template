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
      <Button onClick={() => setOpen(true)} type="button" variant="outline">
        <Search />
        {t('webAdmin.layout.search.trigger')}
      </Button>
      <CommandDialog closeLabel={t('common.close')} onOpenChange={setOpen} open={open}>
        <CommandInput placeholder={t('webAdmin.layout.search.placeholder')} />
        <CommandList>
          <ScrollArea>
            <CommandEmpty>{t('webAdmin.layout.search.empty')}</CommandEmpty>
            {sidebarData.navGroups.map(group => (
              <CommandGroup heading={t(group.titleKey)} key={group.titleKey}>
                {group.items.map(item => (
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
