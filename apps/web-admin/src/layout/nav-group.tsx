import { Link, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

const useNavLabel = () => {
  const t = useAdminT();

  return (item: { title?: string; titleKey?: Parameters<typeof t>[0] }) =>
    item.titleKey ? t(item.titleKey) : (item.title ?? '');
};

export const NavGroup = ({ title, titleKey, items }: AdminNavGroup) => {
  const t = useAdminT();
  const getLabel = useNavLabel();
  const { isMobile, state } = useSidebar();
  const location = useLocation();
  const href = `${location.pathname}${location.search}`;

  return (
    <SidebarGroup>
      {titleKey || title ? <SidebarGroupLabel>{titleKey ? t(titleKey) : title}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map(item => {
          const key = `${getLabel(item)}-${item.url}`;
          const hasChildren = Boolean(item.items?.length);

          if (!hasChildren) {
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

  return (
    <Badge className="rounded-full px-1 py-0 text-xs" variant="secondary">
      {t(item.badgeKey)}
    </Badge>
  );
};

const SidebarMenuLink = ({ item, href }: { item: AdminNavItem; href: string }) => {
  const getLabel = useNavLabel();
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;
  const label = getLabel(item);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(href, item)} tooltip={label}>
        <Link onClick={() => setOpenMobile(false)} to={item.url}>
          {Icon ? <Icon /> : null}
          <span>{label}</span>
          <NavBadge item={item} />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({ item, href }: { item: AdminNavItem; href: string }) => {
  const getLabel = useNavLabel();
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;
  const label = getLabel(item);

  return (
    <Collapsible asChild className="group/collapsible" defaultOpen={checkIsActive(href, item, true)}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={label}>
            {Icon ? <Icon /> : null}
            <span>{label}</span>
            <NavBadge item={item} />
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map(subItem => {
              const SubIcon = subItem.icon;
              const subLabel = getLabel(subItem);

              return (
                <SidebarMenuSubItem key={`${subLabel}-${subItem.url}`}>
                  <SidebarMenuSubButton asChild isActive={checkIsActive(href, subItem)}>
                    <Link onClick={() => setOpenMobile(false)} to={subItem.url}>
                      {SubIcon ? <SubIcon /> : null}
                      <span>{subLabel}</span>
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
  const getLabel = useNavLabel();
  const Icon = item.icon;
  const label = getLabel(item);

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton isActive={checkIsActive(href, item)} tooltip={label}>
            {Icon ? <Icon /> : null}
            <span>{label}</span>
            <NavBadge item={item} />
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" sideOffset={4}>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {item.items?.map(subItem => {
              const SubIcon = subItem.icon;
              const subLabel = getLabel(subItem);

              return (
                <DropdownMenuItem asChild key={`${subLabel}-${subItem.url}`}>
                  <Link to={subItem.url}>
                    {SubIcon ? <SubIcon /> : null}
                    <span>{subLabel}</span>
                    <NavBadge item={subItem} />
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
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
