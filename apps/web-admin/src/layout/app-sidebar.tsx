import { memo, useMemo } from 'react';
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
  TetapLogo,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, type AdminSessionMenuNode } from '@tetap/hooks';
import { adminMenuTitleKeyMap } from './menu-labels.js';
import { NavGroup } from './nav-group.js';
import { NavUser } from './nav-user.js';
import type { AdminNavGroup, AdminNavItem } from './types.js';

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

const toNavItem = (menu: AdminSessionMenuNode): AdminNavItem => {
  const children = menu.children.map(toNavItem);

  return {
    title: menu.name,
    titleKey: adminMenuTitleKeyMap[menu.id],
    url: menu.path,
    icon: menuIconMap[menu.icon as keyof typeof menuIconMap],
    ...(children.length > 0 ? { items: children } : {}),
  };
};

export const AppSidebar = memo(function AppSidebar() {
  const t = useAdminT();
  const menus = useAdminSessionStore(state => state.auth.menus);
  const navGroups = useMemo<AdminNavGroup[]>(() => (menus.length ? [{ items: menus.map(toNavItem) }] : []), [menus]);

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
            <SidebarMenuButton
              className="group-data-[collapsible=icon]:justify-center [&>svg]:!size-8"
              size="lg"
              tooltip={t('webAdmin.title')}>
              <TetapLogo className="size-8" />
              <div className="grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{t('webAdmin.title')}</span>
                <span className="truncate text-xs">{t('webAdmin.badge')}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map(group => (
          <NavGroup {...group} key={group.titleKey ?? group.title ?? 'default'} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
});
