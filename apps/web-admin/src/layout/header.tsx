import { Separator, SidebarTrigger } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import { SearchCommand } from './search-command.js';

export const AdminHeader = () => {
  const t = useAdminT();

  return (
    <header>
      <SidebarTrigger label={t('webAdmin.layout.sidebarToggle')} variant="outline" />
      <Separator orientation="vertical" />
      <SearchCommand />
    </header>
  );
};
