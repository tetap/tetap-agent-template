import { ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import type { AdminTeam } from './types.js';

export const TeamSwitcher = ({ teams }: { teams: readonly AdminTeam[] }) => {
  const t = useAdminT();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  const ActiveLogo = activeTeam.logo;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ActiveLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{t(activeTeam.nameKey)}</span>
                <span className="truncate text-xs">{t(activeTeam.planKey)}</span>
              </div>
              <ChevronsUpDown className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('webAdmin.layout.teams.label')}
            </DropdownMenuLabel>
            {teams.map((team, index) => {
              const TeamLogo = team.logo;

              return (
                <DropdownMenuItem className="gap-2 p-2" key={team.nameKey} onClick={() => setActiveTeam(team)}>
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <TeamLogo className="size-4 shrink-0" />
                  </div>
                  {t(team.nameKey)}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus />
              </div>
              <div className="font-medium text-muted-foreground">{t('webAdmin.layout.teams.add')}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
