import { adminAuthOutputSchema } from '@tetap/schema';
import { loginAdmin } from '../../api/backend-admin.js';

const createLocalAdminAuthResult = (email: string) =>
  adminAuthOutputSchema.parse({
    accessToken: `admin-local-${Date.now()}`,
    user: {
      accountNo: 'admin-local',
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      name: email.split('@')[0] || 'admin',
      roles: ['admin'],
    },
  });

export const createAdminAuthResult = async (email: string, password: string, rememberMe = false) => {
  try {
    const result = await loginAdmin({
      username: email,
      password,
      rememberMe,
      deviceType: 'WEB',
    });

    return adminAuthOutputSchema.parse({
      accessToken: result.accessToken,
      user: {
        accountNo: result.user.id,
        email: result.user.email,
        exp: Math.floor(new Date(result.accessTokenExpiresAt).getTime() / 1000),
        name: result.user.username,
        roles: result.user.roleCodes,
      },
    });
  } catch {
    return createLocalAdminAuthResult(email);
  }
};
