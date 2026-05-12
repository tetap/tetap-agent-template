import { existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { configBaseEnvFile, configLocalEnvFile, getConfigEnvFile, readAppEnv } from '@tetap/config';
import { hashPassword } from '@tetap/iam';
import { PrismaClient } from '@tetap/prisma';
import type { EnvSource } from '@tetap/config';

const defaultTenantId = 'tenant-default';
const superAdminRoleCode = 'super-admin';
const auditorRoleCode = 'security-auditor';
const toPrismaJson = (value: unknown) => value as never;

type BootstrapPermission = {
  id: string;
  code: string;
  name: string;
  type: string;
  resource: string;
  action: string;
};

type BootstrapMenu = {
  id: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  parentId?: string;
  permissionCodes: string[];
  order: number;
};

type BootstrapRole = {
  id: string;
  code: string;
  name: string;
  description: string;
  permissionCodes: string[];
  dataScopeType: string;
  dataScopeConfig: Record<string, unknown>;
};

const permissions: BootstrapPermission[] = [
  { id: 'perm-iam-read', code: 'iam:read', name: 'Read IAM overview', type: 'API', resource: 'iam', action: 'read' },
  { id: 'perm-iam-manage', code: 'iam:manage', name: 'Manage IAM', type: 'API', resource: 'iam', action: 'manage' },
  { id: 'perm-user-read', code: 'user:read', name: 'Read admin users', type: 'API', resource: 'user', action: 'read' },
  {
    id: 'perm-user-update',
    code: 'user:update',
    name: 'Manage admin users',
    type: 'API',
    resource: 'user',
    action: 'update',
  },
  { id: 'perm-role-read', code: 'role:read', name: 'Read roles', type: 'API', resource: 'role', action: 'read' },
  {
    id: 'perm-role-update',
    code: 'role:update',
    name: 'Manage roles',
    type: 'API',
    resource: 'role',
    action: 'update',
  },
  { id: 'perm-menu-read', code: 'menu:read', name: 'Read menus', type: 'MENU', resource: 'menu', action: 'read' },
  {
    id: 'perm-policy-read',
    code: 'policy:read',
    name: 'Read policies',
    type: 'API',
    resource: 'policy',
    action: 'read',
  },
  {
    id: 'perm-policy-update',
    code: 'policy:update',
    name: 'Manage policies',
    type: 'API',
    resource: 'policy',
    action: 'update',
  },
  {
    id: 'perm-session-read',
    code: 'session:read',
    name: 'Read online frontend users',
    type: 'API',
    resource: 'session',
    action: 'read',
  },
  {
    id: 'perm-session-revoke',
    code: 'session:revoke',
    name: 'Force frontend users offline',
    type: 'API',
    resource: 'session',
    action: 'revoke',
  },
  {
    id: 'perm-operation-log-read',
    code: 'operation-log:read',
    name: 'Read operation logs',
    type: 'API',
    resource: 'operation-log',
    action: 'read',
  },
  {
    id: 'perm-field-read',
    code: 'field:read',
    name: 'Read field permissions',
    type: 'FIELD',
    resource: 'field',
    action: 'read',
  },
  { id: 'perm-data-read', code: 'data:read', name: 'Read data scopes', type: 'DATA', resource: 'data', action: 'read' },
];

const menus: BootstrapMenu[] = [
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
];

const roles: BootstrapRole[] = [
  {
    id: 'role-super-admin',
    code: superAdminRoleCode,
    name: 'Super Admin',
    description: 'Full IAM and platform administration.',
    permissionCodes: permissions.map(permission => permission.code),
    dataScopeType: 'ALL',
    dataScopeConfig: { type: 'ALL' },
  },
  {
    id: 'role-security-auditor',
    code: auditorRoleCode,
    name: 'Security Auditor',
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
    dataScopeType: 'DEPT_AND_CHILD',
    dataScopeConfig: { type: 'DEPT_AND_CHILD', deptIds: ['200', '201'], deptField: 'deptId' },
  },
];

const fieldPermissions = [
  {
    id: 'field-security-auditor-user-email',
    roleCode: auditorRoleCode,
    resource: 'user',
    fieldName: 'email',
    permissionType: 'MASK',
  },
  {
    id: 'field-security-auditor-user-phone',
    roleCode: auditorRoleCode,
    resource: 'user',
    fieldName: 'phone',
    permissionType: 'MASK',
  },
  {
    id: 'field-security-auditor-user-id-card',
    roleCode: auditorRoleCode,
    resource: 'user',
    fieldName: 'idCard',
    permissionType: 'HIDE',
  },
] as const;

const policies = [
  {
    id: 'policy-session-revoke-super-admin',
    resource: 'session',
    action: 'revoke',
    effect: 'ALLOW',
    conditions: { all: [{ source: 'user', path: 'isSuperAdmin', operator: 'eq', value: true }] },
    description: 'Allow active super administrators to force frontend users offline.',
    enabled: true,
  },
] as const;

const parseEnvLine = (line: string) => {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return undefined;
  }

  const separatorIndex = trimmed.indexOf('=');

  if (separatorIndex < 1) {
    return undefined;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return [key, value] as const;
};

const readEnvFile = (filePath: string): EnvSource => {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce<EnvSource>((env, line) => {
      const parsedLine = parseEnvLine(line);

      if (parsedLine) {
        const [key, value] = parsedLine;
        env[key] = value;
      }

      return env;
    }, {});
};

const loadEnv = (): EnvSource => {
  const mode = process.env.NODE_ENV ?? 'development';

  return {
    ...readEnvFile(configBaseEnvFile),
    ...readEnvFile(getConfigEnvFile(mode)),
    ...readEnvFile(configLocalEnvFile),
    ...process.env,
  };
};

const readOptionalBootstrapValue = (source: EnvSource, key: string, fallback: string) => source[key] ?? fallback;

const readRequiredBootstrapValue = (source: EnvSource, key: string) => {
  const value = source[key];

  if (!value) {
    throw new Error(`Missing required bootstrap environment variable: ${key}`);
  }

  return value;
};

const assertPasswordPolicy = (password: string) => {
  if (password.length < 12 || password.length > 128) {
    throw new Error('IAM_BOOTSTRAP_ADMIN_PASSWORD must be 12 to 128 characters.');
  }
};

const upsertPermission = async (prisma: PrismaClient, permission: BootstrapPermission) => {
  await prisma.permission.upsert({
    where: { code: permission.code },
    create: permission,
    update: {
      name: permission.name,
      type: permission.type,
      resource: permission.resource,
      action: permission.action,
    },
  });
};

const upsertRole = async (prisma: PrismaClient, role: BootstrapRole) => {
  await prisma.role.upsert({
    where: { code: role.code },
    create: {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      dataScopeType: role.dataScopeType,
      dataScopeConfig: toPrismaJson(role.dataScopeConfig),
      tenantId: defaultTenantId,
    },
    update: {
      name: role.name,
      description: role.description,
      dataScopeType: role.dataScopeType,
      dataScopeConfig: toPrismaJson(role.dataScopeConfig),
      tenantId: defaultTenantId,
    },
  });
};

const replaceRolePermissions = async (prisma: PrismaClient, roleCode: string, permissionCodes: string[]) => {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode }, select: { id: true } });
  const grantedPermissions = await prisma.permission.findMany({
    where: { code: { in: permissionCodes } },
    select: { id: true },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: grantedPermissions.map(permission => ({ roleId: role.id, permissionId: permission.id })),
    skipDuplicates: true,
  });
};

