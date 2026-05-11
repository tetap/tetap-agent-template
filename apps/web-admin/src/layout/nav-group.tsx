import { Link, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import type { AdminNavGroup, AdminNavItem } from './types.js';

export const NavGroup = ({ titleKey, items }: AdminNavGroup) => {
  const t = useAdminT();
  const { isMobile, state } = useSidebar();
  const location = useLocation();
  const href = `${location.pathname}${location.search}`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(titleKey)}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => {
          const key = `${item.titleKey}-${item.url}`;

          if (!item.items) {
            return <SidebarMenuLink href={href} item={item} key={key} />;
          }

          if (state === 'collapsed' && !isMobile) {
            return <SidebarMenuCollapsedDropdown href={href} item={item} key={key} />;
          }

          return <SidebarMenuCollapsible href={href} item={item} key={key} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

const NavBadge = ({ item }: { item: AdminNavItem }) => {
  const t = useAdminT();

  if (!item.badgeKey) {
    return null;
  }

  return <Badge variant="secondary">{t(item.badgeKey)}</Badge>;
};

const SidebarMenuLink = ({ item, href }: { item: AdminNavItem; href: string }) => {
  const t = useAdminT();
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(href, item)} tooltip={t(item.titleKey)}>
        <Link onClick={() => setOpenMobile(false)} to={item.url}>
          {Icon ? <Icon /> : null}
          <span>{t(item.titleKey)}</span>
          <NavBadge item={item} />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({ item, href }: { item: AdminNavItem; href: string }) => {
  const t = useAdminT();
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;

  return (
    <Collapsible asChild defaultOpen={checkIsActive(href, item, true)}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={t(item.titleKey)}>
            {Icon ? <Icon /> : null}
            <span>{t(item.titleKey)}</span>
            <NavBadge item={item} />
            <ChevronRight />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map(subItem => {
              const SubIcon = subItem.icon;

              return (
                <SidebarMenuSubItem key={`${subItem.titleKey}-${subItem.url}`}>
                  <SidebarMenuSubButton asChild isActive={checkIsActive(href, subItem)}>
                    <Link onClick={() => setOpenMobile(false)} to={subItem.url}>
                      {SubIcon ? <SubIcon /> : null}
                      <span>{t(subItem.titleKey)}</span>
                      <NavBadge item={subItem} />
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({ item, href }: { item: AdminNavItem; href: string }) => {
  const t = useAdminT();
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton isActive={checkIsActive(href, item)} tooltip={t(item.titleKey)}>
            {Icon ? <Icon /> : null}
            <span>{t(item.titleKey)}</span>
            <NavBadge item={item} />
            <ChevronRight />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" sideOffset={4}>
          <DropdownMenuLabel>{t(item.titleKey)}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items?.map(subItem => {
            const SubIcon = subItem.icon;

            return (
              <DropdownMenuItem asChild key={`${subItem.titleKey}-${subItem.url}`}>
                <Link to={subItem.url}>
                  {SubIcon ? <SubIcon /> : null}
                  <span>{t(subItem.titleKey)}</span>
                  <NavBadge item={subItem} />
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

const checkIsActive = (href: string, item: AdminNavItem, mainNav = false) =>
  href === item.url ||
  href.split('?')[0] === item.url ||
  Boolean(item.items?.some(child => child.url === href || child.url === href.split('?')[0])) ||
  (mainNav && href.split('/')[1] !== '' && href.split('/')[1] === item.url.split('/')[1]);
