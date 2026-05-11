import { useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';
import { SignOutDialog } from './sign-out-dialog.js';

export const NavUser = () => {
  const t = useAdminT();
  const { isMobile } = useSidebar();
  const user = useAdminSessionStore(state => state.auth.user);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const displayName = user?.name ?? t('webAdmin.layout.user.name');
  const displayEmail = user?.email ?? t('webAdmin.layout.user.email');
  const fallback = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar>
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <span>{displayName}</span>
                <span>{displayEmail}</span>
                <ChevronsUpDown />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  {t('webAdmin.layout.user.upgrade')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/settings/account">
                    <BadgeCheck />
                    {t('webAdmin.navigation.account')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings/billing">
                    <CreditCard />
                    {t('webAdmin.navigation.billing')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings/notifications">
                    <Bell />
                    {t('webAdmin.navigation.notifications')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSignOutOpen(true)}>
                <LogOut />
                {t('webAdmin.layout.user.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <SignOutDialog onOpenChange={setSignOutOpen} open={signOutOpen} />
    </>
  );
};
