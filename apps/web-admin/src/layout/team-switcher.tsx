import { useState } from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
              <ActiveLogo />
              <span>{t(activeTeam.nameKey)}</span>
              <span>{t(activeTeam.planKey)}</span>
              <ChevronsUpDown />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel>{t('webAdmin.layout.teams.label')}</DropdownMenuLabel>
            {teams.map(team => {
              const TeamLogo = team.logo;

              return (
                <DropdownMenuItem key={team.nameKey} onClick={() => setActiveTeam(team)}>
                  <TeamLogo />
                  {t(team.nameKey)}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus />
              {t('webAdmin.layout.teams.add')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
