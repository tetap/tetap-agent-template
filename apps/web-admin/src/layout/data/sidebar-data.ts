import {
  Bell,
  Bug,
  Construction,
  FileX,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  LockKeyhole,
  MessagesSquare,
  MonitorCog,
  Package,
  Palette,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  UserX,
  Wrench,
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
      titleKey: 'webAdmin.navigation.groups.general',
      items: [
        {
          titleKey: 'webAdmin.navigation.dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          titleKey: 'webAdmin.navigation.tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          titleKey: 'webAdmin.navigation.apps',
          url: '/apps',
          icon: Package,
        },
        {
          titleKey: 'webAdmin.navigation.chats',
          url: '/chats',
          icon: MessagesSquare,
          badgeKey: 'webAdmin.navigation.badges.chats',
        },
        {
          titleKey: 'webAdmin.navigation.users',
          url: '/users',
          icon: Users,
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
      titleKey: 'webAdmin.navigation.groups.pages',
      items: [
        {
          titleKey: 'webAdmin.navigation.auth',
          url: '/sign-in',
          icon: ShieldCheck,
          items: [
            {
              titleKey: 'webAdmin.navigation.signIn',
              url: '/sign-in',
            },
            {
              titleKey: 'webAdmin.navigation.signUp',
              url: '/sign-up',
            },
            {
              titleKey: 'webAdmin.navigation.forgotPassword',
              url: '/forgot-password',
            },
            {
              titleKey: 'webAdmin.navigation.otp',
              url: '/otp',
            },
          ],
        },
        {
          titleKey: 'webAdmin.navigation.errors',
          url: '/errors/not-found',
          icon: Bug,
          items: [
            {
              titleKey: 'webAdmin.navigation.unauthorized',
              url: '/errors/unauthorized',
              icon: LockKeyhole,
            },
            {
              titleKey: 'webAdmin.navigation.forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              titleKey: 'webAdmin.navigation.notFound',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              titleKey: 'webAdmin.navigation.internalError',
              url: '/errors/internal-server-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      titleKey: 'webAdmin.navigation.groups.other',
      items: [
        {
          titleKey: 'webAdmin.navigation.settings',
          url: '/settings',
          icon: Settings,
          items: [
            {
              titleKey: 'webAdmin.navigation.account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              titleKey: 'webAdmin.navigation.appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              titleKey: 'webAdmin.navigation.notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              titleKey: 'webAdmin.navigation.display',
              url: '/settings/display',
              icon: MonitorCog,
            },
          ],
        },
        {
          titleKey: 'webAdmin.navigation.helpCenter',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
} as const;
