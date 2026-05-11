import type { AdminMessageKey } from '@tetap/i18n/admin';
import type { LucideIcon } from 'lucide-react';

export type AdminNavItem = {
  titleKey: AdminMessageKey;
  url: string;
  icon?: LucideIcon;
  badgeKey?: AdminMessageKey;
  items?: readonly AdminNavItem[];
};

export type AdminNavGroup = {
  titleKey: AdminMessageKey;
  items: readonly AdminNavItem[];
};

export type AdminTeam = {
  nameKey: AdminMessageKey;
  planKey: AdminMessageKey;
  logo: LucideIcon;
};

export type AdminSidebarData = {
  teams: readonly AdminTeam[];
  navGroups: readonly AdminNavGroup[];
};
