import type { AdminMessageKey } from '@tetap/i18n/admin';
import type { ReactNode, SVGProps } from 'react';
import type { LucideIcon } from 'lucide-react';

export type AdminLogo = (props: SVGProps<SVGSVGElement>) => ReactNode;

export type AdminNavItem = {
  title?: string;
  titleKey?: AdminMessageKey;
  url: string;
  icon?: LucideIcon;
  badgeKey?: AdminMessageKey;
  items?: readonly AdminNavItem[];
};

export type AdminNavGroup = {
  title?: string;
  titleKey?: AdminMessageKey;
  items: readonly AdminNavItem[];
};

export type AdminTeam = {
  nameKey: AdminMessageKey;
  planKey: AdminMessageKey;
  logo: AdminLogo;
};
