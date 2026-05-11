import {
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MonitorCog,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@tetap/ui';
import { useAdminSessionStore, useAdminT, type AdminSessionMenuNode } from '@tetap/hooks';
import { adminTeams } from './data/team-data.js';
import { adminMenuTitleKeyMap } from './menu-labels.js';
import { NavGroup } from './nav-group.js';
import { NavUser } from './nav-user.js';
import { TeamSwitcher } from './team-switcher.js';
import type { AdminNavItem } from './types.js';

const menuIconMap = {
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MonitorCog,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} as const;

const toNavItem = (menu: AdminSessionMenuNode): AdminNavItem => ({
  title: menu.name,
  titleKey: adminMenuTitleKeyMap[menu.id],
  url: menu.path,
  icon: menuIconMap[menu.icon as keyof typeof menuIconMap],
  items: menu.children.map(toNavItem),
});

export const AppSidebar = () => {
  const t = useAdminT();
  const menus = useAdminSessionStore(state => state.auth.menus);
  const navGroups = menus.length
    ? [
        {
          titleKey: 'webAdmin.navigation.groups.backendMenus' as const,
          items: menus.map(toNavItem),
        },
      ]
    : [];

  return (
    <Sidebar
      collapsible="icon"
      mobileCloseLabel={t('webAdmin.layout.sidebarClose')}
      mobileDescription={t('webAdmin.layout.sidebarDescription')}
      mobileTitle={t('webAdmin.layout.sidebarTitle')}
      variant="inset">
      <SidebarHeader>
        <TeamSwitcher teams={adminTeams} />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map(group => (
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
