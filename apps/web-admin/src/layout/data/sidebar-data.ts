import {
  BadgeCheck,
  Bell,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MonitorCog,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { TetapLogo } from '@tetap/ui';
import type { AdminSidebarData } from '../types.js';

export const sidebarData: AdminSidebarData = {
  teams: [
    {
      nameKey: 'webAdmin.layout.teams.core.name',
      planKey: 'webAdmin.layout.teams.core.plan',
      logo: TetapLogo,
    },
    {
      nameKey: 'webAdmin.layout.teams.security.name',
      planKey: 'webAdmin.layout.teams.security.plan',
      logo: ShieldCheck,
    },
  ],
  navGroups: [
    {
      titleKey: 'webAdmin.navigation.groups.platform',
      items: [
        {
          titleKey: 'webAdmin.navigation.dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          titleKey: 'webAdmin.navigation.users',
          url: '/users',
          icon: Users,
          badgeKey: 'webAdmin.navigation.badges.review',
        },
        {
          titleKey: 'webAdmin.navigation.security',
          url: '/security',
          icon: ShieldCheck,
          items: [
            {
              titleKey: 'webAdmin.navigation.iam',
              url: '/security/iam',
              icon: KeyRound,
            },
            {
              titleKey: 'webAdmin.navigation.audit',
              url: '/security/audit',
              icon: LockKeyhole,
            },
            {
              titleKey: 'webAdmin.navigation.roles',
              url: '/security/roles',
              icon: UserCog,
            },
            {
              titleKey: 'webAdmin.navigation.sessions',
              url: '/security/sessions',
              icon: MonitorCog,
            },
          ],
        },
      ],
    },
    {
      titleKey: 'webAdmin.navigation.groups.system',
      items: [
        {
          titleKey: 'webAdmin.navigation.settings',
          url: '/settings',
          icon: Settings,
          items: [
            {
              titleKey: 'webAdmin.navigation.account',
              url: '/settings/account',
              icon: BadgeCheck,
            },
            {
              titleKey: 'webAdmin.navigation.notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
          ],
        },
      ],
    },
  ],
} as const;
