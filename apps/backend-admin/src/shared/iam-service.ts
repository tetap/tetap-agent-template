import { PrismaClient } from '@tetap/prisma';
import { IamService } from '@tetap/iam';
import type { AppEnv } from '@tetap/config';
import type {
  DataScope,
  DataScopeType,
  DeviceType,
  FieldPermission,
  FieldPermissionType,
  IamDataSet,
  IamFrontendUser,
  IamMenu,
  IamPermission,
  IamPersistenceAdapter,
  IamPolicy,
  IamRole,
  IamSession,
  IamUser,
  OperationLog,
  PermissionCode,
  PermissionType,
  PolicyConditions,
  PolicyEffect,
  SessionStatus,
  UserStatus,
} from '@tetap/iam';

export type ManagedIamService = IamService & {
  close: () => Promise<void>;
};

const defaultTenantId = 'tenant-default';

const toIso = (date: Date) => date.toISOString();

const toDate = (iso: string) => new Date(iso);

const toOptional = <TValue>(value: TValue | null | undefined) => value ?? undefined;

const toPrismaJson = (value: unknown) => value as never;

const parseJsonObject = <TValue extends Record<string, unknown>>(value: unknown, fallback: TValue): TValue =>
  value && typeof value === 'object' && !Array.isArray(value) ? ({ ...fallback, ...value } as TValue) : fallback;

const toDataScope = (role: { dataScopeType: string; dataScopeConfig: unknown }): DataScope => ({
  ...parseJsonObject<Omit<DataScope, 'type'>>(role.dataScopeConfig, {}),
  type: role.dataScopeType as DataScopeType,
});

const rolePermissionCodes = (role: { permissions: Array<{ permission: { code: string } }> }) =>
  role.permissions.map(item => item.permission.code as PermissionCode);

const mapAdminUser = (user: {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  status: string;
  deptId: string | null;
  tenantId: string | null;
  isSuperAdmin: boolean;
  tokenVersion: number;
  roles: Array<{ role: { code: string } }>;
}): IamUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  passwordHash: user.passwordHash,
  status: user.status as UserStatus,
  deptId: user.deptId ?? '0',
  tenantId: user.tenantId ?? defaultTenantId,
  isSuperAdmin: user.isSuperAdmin,
  roleCodes: user.roles.map(item => item.role.code),
  tokenVersion: user.tokenVersion,
});

const mapFrontendUser = (user: {
  id: string;
  username: string;
  email: string;
  status: string;
  deptId: string | null;
  tenantId: string | null;
}): IamFrontendUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  status: user.status as UserStatus,
  deptId: user.deptId ?? '0',
  tenantId: user.tenantId ?? defaultTenantId,
});

const mapRole = (role: {
  id: string;
  name: string;
  code: string;
  description: string | null;
  dataScopeType: string;
  dataScopeConfig: unknown;
  permissions: Array<{ permission: { code: string } }>;
}): IamRole => ({
  id: role.id,
  name: role.name,
  code: role.code,
  description: toOptional(role.description),
  permissionCodes: rolePermissionCodes(role),
  dataScope: toDataScope(role),
});

const mapPermission = (permission: {
  id: string;
  code: string;
  name: string;
  type: string;
  resource: string;
  action: string;
}): IamPermission => ({
  id: permission.id,
  code: permission.code as PermissionCode,
  name: permission.name,
  type: permission.type as PermissionType,
  resource: permission.resource,
  action: permission.action,
});

const mapMenu = (menu: {
  id: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  parentId: string | null;
  order: number;
  permissions: Array<{ permission: { code: string } }>;
}): IamMenu => ({
  id: menu.id,
  name: menu.name,
  path: menu.path,
  component: menu.component,
  icon: menu.icon,
  parentId: toOptional(menu.parentId),
  permissionCodes: menu.permissions.map(item => item.permission.code as PermissionCode),
  order: menu.order,
});

const mapFieldPermission = (fieldPermission: {
  id: string;
  role: { code: string };
  resource: string;
  fieldName: string;
  permissionType: string;
}): FieldPermission => ({
  id: fieldPermission.id,
  roleCode: fieldPermission.role.code,
  resource: fieldPermission.resource,
  fieldName: fieldPermission.fieldName,
  permissionType: fieldPermission.permissionType as FieldPermissionType,
});

