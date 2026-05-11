import type { AdminMessageKey } from '@tetap/i18n/admin';

export const adminMenuTitleKeyMap: Partial<Record<string, AdminMessageKey>> = {
  audit: 'webAdmin.navigation.audit',
  dashboard: 'webAdmin.navigation.dashboard',
  fields: 'webAdmin.navigation.fields',
  menus: 'webAdmin.navigation.menus',
  permissions: 'webAdmin.navigation.permissions',
  policies: 'webAdmin.navigation.policies',
  roles: 'webAdmin.navigation.roles',
  security: 'webAdmin.navigation.security',
  sessions: 'webAdmin.navigation.sessions',
  system: 'webAdmin.navigation.systemManagement',
  users: 'webAdmin.navigation.users',
};
