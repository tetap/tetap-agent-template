import { useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';
import { SignOutDialog } from './sign-out-dialog.js';

export const ProfileDropdown = () => {
  const t = useAdminT();
  const user = useAdminSessionStore(state => state.auth.user);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const displayName = user?.name ?? t('webAdmin.layout.user.name');
  const displayEmail = user?.email ?? t('webAdmin.layout.user.email');
  const fallback = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative rounded-full" size="icon" variant="ghost">
            <Avatar className="size-8">
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56 rounded-lg" sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>
            </div>
          </DropdownMenuLabel>
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
      <SignOutDialog onOpenChange={setSignOutOpen} open={signOutOpen} />
    </>
  );
};