const mapPolicy = (policy: {
  id: string;
  resource: string;
  action: string;
  effect: string;
  conditions: unknown;
  description: string | null;
  enabled: boolean;
}): IamPolicy => ({
  id: policy.id,
  resource: policy.resource,
  action: policy.action,
  effect: policy.effect as PolicyEffect,
  conditions: parseJsonObject<PolicyConditions>(policy.conditions, {}),
  description: toOptional(policy.description),
  enabled: policy.enabled,
});

const mapSession = (session: {
  id: string;
  userId?: string;
  adminUserId?: string;
  tokenId: string;
  deviceType: string;
  ip: string;
  userAgent: string;
  loginTime: Date;
  lastActiveTime: Date;
  expiresAt: Date;
  status: string;
  revokedAt: Date | null;
  revokedReason: string | null;
}): IamSession => ({
  id: session.id,
  userId: session.userId ?? session.adminUserId ?? '',
  tokenId: session.tokenId,
  deviceType: session.deviceType as DeviceType,
  ip: session.ip,
  userAgent: session.userAgent,
  loginTime: toIso(session.loginTime),
  lastActiveTime: toIso(session.lastActiveTime),
  expiresAt: toIso(session.expiresAt),
  status: session.status as SessionStatus,
  revokedAt: session.revokedAt ? toIso(session.revokedAt) : undefined,
  revokedReason: toOptional(session.revokedReason),
});

const mapOperationLog = (log: {
  id: string;
  operator: string;
  operatorAdminUserId: string | null;
  operation: string;
  operationItem: string;
  operationDetail: unknown;
  operationTime: Date;
  operationIp: string | null;
  resource: string;
  resourceId: string | null;
  userAgent: string | null;
  result: string;
}): OperationLog => ({
  id: log.id,
  operator: log.operator,
  operatorUserId: toOptional(log.operatorAdminUserId),
  operation: log.operation as OperationLog['operation'],
  operationItem: log.operationItem,
  operationDetail: parseJsonObject(log.operationDetail, {}),
  operationTime: toIso(log.operationTime),
  operationIp: toOptional(log.operationIp),
  resource: log.resource,
  resourceId: toOptional(log.resourceId),
  userAgent: toOptional(log.userAgent),
  result: log.result as OperationLog['result'],
});

const loadIamDataSet = async (prisma: PrismaClient): Promise<IamDataSet> => {
  const [
    adminUsers,
    adminSessions,
    frontendUsers,
    frontendSessions,
    tokenBlacklist,
    roles,
    permissions,
    menus,
    fieldPermissions,
    policies,
    operationLogs,
  ] = await Promise.all([
    prisma.adminUser.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { username: 'asc' },
    }),
    prisma.adminUserSession.findMany({ where: { status: 'ONLINE' } }),
    prisma.user.findMany({ orderBy: { username: 'asc' } }),
    prisma.userSession.findMany({ where: { status: 'ONLINE' } }),
    prisma.tokenBlacklist.findMany({ where: { expiresAt: { gt: new Date() } } }),
    prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { code: 'asc' },
    }),
    prisma.permission.findMany({ orderBy: { code: 'asc' } }),
    prisma.menu.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { order: 'asc' },
    }),
    prisma.fieldPermission.findMany({ include: { role: true }, orderBy: { resource: 'asc' } }),
    prisma.policy.findMany({ orderBy: { resource: 'asc' } }),
    prisma.operationLog.findMany({ orderBy: { operationTime: 'desc' }, take: 500 }),
  ]);

  const activeSuperAdminExists = adminUsers.some(user => user.isSuperAdmin && user.status === 'ACTIVE');

  if (!activeSuperAdminExists) {
    throw new Error(
      'IAM persistence is not initialized: create at least one active super administrator in the database.',
    );
  }

  return {
    adminUsers: adminUsers.map(mapAdminUser),
    adminSessions: adminSessions.map(session => mapSession({ ...session, adminUserId: session.adminUserId })),
    frontendUsers: frontendUsers.map(mapFrontendUser),
    frontendSessions: frontendSessions.map(session => mapSession({ ...session, userId: session.userId })),
    tokenBlacklist: tokenBlacklist.map(token => ({ tokenId: token.tokenId, expiresAt: toIso(token.expiresAt) })),
    roles: roles.map(mapRole),
    permissions: permissions.map(mapPermission),
    menus: menus.map(mapMenu),
    fieldPermissions: fieldPermissions.map(mapFieldPermission),
    policies: policies.map(mapPolicy),
    operationLogs: operationLogs.map(mapOperationLog),
  };
};

