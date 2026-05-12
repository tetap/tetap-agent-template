import {
  iamCurrentUserResponseSchema,
  iamFieldPermissionMutationResponseSchema,
  iamLoginResponseSchema,
  iamOverviewResponseSchema,
  iamPermissionMutationResponseSchema,
  iamPolicyMutationResponseSchema,
  iamRoleMutationResponseSchema,
  iamSessionsResponseSchema,
  iamUserMutationResponseSchema,
} from '@tetap/schema/iam';
import type { AppEnv } from '@tetap/config';
import { describe, expect, it } from 'vitest';
import { buildBackendAdminApp } from '../../../../apps/backend-admin/src/app.js';

const smokeEnv = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 0,
  BACKEND_ADMIN_HOST: '127.0.0.1',
  BACKEND_ADMIN_PORT: 0,
  DATABASE_URL: 'mysql://root:password@127.0.0.1:3306/tetap',
  CORS_ORIGINS: ['http://127.0.0.1:5174'],
  BODY_LIMIT_BYTES: 1024 * 1024,
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: '1 minute',
  APP_ID: 'tetap-admin-smoke-app',
  APP_SECRET: 'tetap-admin-smoke-secret',
  AUTH_SECRET: 'tetap-auth-secret',
  REFRESH_AUTH_SECRET: 'tetap-refresh-auth-secret',
  AUTH_SALT: 'tetap-auth-salt',
  AUTH_ACCESS_TOKEN_TTL_SECONDS: 900,
  AUTH_REFRESH_TOKEN_TTL_SECONDS: 604800,
  AES_SECRET_KEY: '12345678901234567890123456789012',
  AES_IV: '1234567890123456',
  ENABLE_DEMO_SEED: false,
  SKIP_ROUTES: [],
} satisfies AppEnv;

describe('backend-admin smoke: IAM auth and management APIs', () => {
  it('signs in, reads protected IAM data, mutates IAM records, and keeps online users scoped to frontend sessions', async () => {
    const app = await buildBackendAdminApp({ env: smokeEnv });

    try {
      const loginResponse = await app.inject({
        headers: {
          'accept-language': 'en-US',
        },
        method: 'POST',
        payload: {
          username: 'admin',
          password: 'password1',
          deviceType: 'WEB',
        },
        url: '/auth/login',
      });
      const loginBody = iamLoginResponseSchema.parse(loginResponse.json());
      const authorization = `Bearer ${loginBody.data.accessToken}`;

      expect(loginResponse.statusCode).toBe(200);
      expect(loginBody.data.capabilities).toContain('iam:read');

      const currentUserResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'GET',
        url: '/auth/me',
      });
      const currentUserBody = iamCurrentUserResponseSchema.parse(currentUserResponse.json());

      expect(currentUserResponse.statusCode).toBe(200);
      expect(currentUserBody.data.user.username).toBe('admin');
      expect(currentUserBody.data.menus.length).toBeGreaterThan(0);

      const overviewResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'GET',
        url: '/iam/overview',
      });
      const overviewBody = iamOverviewResponseSchema.parse(overviewResponse.json());

      expect(overviewResponse.statusCode).toBe(200);
      expect(overviewBody.data.metrics.permissions).toBeGreaterThan(0);

      const permissionResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'POST',
        payload: {
          code: 'report:read',
          name: 'Read reports',
          type: 'API',
          resource: 'report',
          action: 'read',
        },
        url: '/iam/permissions',
      });
      const permissionBody = iamPermissionMutationResponseSchema.parse(permissionResponse.json());

      expect(permissionResponse.statusCode).toBe(200);
      expect(permissionBody.data.code).toBe('report:read');

      const roleResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'POST',
        payload: {
          name: 'Report Auditor',
          code: 'report-auditor',
          permissionCodes: ['report:read'],
          dataScope: { type: 'SELF' },
        },
        url: '/iam/roles',
      });
      const roleBody = iamRoleMutationResponseSchema.parse(roleResponse.json());

      expect(roleResponse.statusCode).toBe(200);
      expect(roleBody.data.permissionCodes).toContain('report:read');

      const userResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'POST',
        payload: {
          username: 'reporter',
          email: 'reporter@example.com',
          password: 'password1',
          roleCodes: ['report-auditor'],
          deptId: '200',
        },
        url: '/iam/users',
      });
      const userBody = iamUserMutationResponseSchema.parse(userResponse.json());

      expect(userResponse.statusCode).toBe(200);
      expect(userBody.data.roleCodes).toContain('report-auditor');

      const fieldPermissionResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'POST',
        payload: {
          roleCode: 'report-auditor',
          resource: 'user',
          fieldName: 'email',
          permissionType: 'MASK',
        },
        url: '/iam/field-permissions',
      });
      const fieldPermissionBody = iamFieldPermissionMutationResponseSchema.parse(fieldPermissionResponse.json());

      expect(fieldPermissionResponse.statusCode).toBe(200);
      expect(fieldPermissionBody.data.permissionType).toBe('MASK');

      const policyResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'POST',
        payload: {
          resource: 'report',
          action: 'read',
          effect: 'ALLOW',
          conditions: {
            any: [{ source: 'user', path: 'roleCodes', operator: 'contains', value: 'report-auditor' }],
          },
        },
        url: '/iam/policies',
      });
      const policyBody = iamPolicyMutationResponseSchema.parse(policyResponse.json());

      expect(policyResponse.statusCode).toBe(200);
      expect(policyBody.data.resource).toBe('report');

      const protectedRoleDeleteResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'DELETE',
        url: `/iam/roles/${roleBody.data.id}`,
      });

      expect(protectedRoleDeleteResponse.statusCode).toBe(403);

      const userDeleteResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'DELETE',
        url: `/iam/users/${userBody.data.id}`,
      });
      const deletedUserBody = iamUserMutationResponseSchema.parse(userDeleteResponse.json());

      expect(userDeleteResponse.statusCode).toBe(200);
      expect(deletedUserBody.data.username).toBe('reporter');

      const sessionsResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'GET',
        url: '/iam/sessions',
      });
      const sessionsBody = iamSessionsResponseSchema.parse(sessionsResponse.json());

      expect(sessionsResponse.statusCode).toBe(200);
      expect(sessionsBody.data).toEqual([]);

      const stillAuthenticatedResponse = await app.inject({
        headers: {
          authorization,
          'accept-language': 'en-US',
        },
        method: 'GET',
        url: '/auth/me',
      });

      expect(stillAuthenticatedResponse.statusCode).toBe(200);
    } finally {
      await app.close();
    }
  });
});