const replaceMenuPermissions = async (prisma: PrismaClient, menu: BootstrapMenu) => {
  const grantedPermissions = await prisma.permission.findMany({
    where: { code: { in: menu.permissionCodes } },
    select: { id: true },
  });

  await prisma.menuPermission.deleteMany({ where: { menuId: menu.id } });
  await prisma.menuPermission.createMany({
    data: grantedPermissions.map(permission => ({ menuId: menu.id, permissionId: permission.id })),
    skipDuplicates: true,
  });
};

const upsertMenu = async (prisma: PrismaClient, menu: BootstrapMenu) => {
  await prisma.menu.upsert({
    where: { id: menu.id },
    create: {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      parentId: menu.parentId,
      order: menu.order,
      tenantId: defaultTenantId,
    },
    update: {
      name: menu.name,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      parentId: menu.parentId,
      order: menu.order,
      tenantId: defaultTenantId,
    },
  });

  await replaceMenuPermissions(prisma, menu);
};

const upsertFieldPermission = async (prisma: PrismaClient, fieldPermission: (typeof fieldPermissions)[number]) => {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: fieldPermission.roleCode }, select: { id: true } });
  const existing = await prisma.fieldPermission.findFirst({
    where: { roleId: role.id, resource: fieldPermission.resource, fieldName: fieldPermission.fieldName },
    select: { id: true },
  });

  if (existing) {
    await prisma.fieldPermission.update({
      where: { id: existing.id },
      data: { permissionType: fieldPermission.permissionType, tenantId: defaultTenantId },
    });
    return;
  }

  await prisma.fieldPermission.create({
    data: {
      id: fieldPermission.id,
      roleId: role.id,
      resource: fieldPermission.resource,
      fieldName: fieldPermission.fieldName,
      permissionType: fieldPermission.permissionType,
      tenantId: defaultTenantId,
    },
  });
};

