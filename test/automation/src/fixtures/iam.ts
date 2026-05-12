import { hashPassword, IamService } from '@tetap/iam';
import type { IamDataSet, PermissionCode } from '@tetap/iam';

const permissions = [
  ['iam:read', 'Read IAM overview', 'API', 'iam', 'read'],
  ['iam:manage', 'Manage IAM settings', 'API', 'iam', 'manage'],
  ['user:read', 'Read users', 'API', 'user', 'read'],
  ['user:update', 'Update users', 'API', 'user', 'update'],
  ['role:read', 'Read roles', 'API', 'role', 'read'],
  ['role:update', 'Update roles', 'API', 'role', 'update'],
  ['menu:read', 'Read menus', 'MENU', 'menu', 'read'],
  ['policy:read', 'Read policies', 'API', 'policy', 'read'],
  ['policy:update', 'Update policies', 'API', 'policy', 'update'],
  ['session:read', 'Read online sessions', 'API', 'session', 'read'],
  ['session:revoke', 'Revoke frontend user sessions', 'API', 'session', 'revoke'],
  ['operation-log:read', 'Read operation logs', 'API', 'operation-log', 'read'],
  ['field:read', 'Read field permissions', 'FIELD', 'field', 'read'],
  ['data:read', 'Read data scopes', 'DATA', 'data', 'read'],
] as const;

export const createIamTestFixtureData = (passwordSalt: string): IamDataSet => ({
  adminUsers: [
    {
      id: 'admin-fixture-1',
      username: 'admin',
      email: 'admin@tetap.local',
      passwordHash: hashPassword('password1', passwordSalt),
      status: 'ACTIVE',
      deptId: '100',
      tenantId: 'tenant-default',
      isSuperAdmin: true,
      roleCodes: ['super-admin'],
      tokenVersion: 1,
    },
    {
      id: 'admin-fixture-2',
      username: 'auditor',
      email: 'auditor@tetap.local',
      passwordHash: hashPassword('password1', passwordSalt),
      status: 'ACTIVE',
      deptId: '200',
      tenantId: 'tenant-default',
      isSuperAdmin: false,
      roleCodes: ['security-auditor'],
      tokenVersion: 1,
    },
  ],
  adminSessions: [],
  frontendUsers: [],
  frontendSessions: [],
  tokenBlacklist: [],
  roles: [
    {
      id: 'role-fixture-1',
      name: 'Super Admin',
      code: 'super-admin',
      description: 'Full IAM and platform administration.',
      permissionCodes: permissions.map(([code]) => code as PermissionCode),
      dataScope: { type: 'ALL' },
    },
    {
      id: 'role-fixture-2',
      name: 'Security Auditor',
      code: 'security-auditor',
      description: 'Read-only security and operation log visibility.',
      permissionCodes: [
        'iam:read',
        'user:read',
        'role:read',
        'policy:read',
        'session:read',
        'operation-log:read',
        'field:read',
        'data:read',
      ],
      dataScope: { type: 'DEPT_AND_CHILD', deptIds: ['200', '201'], deptField: 'deptId' },
    },
  ],
  permissions: permissions.map(([code, name, type, resource, action], index) => ({
    id: `permission-fixture-${index + 1}`,
    code: code as PermissionCode,
    name,
    type,
    resource,
    action,
  })),
  menus: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      component: 'AdminDashboardPage',
      icon: 'LayoutDashboard',
      permissionCodes: [],
      order: 1,
    },
    {
      id: 'system',
      name: 'System Management',
      path: '/system',
      component: 'AdminSystemRedirectPage',
      icon: 'Settings',
      permissionCodes: [],
      order: 10,
    },
    {
      id: 'users',
      name: 'Users',
      path: '/system/user',
      component: 'AdminUsersPage',
      icon: 'Users',
      parentId: 'system',
      permissionCodes: ['user:read'],
      order: 11,
    },
    {
      id: 'roles',
      name: 'Roles',
      path: '/system/role',
      component: 'AdminRolesPage',
      icon: 'UserCog',
      parentId: 'system',
      permissionCodes: ['role:read'],
      order: 12,
    },
    {
      id: 'permissions',
      name: 'Permissions',
      path: '/system/permission',
      component: 'AdminPermissionsPage',
      icon: 'KeyRound',
      parentId: 'system',
      permissionCodes: ['iam:read'],
      order: 13,
    },
    {
      id: 'menus',
      name: 'Menus',
      path: '/system/menu',
      component: 'AdminMenusPage',
      icon: 'LayoutDashboard',
      parentId: 'system',
      permissionCodes: ['menu:read'],
      order: 14,
    },
    {
      id: 'fields',
      name: 'Field Permissions',
      path: '/system/field',
      component: 'AdminFieldPermissionsPage',
      icon: 'KeyRound',
      parentId: 'system',
      permissionCodes: ['field:read'],
      order: 15,
    },
    {
      id: 'policies',
      name: 'Policies',
      path: '/system/policy',
      component: 'AdminPoliciesPage',
      icon: 'ShieldCheck',
      parentId: 'system',
      permissionCodes: ['policy:read'],
      order: 16,
    },
    {
      id: 'operation-logs',
      name: 'Operation Logs',
      path: '/system/operation-log',
      component: 'AdminOperationLogsPage',
      icon: 'LockKeyhole',
      parentId: 'system',
      permissionCodes: ['operation-log:read'],
      order: 17,
    },
    {
      id: 'sessions',
      name: 'Online Users',
      path: '/system/session',
      component: 'AdminSessionsPage',
      icon: 'MonitorCog',
      parentId: 'system',
      permissionCodes: ['session:read'],
      order: 18,
    },
  ],
  fieldPermissions: [
    {
      id: 'field-permission-fixture-1',
      roleCode: 'security-auditor',
      resource: 'user',
      fieldName: 'email',
      permissionType: 'MASK',
    },
    {
      id: 'field-permission-fixture-2',
      roleCode: 'security-auditor',
      resource: 'user',
      fieldName: 'phone',
      permissionType: 'MASK',
    },
    {
      id: 'field-permission-fixture-3',
      roleCode: 'security-auditor',
      resource: 'user',
      fieldName: 'idCard',
      permissionType: 'HIDE',
    },
  ],
  policies: [
    {
      id: 'policy-fixture-1',
      resource: 'session',
      action: 'revoke',
      effect: 'ALLOW',
      conditions: {
        any: [
          {
            source: 'user',
            path: 'isSuperAdmin',
            operator: 'eq',
            value: true,
          },
          {
            source: 'user',
            path: 'roleCodes',
            operator: 'contains',
            value: 'security-auditor',
          },
        ],
      },
    },
    {
      id: 'policy-fixture-2',
      resource: 'policy',
      action: 'update',
      effect: 'DENY',
      conditions: {
        all: [
          {
            source: 'environment',
            path: 'riskLevel',
            operator: 'eq',
            value: 'high',
          },
        ],
      },
    },
  ],
  operationLogs: [],
});

export const createIamTestFixtureService = (passwordSalt = 'unit-salt') =>
  new IamService(createIamTestFixtureData(passwordSalt), {
    accessTokenSecret: 'unit-access-secret',
    refreshTokenSecret: 'unit-refresh-secret',
    passwordSalt,
  });

export const createManagedIamTestFixtureService = (passwordSalt = 'unit-salt') => {
  const iam = createIamTestFixtureService(passwordSalt) as IamService & { close: () => Promise<void> };

  iam.close = async () => {};

  return iam;
};
