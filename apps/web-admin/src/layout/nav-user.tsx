import { memo, useCallback, useState } from 'react';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';
import { SignOutDialog } from './sign-out-dialog.js';

export const NavUser = memo(function NavUser() {
  const t = useAdminT();
  const { isMobile } = useSidebar();
  const user = useAdminSessionStore(state => state.auth.user);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const displayName = user?.name ?? t('webAdmin.layout.user.name');
  const displayEmail = user?.email ?? t('webAdmin.layout.user.email');
  const fallback = displayName.slice(0, 2).toUpperCase();
  const openSignOut = useCallback(() => {
    setSignOutOpen(true);
  }, []);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
                <ChevronsUpDown className="ms-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}>
              <DropdownMenuItem onClick={openSignOut}>
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
});
