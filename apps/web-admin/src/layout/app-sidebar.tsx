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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  TetapLogo,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, type AdminSessionMenuNode } from '@tetap/hooks';
import { adminMenuTitleKeyMap } from './menu-labels.js';
import { NavGroup } from './nav-group.js';
import { NavUser } from './nav-user.js';
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
  const navGroups = menus.length ? [{ items: menus.map(toNavItem) }] : [];

  return (
    <Sidebar
      collapsible="icon"
      mobileCloseLabel={t('webAdmin.layout.sidebarClose')}
      mobileDescription={t('webAdmin.layout.sidebarDescription')}
      mobileTitle={t('webAdmin.layout.sidebarTitle')}
      variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TetapLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{t('webAdmin.title')}</span>
                <span className="truncate text-xs">{t('webAdmin.badge')}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => (
          <NavGroup {...group} key={index} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail aria-label={t('webAdmin.layout.sidebarToggle')} title={t('webAdmin.layout.sidebarToggle')} />
    </Sidebar>
  );
};