const upsertPolicies = async (prisma: PrismaClient) => {
  for (const policy of policies) {
    await prisma.policy.upsert({
      where: { id: policy.id },
      create: { ...policy, conditions: toPrismaJson(policy.conditions), tenantId: defaultTenantId },
      update: {
        resource: policy.resource,
        action: policy.action,
        effect: policy.effect,
        conditions: toPrismaJson(policy.conditions),
        description: policy.description,
        enabled: policy.enabled,
        tenantId: defaultTenantId,
      },
    });
  }
};

const upsertBootstrapAdmin = async (
  prisma: PrismaClient,
  input: { username: string; email: string; password: string; name?: string; passwordSalt: string },
) => {
  const emailOwner = await prisma.adminUser.findUnique({
    where: { email: input.email },
    select: { id: true, username: true },
  });

  if (emailOwner && emailOwner.username !== input.username) {
    throw new Error(`Admin email ${input.email} is already used by ${emailOwner.username}.`);
  }

  const admin = await prisma.adminUser.upsert({
    where: { username: input.username },
    create: {
      id: 'admin-bootstrap-root',
      username: input.username,
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(input.password, input.passwordSalt),
      status: 'ACTIVE',
      deptId: '100',
      tenantId: defaultTenantId,
      isSuperAdmin: true,
      tokenVersion: 1,
    },
    update: {
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(input.password, input.passwordSalt),
      status: 'ACTIVE',
      deptId: '100',
      tenantId: defaultTenantId,
      isSuperAdmin: true,
      tokenVersion: { increment: 1 },
    },
  });

  const role = await prisma.role.findUniqueOrThrow({ where: { code: superAdminRoleCode }, select: { id: true } });

  await prisma.adminUserRole.deleteMany({ where: { adminUserId: admin.id } });
  await prisma.adminUserRole.create({
    data: { adminUserId: admin.id, roleId: role.id },
  });

  return admin;
};

const run = async () => {
  const source = loadEnv();
  const env = readAppEnv(source);
  const username = readOptionalBootstrapValue(source, 'IAM_BOOTSTRAP_ADMIN_USERNAME', 'admin');
  const email = readOptionalBootstrapValue(source, 'IAM_BOOTSTRAP_ADMIN_EMAIL', 'admin@tetap.local');
  const name = readOptionalBootstrapValue(source, 'IAM_BOOTSTRAP_ADMIN_NAME', 'Administrator');
  const password = readRequiredBootstrapValue(source, 'IAM_BOOTSTRAP_ADMIN_PASSWORD');

  assertPasswordPolicy(password);

  const prisma = new PrismaClient();

  try {
    for (const permission of permissions) {
      await upsertPermission(prisma, permission);
    }

    for (const role of roles) {
      await upsertRole(prisma, role);
      await replaceRolePermissions(prisma, role.code, role.permissionCodes);
    }

    for (const menu of menus) {
      await upsertMenu(prisma, menu);
    }

    for (const fieldPermission of fieldPermissions) {
      await upsertFieldPermission(prisma, fieldPermission);
    }

    await upsertPolicies(prisma);

    const admin = await upsertBootstrapAdmin(prisma, {
      username,
      email,
      name,
      password,
      passwordSalt: env.AUTH_SALT,
    });

    await prisma.operationLog.create({
      data: {
        id: randomUUID(),
        operator: 'system.bootstrap',
        operatorAdminUserId: admin.id,
        operation: 'IAM_MUTATION',
        operationItem: 'bootstrap:admin',
        operationDetail: toPrismaJson({ username: admin.username, email: admin.email, roleCode: superAdminRoleCode }),
        operationTime: new Date(),
        operationIp: '127.0.0.1',
        resource: 'iam',
        resourceId: admin.id,
        result: 'SUCCESS',
        tenantId: defaultTenantId,
      },
    });

    console.log('Backend-admin IAM bootstrap completed.');
    console.log(`Admin username: ${admin.username}`);
    console.log(`Admin email: ${admin.email}`);
    console.log('Admin password: value from IAM_BOOTSTRAP_ADMIN_PASSWORD');
  } finally {
    await prisma.$disconnect();
  }
};

run().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
