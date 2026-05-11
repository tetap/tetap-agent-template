import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import { sidebarData } from './data/sidebar-data.js';
import { NavGroup } from './nav-group.js';
import { NavUser } from './nav-user.js';
import { TeamSwitcher } from './team-switcher.js';

export const AppSidebar = () => {
  const t = useAdminT();

  return (
    <Sidebar
      collapsible="icon"
      mobileCloseLabel={t('webAdmin.layout.sidebarClose')}
      mobileDescription={t('webAdmin.layout.sidebarDescription')}
      mobileTitle={t('webAdmin.layout.sidebarTitle')}
      variant="inset">
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map(group => (
          <NavGroup {...group} key={group.titleKey} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail aria-label={t('webAdmin.layout.sidebarToggle')} title={t('webAdmin.layout.sidebarToggle')} />
    </Sidebar>
  );
};
