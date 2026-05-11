import { adminAuthOutputSchema } from '@tetap/schema';
import type { AdminSessionMenuNode } from '@tetap/hooks';
import type { IamMenuNode } from '@tetap/schema/iam';
import { loginAdmin } from '../../api/backend-admin.js';

export const toSessionMenus = (menus: readonly IamMenuNode[]): AdminSessionMenuNode[] =>
  menus.map(menu => ({
    id: menu.id,
    name: menu.name,
    path: menu.path,
    component: menu.component,
    icon: menu.icon,
    parentId: menu.parentId,
    permissionCodes: menu.permissionCodes,
    order: menu.order,
    children: toSessionMenus(menu.children),
  }));

export const createAdminAuthResult = async (email: string, password: string, rememberMe = false) => {
  const result = await loginAdmin({
    username: email,
    password,
    rememberMe,
    deviceType: 'WEB',
  });

  const auth = adminAuthOutputSchema.parse({
    accessToken: result.accessToken,
    user: {
      accountNo: result.user.id,
      email: result.user.email,
      exp: Math.floor(new Date(result.accessTokenExpiresAt).getTime() / 1000),
      name: result.user.username,
      roles: result.user.roleCodes,
    },
  });

  return {
    ...auth,
    capabilities: result.capabilities,
    menus: toSessionMenus(result.menus),
  };
};