const replaceAdminUserRoles = async (prisma: PrismaClient, user: IamUser) => {
  const roles = await prisma.role.findMany({ where: { code: { in: user.roleCodes } }, select: { id: true } });

  await prisma.adminUserRole.deleteMany({ where: { adminUserId: user.id } });
  await prisma.adminUserRole.createMany({
    data: roles.map(role => ({ adminUserId: user.id, roleId: role.id })),
    skipDuplicates: true,
  });
};

const replaceRolePermissions = async (prisma: PrismaClient, role: IamRole) => {
  const permissions = await prisma.permission.findMany({
    where: { code: { in: role.permissionCodes } },
    select: { id: true },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.rolePermission.createMany({
    data: permissions.map(permission => ({ roleId: role.id, permissionId: permission.id })),
    skipDuplicates: true,
  });
};

const replaceMenuPermissions = async (prisma: PrismaClient, menu: IamMenu) => {
  const permissions = await prisma.permission.findMany({
    where: { code: { in: menu.permissionCodes } },
    select: { id: true },
  });

  await prisma.menuPermission.deleteMany({ where: { menuId: menu.id } });
  await prisma.menuPermission.createMany({
    data: permissions.map(permission => ({ menuId: menu.id, permissionId: permission.id })),
    skipDuplicates: true,
  });
};

const createPersistenceAdapter = (prisma: PrismaClient): IamPersistenceAdapter => ({
  async upsertAdminUser(user) {
    await prisma.adminUser.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        status: user.status,
        deptId: user.deptId,
        tenantId: user.tenantId,
        isSuperAdmin: user.isSuperAdmin,
        tokenVersion: user.tokenVersion,
      },
      update: {
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        status: user.status,
        deptId: user.deptId,
        tenantId: user.tenantId,
        isSuperAdmin: user.isSuperAdmin,
        tokenVersion: user.tokenVersion,
      },
    });
    await replaceAdminUserRoles(prisma, user);
  },
  async deleteAdminUser(userId) {
    await prisma.adminUser.delete({ where: { id: userId } });
  },
  async upsertRole(role) {
    await prisma.role.upsert({
      where: { id: role.id },
      create: {
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        dataScopeType: role.dataScope.type,
        dataScopeConfig: toPrismaJson(role.dataScope),
      },
      update: {
        name: role.name,
        code: role.code,
        description: role.description,
        dataScopeType: role.dataScope.type,
        dataScopeConfig: toPrismaJson(role.dataScope),
      },
    });
    await replaceRolePermissions(prisma, role);
  },
  async deleteRole(roleId) {
    await prisma.role.delete({ where: { id: roleId } });
  },
  async upsertPermission(permission) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      create: permission,
      update: {
        code: permission.code,
        name: permission.name,
        type: permission.type,
        resource: permission.resource,
        action: permission.action,
      },
    });
  },
  async deletePermission(permissionId) {
    await prisma.permission.delete({ where: { id: permissionId } });
  },
  async upsertMenu(menu) {
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
      },
      update: {
        name: menu.name,
        path: menu.path,
        component: menu.component,
        icon: menu.icon,
        parentId: menu.parentId,
        order: menu.order,
      },
    });
    await replaceMenuPermissions(prisma, menu);
  },
  async deleteMenu(menuId) {
    await prisma.menu.delete({ where: { id: menuId } });
  },
  async upsertFieldPermission(fieldPermission) {
    const role = await prisma.role.findUniqueOrThrow({ where: { code: fieldPermission.roleCode } });

    await prisma.fieldPermission.upsert({
      where: { id: fieldPermission.id },
      create: {
        id: fieldPermission.id,
        roleId: role.id,
        resource: fieldPermission.resource,
        fieldName: fieldPermission.fieldName,
        permissionType: fieldPermission.permissionType,
      },
      update: {
        roleId: role.id,
        resource: fieldPermission.resource,
        fieldName: fieldPermission.fieldName,
        permissionType: fieldPermission.permissionType,
      },
    });
  },
  async deleteFieldPermission(fieldPermissionId) {
    await prisma.fieldPermission.delete({ where: { id: fieldPermissionId } });
  },
  async upsertPolicy(policy) {
    await prisma.policy.upsert({
      where: { id: policy.id },
      create: {
        id: policy.id,
        resource: policy.resource,
        action: policy.action,
        effect: policy.effect,
        conditions: toPrismaJson(policy.conditions),
        description: policy.description,
        enabled: policy.enabled ?? true,
      },
      update: {
        resource: policy.resource,
        action: policy.action,
        effect: policy.effect,
        conditions: toPrismaJson(policy.conditions),
        description: policy.description,
        enabled: policy.enabled ?? true,
      },
    });
  },
  async deletePolicy(policyId) {
    await prisma.policy.delete({ where: { id: policyId } });
  },
  async upsertAdminSession(session) {
    await prisma.adminUserSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        adminUserId: session.userId,
        tokenId: session.tokenId,
        deviceType: session.deviceType,
        ip: session.ip,
        userAgent: session.userAgent,
        loginTime: toDate(session.loginTime),
        lastActiveTime: toDate(session.lastActiveTime),
        expiresAt: toDate(session.expiresAt),
        status: session.status,
        revokedAt: session.revokedAt ? toDate(session.revokedAt) : undefined,
        revokedReason: session.revokedReason,
      },
      update: {
        tokenId: session.tokenId,
        deviceType: session.deviceType,
        ip: session.ip,
        userAgent: session.userAgent,
        lastActiveTime: toDate(session.lastActiveTime),
        expiresAt: toDate(session.expiresAt),
        status: session.status,
        revokedAt: session.revokedAt ? toDate(session.revokedAt) : undefined,
        revokedReason: session.revokedReason,
      },
    });
  },
  async upsertFrontendSession(session) {
    await prisma.userSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        userId: session.userId,
        tokenId: session.tokenId,
        deviceType: session.deviceType,
        ip: session.ip,
        userAgent: session.userAgent,
        loginTime: toDate(session.loginTime),
        lastActiveTime: toDate(session.lastActiveTime),
        expiresAt: toDate(session.expiresAt),
        status: session.status,
        revokedAt: session.revokedAt ? toDate(session.revokedAt) : undefined,
        revokedReason: session.revokedReason,
      },
      update: {
        tokenId: session.tokenId,
        deviceType: session.deviceType,
        ip: session.ip,
        userAgent: session.userAgent,
        lastActiveTime: toDate(session.lastActiveTime),
        expiresAt: toDate(session.expiresAt),
        status: session.status,
        revokedAt: session.revokedAt ? toDate(session.revokedAt) : undefined,
        revokedReason: session.revokedReason,
      },
    });
  },
  async upsertTokenBlacklist(tokenId, expiresAt, reason) {
    await prisma.tokenBlacklist.upsert({
      where: { tokenId },
      create: { tokenId, expiresAt: toDate(expiresAt), reason },
      update: { expiresAt: toDate(expiresAt), reason },
    });
  },
  async recordOperation(event) {
    const operatorExists = event.operatorUserId
      ? await prisma.adminUser.findUnique({ where: { id: event.operatorUserId }, select: { id: true } })
      : null;

    await prisma.operationLog.create({
      data: {
        id: event.id,
        operator: event.operator,
        operatorAdminUserId: operatorExists?.id,
        operation: event.operation,
        operationItem: event.operationItem,
        operationDetail: toPrismaJson(event.operationDetail),
        operationTime: toDate(event.operationTime),
        operationIp: event.operationIp,
        resource: event.resource,
        resourceId: event.resourceId,
        userAgent: event.userAgent,
        result: event.result,
      },
    });
  },
});

export const createIamService = async (env: AppEnv): Promise<ManagedIamService> => {
  const prisma = new PrismaClient();
  const iam = new IamService(await loadIamDataSet(prisma), {
    accessTokenSecret: env.AUTH_SECRET,
    refreshTokenSecret: env.REFRESH_AUTH_SECRET,
    passwordSalt: env.AUTH_SALT,
    accessTokenTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
    persistence: createPersistenceAdapter(prisma),
  }) as ManagedIamService;

  iam.close = () => prisma.$disconnect();

  return iam;
};
