import { createHash, randomUUID } from 'node:crypto';
import { signJwt, verifyJwt } from './jwt.js';
import type {
  AuthenticatedUserContext,
  AuthTokenPair,
  CreateFieldPermissionInput,
  CreateMenuInput,
  CreatePermissionInput,
  CreatePolicyInput,
  CreateRoleInput,
  CreateUserInput,
  DataConstraint,
  DataScope,
  IamDataSet,
  IamMenu,
  IamJwtPayload,
  IamMenuNode,
  IamMutationMeta,
  IamPolicy,
  IamSession,
  IamUser,
  LoginInput,
  LoginResult,
  OperationAction,
  OperationLog,
  PermissionCode,
  PolicyCondition,
  PolicyConditions,
  UpdateFieldPermissionInput,
  UpdateMenuInput,
  UpdatePermissionInput,
  UpdatePolicyInput,
  UpdateRoleInput,
  UpdateUserInput,
} from './types.js';

export type IamServiceOptions = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  passwordSalt: string;
  accessTokenTtlSeconds?: number;
  refreshTokenTtlSeconds?: number;
  now?: () => Date;
};

const defaultAccessTokenTtlSeconds = 15 * 60;
const defaultRefreshTokenTtlSeconds = 7 * 24 * 60 * 60;
const sensitiveKeyPattern = /password|token|secret|idcard|identity|phone|mobile/i;

export type IamDomainErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'PROTECTED_RESOURCE';

export class IamDomainError extends Error {
  readonly code: IamDomainErrorCode;

  constructor(code: IamDomainErrorCode, message: string) {
    super(message);
    this.name = 'IamDomainError';
    this.code = code;
  }
}

const toIso = (date: Date) => date.toISOString();

const toEpochSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

const isIsoExpired = (isoDatetime: string, now: Date) => Date.parse(isoDatetime) <= now.getTime();

const omitPasswordHash = (source: IamUser) => {
  const { passwordHash, ...user } = source;

  void passwordHash;

  return user;
};

const toPermissionCode = (value: string) => value as PermissionCode;

const normalizeComparable = (value: string) => value.trim().toLowerCase();

const createEntityId = () => randomUUID();

const legacySecurityPathMap = new Map([
  ['/security', '/system'],
  ['/security/iam', '/system/permission'],
  ['/security/roles', '/system/role'],
  ['/security/permissions', '/system/permission'],
  ['/security/menus', '/system/menu'],
  ['/security/fields', '/system/field'],
  ['/security/policies', '/system/policy'],
  ['/security/sessions', '/system/session'],
  ['/security/operation-logs', '/system/operation-log'],
]);

const legacySecurityIdMap = new Map([
  ['security', 'system'],
  ['iam', 'permissions'],
]);

const normalizeMenuPath = (path: string) => legacySecurityPathMap.get(path) ?? path.replace(/^\/security\//, '/system/');

const normalizeAdminMenu = (menu: IamMenu, hasSystemRoot: boolean): IamMenu | null => {
  if ((menu.id === 'security' || menu.path === '/security') && hasSystemRoot) {
    return null;
  }

  const isLegacySecurityChild = menu.parentId === 'security' || menu.path.startsWith('/security/');
  const normalizedId = legacySecurityIdMap.get(menu.id) ?? menu.id;

  if (menu.id === 'security' || menu.path === '/security') {
    return {
      ...menu,
      id: 'system',
      name: 'System Management',
      path: '/system',
      component: 'AdminSystemRedirectPage',
      icon: 'Settings',
      order: 10,
    };
  }

  return {
    ...menu,
    id: isLegacySecurityChild ? normalizedId : menu.id,
    path: normalizeMenuPath(menu.path),
    parentId: isLegacySecurityChild ? 'system' : menu.parentId,
  };
};

const unique = <TValue>(values: TValue[]) => Array.from(new Set(values));

const ensureNoDuplicate = <TEntity>(entities: TEntity[], predicate: (entity: TEntity) => boolean, message: string) => {
  if (entities.some(predicate)) {
    throw new IamDomainError('CONFLICT', message);
  }
};

const patchDefined = <TEntity extends Record<string, unknown>>(entity: TEntity, patch: Partial<TEntity>) => {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      entity[key as keyof TEntity] = value as TEntity[keyof TEntity];
    }
  }
};

export const hashPassword = (password: string, salt: string) =>
  createHash('sha256').update(`${salt}:${password}`).digest('hex');

export const normalizeBearerToken = (authorization: string | undefined) => {
  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(' ');

  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
};

const resolvePath = (source: unknown, path: string) =>
  path.split('.').reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[segment];
  }, source);

const isEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

const evaluateCondition = (
  condition: PolicyCondition,
  context: { user: unknown; resource: unknown; environment: unknown },
) => {
  const actualValue = resolvePath(context[condition.source], condition.path);

  switch (condition.operator) {
    case 'eq':
      return isEqual(actualValue, condition.value);
    case 'neq':
      return !isEqual(actualValue, condition.value);
    case 'in':
      return Array.isArray(condition.value) && condition.value.some(item => isEqual(item, actualValue));
    case 'contains':
      return Array.isArray(actualValue)
        ? actualValue.some(item => isEqual(item, condition.value))
        : typeof actualValue === 'string' &&
            typeof condition.value === 'string' &&
            actualValue.includes(condition.value);
    case 'between': {
      if (!Array.isArray(condition.value) || condition.value.length !== 2) {
        return false;
      }

      const [min, max] = condition.value;

      return typeof actualValue === 'number' && typeof min === 'number' && typeof max === 'number'
        ? actualValue >= min && actualValue <= max
        : false;
    }
    case 'exists':
      return condition.value === false ? actualValue === undefined : actualValue !== undefined;
    default:
      return false;
  }
};

const evaluateConditions = (
  conditions: PolicyConditions,
  context: { user: unknown; resource: unknown; environment: unknown },
) => {
  const all = conditions.all ?? [];
  const any = conditions.any ?? [];
  const allMatched = all.every(condition => evaluateCondition(condition, context));
  const anyMatched = any.length === 0 || any.some(condition => evaluateCondition(condition, context));

  return allMatched && anyMatched;
};

export const redactSensitive = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map(redactSensitive);
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).map(([key, value]) => [
      key,
      sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactSensitive(value),
    ]),
  );
};

export class IamService {
  private readonly data: IamDataSet;
  private readonly options: Required<IamServiceOptions>;
  private readonly adminSessions = new Map<string, IamSession>();
  private readonly frontendSessions = new Map<string, IamSession>();
  private readonly blacklistedTokenIds = new Map<string, string>();
  private readonly operationLogs: OperationLog[] = [];

  constructor(data: IamDataSet, options: IamServiceOptions) {
    this.data = data;
    for (const session of data.frontendSessions) {
      this.frontendSessions.set(session.id, session);
    }
    this.options = {
      accessTokenSecret: options.accessTokenSecret,
      refreshTokenSecret: options.refreshTokenSecret,
      passwordSalt: options.passwordSalt,
      accessTokenTtlSeconds: options.accessTokenTtlSeconds ?? defaultAccessTokenTtlSeconds,
      refreshTokenTtlSeconds: options.refreshTokenTtlSeconds ?? defaultRefreshTokenTtlSeconds,
      now: options.now ?? (() => new Date()),
    };
  }

  get users() {
    return this.data.adminUsers.map(omitPasswordHash);
  }

  get roles() {
    return this.data.roles;
  }

  get permissions() {
    return this.data.permissions;
  }

  get policies() {
    return this.data.policies;
  }

  get fieldPermissions() {
    return this.data.fieldPermissions;
  }

  get operations() {
    return [...this.operationLogs].sort((left, right) => right.operationTime.localeCompare(left.operationTime));
  }

  createUser(input: CreateUserInput, meta: IamMutationMeta = {}) {
    ensureNoDuplicate(
      this.data.adminUsers,
      user => normalizeComparable(user.username) === normalizeComparable(input.username),
      'Username already exists.',
    );
    ensureNoDuplicate(
      this.data.adminUsers,
      user => normalizeComparable(user.email) === normalizeComparable(input.email),
      'Email already exists.',
    );
    this.assertRoleCodesExist(input.roleCodes ?? []);

    const user: IamUser = {
      id: createEntityId(),
      username: input.username.trim(),
      email: input.email.trim(),
      passwordHash: hashPassword(input.password, this.options.passwordSalt),
      status: input.status ?? 'ACTIVE',
      deptId: input.deptId ?? '0',
      tenantId: input.tenantId ?? 'tenant-default',
      isSuperAdmin: input.isSuperAdmin ?? false,
      roleCodes: unique(input.roleCodes ?? []),
      tokenVersion: 1,
    };

    this.data.adminUsers.push(user);
    this.recordIamMutation('user', user.id, 'create', meta, {
      username: user.username,
      roleCodes: user.roleCodes,
      status: user.status,
    });

    return omitPasswordHash(user);
  }

  updateUser(userId: string, input: UpdateUserInput, meta: IamMutationMeta = {}) {
    const user = this.findUserOrThrow(userId);

    const nextUsername = input.username;
    const nextEmail = input.email;

    if (nextUsername) {
      ensureNoDuplicate(
        this.data.adminUsers,
        item => item.id !== userId && normalizeComparable(item.username) === normalizeComparable(nextUsername),
        'Username already exists.',
      );
    }

    if (nextEmail) {
      ensureNoDuplicate(
        this.data.adminUsers,
        item => item.id !== userId && normalizeComparable(item.email) === normalizeComparable(nextEmail),
        'Email already exists.',
      );
    }

    if (input.roleCodes) {
      this.assertRoleCodesExist(input.roleCodes);
    }

    this.assertSuperAdminStillExists(user, input);

    const nextRoleCodes = input.roleCodes ? unique(input.roleCodes) : undefined;
    const nextPasswordHash = input.password ? hashPassword(input.password, this.options.passwordSalt) : undefined;
    const shouldInvalidateSessions = Boolean(nextPasswordHash || input.status || input.isSuperAdmin !== undefined);

    patchDefined(user, {
      username: input.username?.trim(),
      email: input.email?.trim(),
      passwordHash: nextPasswordHash,
      status: input.status,
      deptId: input.deptId,
      tenantId: input.tenantId,
      isSuperAdmin: input.isSuperAdmin,
      roleCodes: nextRoleCodes,
      tokenVersion: shouldInvalidateSessions ? user.tokenVersion + 1 : undefined,
    });

    if (shouldInvalidateSessions) {
      this.revokeAdminUserSessions(user.id, 'admin-security-state-changed', meta.actorUserId);
    }

    this.recordIamMutation('user', user.id, 'update', meta, {
      username: user.username,
      roleCodes: user.roleCodes,
      status: user.status,
    });

    return omitPasswordHash(user);
  }

  deleteUser(userId: string, meta: IamMutationMeta = {}) {
    const user = this.findUserOrThrow(userId);

    if (meta.actorUserId === userId) {
      throw new IamDomainError('PROTECTED_RESOURCE', 'Administrators cannot delete their own account.');
    }

    this.assertSuperAdminStillExists(user, { isSuperAdmin: false, status: 'DISABLED' });
    this.data.adminUsers = this.data.adminUsers.filter(item => item.id !== userId);
    const revokedSessions = this.revokeAdminUserSessions(userId, 'admin-user-deleted', meta.actorUserId);

    this.recordIamMutation('user', userId, 'delete', meta, {
      username: user.username,
      revokedSessions: revokedSessions.length,
    });

    return omitPasswordHash(user);
  }

  createRole(input: CreateRoleInput, meta: IamMutationMeta = {}) {
    ensureNoDuplicate(
      this.data.roles,
      role => normalizeComparable(role.code) === normalizeComparable(input.code),
      'Role code already exists.',
    );
    this.assertPermissionCodesExist(input.permissionCodes ?? []);

    const role = {
      id: createEntityId(),
      name: input.name.trim(),
      code: input.code.trim(),
      description: input.description,
      permissionCodes: unique(input.permissionCodes ?? []).map(toPermissionCode),
      dataScope: input.dataScope ?? { type: 'SELF' as const },
    };

    this.data.roles.push(role);
    this.recordIamMutation('role', role.id, 'create', meta, { code: role.code });

    return role;
  }

  updateRole(roleId: string, input: UpdateRoleInput, meta: IamMutationMeta = {}) {
    const role = this.findRoleOrThrow(roleId);
    const oldCode = role.code;

    const nextCode = input.code;

    if (nextCode) {
      ensureNoDuplicate(
        this.data.roles,
        item => item.id !== roleId && normalizeComparable(item.code) === normalizeComparable(nextCode),
        'Role code already exists.',
      );
    }

    if (input.permissionCodes) {
      this.assertPermissionCodesExist(input.permissionCodes);
    }

    patchDefined(role, {
      name: input.name?.trim(),
      code: input.code?.trim(),
      description: input.description,
      permissionCodes: input.permissionCodes ? unique(input.permissionCodes).map(toPermissionCode) : undefined,
      dataScope: input.dataScope,
    });

    if (role.code !== oldCode) {
      for (const user of this.data.adminUsers) {
        user.roleCodes = user.roleCodes.map(code => (code === oldCode ? role.code : code));
      }

      for (const fieldPermission of this.data.fieldPermissions) {
        if (fieldPermission.roleCode === oldCode) {
          fieldPermission.roleCode = role.code;
        }
      }
    }

    this.recordIamMutation('role', role.id, 'update', meta, { code: role.code });

    return role;
  }

  deleteRole(roleId: string, meta: IamMutationMeta = {}) {
    const role = this.findRoleOrThrow(roleId);

    if (this.data.adminUsers.some(user => user.roleCodes.includes(role.code))) {
      throw new IamDomainError('PROTECTED_RESOURCE', 'Assigned roles cannot be deleted.');
    }

    this.data.roles = this.data.roles.filter(item => item.id !== roleId);
    this.data.fieldPermissions = this.data.fieldPermissions.filter(item => item.roleCode !== role.code);
    this.recordIamMutation('role', role.id, 'delete', meta, { code: role.code });

    return role;
  }

  createPermission(input: CreatePermissionInput, meta: IamMutationMeta = {}) {
    ensureNoDuplicate(
      this.data.permissions,
      permission => permission.code === input.code,
      'Permission code already exists.',
    );

    const permission = {
      id: createEntityId(),
      code: toPermissionCode(input.code),
      name: input.name.trim(),
      type: input.type,
      resource: input.resource.trim(),
      action: input.action.trim(),
    };

    this.data.permissions.push(permission);
    this.recordIamMutation('permission', permission.id, 'create', meta, { code: permission.code });

    return permission;
  }

  updatePermission(permissionId: string, input: UpdatePermissionInput, meta: IamMutationMeta = {}) {
    const permission = this.findPermissionOrThrow(permissionId);
    const oldCode = permission.code;

    if (input.code) {
      ensureNoDuplicate(
        this.data.permissions,
        item => item.id !== permissionId && item.code === input.code,
        'Permission code already exists.',
      );
    }

    patchDefined(permission, {
      code: input.code ? toPermissionCode(input.code) : undefined,
      name: input.name?.trim(),
      type: input.type,
      resource: input.resource?.trim(),
      action: input.action?.trim(),
    });

    if (permission.code !== oldCode) {
      for (const role of this.data.roles) {
        role.permissionCodes = role.permissionCodes.map(code => (code === oldCode ? permission.code : code));
      }

      for (const menu of this.data.menus) {
        menu.permissionCodes = menu.permissionCodes.map(code => (code === oldCode ? permission.code : code));
      }
    }

    this.recordIamMutation('permission', permission.id, 'update', meta, { code: permission.code });

    return permission;
  }

  deletePermission(permissionId: string, meta: IamMutationMeta = {}) {
    const permission = this.findPermissionOrThrow(permissionId);

    if (
      this.data.roles.some(role => role.permissionCodes.includes(permission.code)) ||
      this.data.menus.some(menu => menu.permissionCodes.includes(permission.code))
    ) {
      throw new IamDomainError('PROTECTED_RESOURCE', 'Assigned permissions cannot be deleted.');
    }

    this.data.permissions = this.data.permissions.filter(item => item.id !== permissionId);
    this.recordIamMutation('permission', permission.id, 'delete', meta, { code: permission.code });

    return permission;
  }

  createMenu(input: CreateMenuInput, meta: IamMutationMeta = {}) {
    this.assertMenuParentExists(input.parentId);
    this.assertPermissionCodesExist(input.permissionCodes ?? []);

    const menu = {
      id: createEntityId(),
      name: input.name.trim(),
      path: input.path.trim(),
      component: input.component.trim(),
      icon: input.icon.trim(),
      parentId: input.parentId,
      permissionCodes: unique(input.permissionCodes ?? []).map(toPermissionCode),
      order: input.order ?? 0,
    };

    this.data.menus.push(menu);
    this.recordIamMutation('menu', menu.id, 'create', meta, { path: menu.path });

    return menu;
  }

  updateMenu(menuId: string, input: UpdateMenuInput, meta: IamMutationMeta = {}) {
    const menu = this.findMenuOrThrow(menuId);

    if (input.parentId === menuId) {
      throw new IamDomainError('VALIDATION', 'A menu cannot be its own parent.');
    }

    this.assertMenuParentExists(input.parentId);

    if (input.permissionCodes) {
      this.assertPermissionCodesExist(input.permissionCodes);
    }

    patchDefined(menu, {
      name: input.name?.trim(),
      path: input.path?.trim(),
      component: input.component?.trim(),
      icon: input.icon?.trim(),
      parentId: input.parentId,
      permissionCodes: input.permissionCodes ? unique(input.permissionCodes).map(toPermissionCode) : undefined,
      order: input.order,
    });

    this.recordIamMutation('menu', menu.id, 'update', meta, { path: menu.path });

    return menu;
  }

  deleteMenu(menuId: string, meta: IamMutationMeta = {}) {
    const menu = this.findMenuOrThrow(menuId);

    if (this.data.menus.some(item => item.parentId === menuId)) {
      throw new IamDomainError('PROTECTED_RESOURCE', 'Menus with children cannot be deleted.');
    }

    this.data.menus = this.data.menus.filter(item => item.id !== menuId);
    this.recordIamMutation('menu', menu.id, 'delete', meta, { path: menu.path });

    return menu;
  }

  createFieldPermission(input: CreateFieldPermissionInput, meta: IamMutationMeta = {}) {
    this.assertRoleCodesExist([input.roleCode]);
    ensureNoDuplicate(
      this.data.fieldPermissions,
      rule =>
        rule.roleCode === input.roleCode && rule.resource === input.resource && rule.fieldName === input.fieldName,
      'Field permission already exists.',
    );

    const fieldPermission = {
      id: createEntityId(),
      roleCode: input.roleCode,
      resource: input.resource.trim(),
      fieldName: input.fieldName.trim(),
      permissionType: input.permissionType,
    };

    this.data.fieldPermissions.push(fieldPermission);
    this.recordIamMutation('field-permission', fieldPermission.id, 'create', meta, {
      roleCode: fieldPermission.roleCode,
      resource: fieldPermission.resource,
      fieldName: fieldPermission.fieldName,
    });

    return fieldPermission;
  }

  updateFieldPermission(fieldPermissionId: string, input: UpdateFieldPermissionInput, meta: IamMutationMeta = {}) {
    const fieldPermission = this.findFieldPermissionOrThrow(fieldPermissionId);
    const nextRoleCode = input.roleCode ?? fieldPermission.roleCode;
    const nextResource = input.resource ?? fieldPermission.resource;
    const nextFieldName = input.fieldName ?? fieldPermission.fieldName;

    this.assertRoleCodesExist([nextRoleCode]);
    ensureNoDuplicate(
      this.data.fieldPermissions,
      rule =>
        rule.id !== fieldPermissionId &&
        rule.roleCode === nextRoleCode &&
        rule.resource === nextResource &&
        rule.fieldName === nextFieldName,
      'Field permission already exists.',
    );

    patchDefined(fieldPermission, {
      roleCode: input.roleCode,
      resource: input.resource?.trim(),
      fieldName: input.fieldName?.trim(),
      permissionType: input.permissionType,
    });

    this.recordIamMutation('field-permission', fieldPermission.id, 'update', meta, {
      roleCode: fieldPermission.roleCode,
      resource: fieldPermission.resource,
      fieldName: fieldPermission.fieldName,
    });

    return fieldPermission;
  }

  deleteFieldPermission(fieldPermissionId: string, meta: IamMutationMeta = {}) {
    const fieldPermission = this.findFieldPermissionOrThrow(fieldPermissionId);

    this.data.fieldPermissions = this.data.fieldPermissions.filter(item => item.id !== fieldPermissionId);
    this.recordIamMutation('field-permission', fieldPermission.id, 'delete', meta, {
      roleCode: fieldPermission.roleCode,
      resource: fieldPermission.resource,
      fieldName: fieldPermission.fieldName,
    });

    return fieldPermission;
  }

  createPolicy(input: CreatePolicyInput, meta: IamMutationMeta = {}) {
    const policy = {
      id: createEntityId(),
      resource: input.resource.trim(),
      action: input.action.trim(),
      effect: input.effect,
      conditions: input.conditions,
      description: input.description,
      enabled: input.enabled ?? true,
    };

    this.data.policies.push(policy);
    this.recordIamMutation('policy', policy.id, 'create', meta, {
      resource: policy.resource,
      action: policy.action,
      effect: policy.effect,
    });

    return policy;
  }

  updatePolicy(policyId: string, input: UpdatePolicyInput, meta: IamMutationMeta = {}) {
    const policy = this.findPolicyOrThrow(policyId);

    patchDefined(policy, {
      resource: input.resource?.trim(),
      action: input.action?.trim(),
      effect: input.effect,
      conditions: input.conditions,
      description: input.description,
      enabled: input.enabled,
    });

    this.recordIamMutation('policy', policy.id, 'update', meta, {
      resource: policy.resource,
      action: policy.action,
      effect: policy.effect,
    });

    return policy;
  }

  deletePolicy(policyId: string, meta: IamMutationMeta = {}) {
    const policy = this.findPolicyOrThrow(policyId);

    this.data.policies = this.data.policies.filter(item => item.id !== policyId);
    this.recordIamMutation('policy', policy.id, 'delete', meta, {
      resource: policy.resource,
      action: policy.action,
      effect: policy.effect,
    });

    return policy;
  }

  verifyPassword(user: IamUser, password: string) {
    return user.passwordHash === hashPassword(password, this.options.passwordSalt);
  }

  findUserByUsername(username: string) {
    return this.data.adminUsers.find(
      user =>
        user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === username.toLowerCase(),
    );
  }

  getUserById(userId: string) {
    return this.data.adminUsers.find(user => user.id === userId);
  }

  getRolesForUser(user: IamUser) {
    return this.data.roles.filter(role => user.roleCodes.includes(role.code));
  }

  getCapabilitiesForUser(user: IamUser) {
    if (user.isSuperAdmin) {
      return this.data.permissions.map(permission => permission.code);
    }

    return Array.from(
      new Set(
        this.getRolesForUser(user)
          .flatMap(role => role.permissionCodes)
          .map(toPermissionCode),
      ),
    ).sort();
  }

  can(user: IamUser, permissionCode: PermissionCode) {
    return user.isSuperAdmin || this.getCapabilitiesForUser(user).includes(permissionCode);
  }

  getMenuTree(user: IamUser) {
    const capabilities = new Set(this.getCapabilitiesForUser(user));
    const hasSystemRoot = this.data.menus.some(menu => menu.id === 'system' || menu.path === '/system');
    const seenMenus = new Set<string>();
    const allowedMenus = this.data.menus
      .filter(
        menu =>
          user.isSuperAdmin ||
          menu.permissionCodes.length === 0 ||
          menu.permissionCodes.some(code => capabilities.has(code)),
      )
      .map(menu => normalizeAdminMenu(menu, hasSystemRoot))
      .filter((menu): menu is IamMenu => Boolean(menu))
      .filter(menu => {
        const key = `${menu.parentId ?? 'root'}:${menu.path}`;

        if (seenMenus.has(key)) {
          return false;
        }

        seenMenus.add(key);
        return true;
      })
      .sort((left, right) => left.order - right.order);
    const menuByParent = new Map<string | undefined, IamMenuNode[]>();

    for (const menu of allowedMenus) {
      const node: IamMenuNode = { ...menu, children: [] };
      const siblings = menuByParent.get(menu.parentId) ?? [];
      siblings.push(node);
      menuByParent.set(menu.parentId, siblings);
    }

    const attachChildren = (nodes: IamMenuNode[]): IamMenuNode[] =>
      nodes.map(node => ({ ...node, children: attachChildren(menuByParent.get(node.id) ?? []) }));

    return attachChildren(menuByParent.get(undefined) ?? []);
  }

  getFieldRulesForUser(user: IamUser, resource: string) {
    if (user.isSuperAdmin) {
      return [];
    }

    const roleCodes = new Set(user.roleCodes);

    return this.data.fieldPermissions.filter(
      fieldPermission => fieldPermission.resource === resource && roleCodes.has(fieldPermission.roleCode),
    );
  }

  applyFieldPermissions<TRecord extends Record<string, unknown>>(
    user: IamUser,
    resource: string,
    record: TRecord,
  ): Partial<TRecord> {
    const rules = this.getFieldRulesForUser(user, resource);

    return rules.reduce<Partial<TRecord>>(
      (currentRecord, rule) => {
        if (rule.permissionType === 'HIDE') {
          const remaining = { ...currentRecord };

          delete remaining[rule.fieldName];

          return remaining as Partial<TRecord>;
        }

        if (rule.permissionType === 'MASK' && rule.fieldName in currentRecord) {
          return {
            ...currentRecord,
            [rule.fieldName]: maskField(rule.fieldName, currentRecord[rule.fieldName]),
          };
        }

        return currentRecord;
      },
      { ...record },
    );
  }

  getDataConstraint(user: IamUser, resource: string): DataConstraint {
    if (user.isSuperAdmin) {
      return { scope: 'ALL', where: {} };
    }

    const scopes = this.getRolesForUser(user).map(role => role.dataScope);
    const scope = scopes.find(item => item.type === 'ALL') ?? scopes[0] ?? { type: 'SELF' as const };

    return buildDataConstraint(user, resource, scope);
  }

  evaluatePolicy(
    user: IamUser,
    resource: string,
    action: string,
    resourceAttributes: Record<string, unknown> = {},
    environment: Record<string, unknown> = {},
  ) {
    if (user.isSuperAdmin) {
      return { allowed: true, matchedPolicies: [] as IamPolicy[] };
    }

    const matchedPolicies = this.data.policies.filter(
      policy =>
        policy.enabled !== false &&
        policy.resource === resource &&
        policy.action === action &&
        evaluateConditions(policy.conditions, { user, resource: resourceAttributes, environment }),
    );

    if (matchedPolicies.some(policy => policy.effect === 'DENY')) {
      return { allowed: false, matchedPolicies };
    }

    if (matchedPolicies.some(policy => policy.effect === 'ALLOW')) {
      return { allowed: true, matchedPolicies };
    }

    return { allowed: false, matchedPolicies };
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const user = this.findUserByUsername(input.username);

    if (!user || user.status !== 'ACTIVE' || !this.verifyPassword(user, input.password)) {
      this.recordOperation({
        operation: 'LOGIN',
        operationItem: 'auth:login',
        resource: 'auth',
        result: 'FAILURE',
        detail: { username: input.username },
        ip: input.ip,
        userAgent: input.userAgent,
      });
      throw new Error('Invalid credentials.');
    }

    const tokenPair = this.issueTokenPair(user, input);
    const capabilities = this.getCapabilitiesForUser(user);
    const menus = this.getMenuTree(user);

    this.recordOperation({
      actorUserId: user.id,
      operation: 'LOGIN',
      operationItem: 'auth:login',
      resource: 'auth',
      result: 'SUCCESS',
      detail: { tokenId: tokenPair.tokenId, deviceType: input.deviceType ?? 'UNKNOWN' },
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return {
      ...tokenPair,
      user: omitPasswordHash(user),
      capabilities,
      menus,
    };
  }

  refresh(refreshToken: string) {
    const payload = verifyJwt(refreshToken, this.options.refreshTokenSecret, toEpochSeconds(this.options.now()));

    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token.');
    }

    const context = this.resolveTokenContext(payload);
    const tokenPair = this.issueTokenPair(context.user, {
      deviceType: context.session.deviceType,
      ip: context.session.ip,
      userAgent: context.session.userAgent,
    });

    this.revokeAdminSession(context.session.id, 'refresh-rotated', context.user.id);
    this.recordOperation({
      actorUserId: context.user.id,
      operation: 'REFRESH',
      operationItem: 'auth:refresh',
      resource: 'auth',
      result: 'SUCCESS',
      detail: { oldTokenId: payload.tokenId, tokenId: tokenPair.tokenId },
      ip: context.session.ip,
      userAgent: context.session.userAgent,
    });

    return tokenPair;
  }

  verifyAccessToken(accessToken: string): AuthenticatedUserContext {
    const payload = verifyJwt(accessToken, this.options.accessTokenSecret, toEpochSeconds(this.options.now()));

    if (payload.type !== 'access') {
      throw new Error('Invalid access token.');
    }

    const context = this.resolveTokenContext(payload);
    this.touchSession(context.session.id);

    return {
      user: omitPasswordHash(context.user),
      session: context.session,
      roles: this.getRolesForUser(context.user),
      capabilities: this.getCapabilitiesForUser(context.user),
    };
  }

  logout(accessToken: string) {
    const context = this.verifyAccessToken(accessToken);
    this.revokeAdminSession(context.session.id, 'logout', context.user.id);

    return { revoked: true };
  }

  listSessions() {
    return [...this.frontendSessions.values()]
      .map(session => {
        const user = this.data.frontendUsers.find(item => item.id === session.userId);

        return {
          ...session,
          email: user?.email,
          username: user?.username,
        };
      })
      .sort((left, right) => right.lastActiveTime.localeCompare(left.lastActiveTime));
  }

  revokeSession(sessionId: string, reason = 'admin-forced-offline', actorUserId?: string) {
    const session = this.frontendSessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    const now = toIso(this.options.now());
    const revokedSession = {
      ...session,
      status: 'REVOKED' as const,
      revokedAt: now,
      revokedReason: reason,
    };

    this.frontendSessions.set(sessionId, revokedSession);
    this.blacklistedTokenIds.set(session.tokenId, revokedSession.expiresAt);
    this.pruneExpiredBlacklistedTokenIds();
    this.recordOperation({
      actorUserId,
      operation: reason === 'logout' ? 'LOGOUT' : 'FORCE_LOGOUT',
      operationItem: `session:${sessionId}`,
      resource: 'session',
      resourceId: sessionId,
      result: 'SUCCESS',
      detail: { userId: session.userId, tokenId: session.tokenId, reason },
      ip: session.ip,
      userAgent: session.userAgent,
    });

    return revokedSession;
  }

  revokeUserSessions(userId: string, reason = 'admin-forced-offline', actorUserId?: string) {
    return this.listSessions()
      .filter(session => session.userId === userId && session.status === 'ONLINE')
      .flatMap(session => {
        const revokedSession = this.revokeSession(session.id, reason, actorUserId);

        return revokedSession ? [revokedSession] : [];
      });
  }

  private revokeAdminSession(sessionId: string, reason = 'admin-forced-offline', actorUserId?: string) {
    const session = this.adminSessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    const now = toIso(this.options.now());
    const revokedSession = {
      ...session,
      status: 'REVOKED' as const,
      revokedAt: now,
      revokedReason: reason,
    };

    this.adminSessions.set(sessionId, revokedSession);
    this.blacklistedTokenIds.set(session.tokenId, revokedSession.expiresAt);
    this.pruneExpiredBlacklistedTokenIds();
    this.recordOperation({
      actorUserId,
      operation: reason === 'logout' ? 'LOGOUT' : 'FORCE_LOGOUT',
      operationItem: `admin-session:${sessionId}`,
      resource: 'admin-session',
      resourceId: sessionId,
      result: 'SUCCESS',
      detail: { userId: session.userId, tokenId: session.tokenId, reason },
      ip: session.ip,
      userAgent: session.userAgent,
    });

    return revokedSession;
  }

  private revokeAdminUserSessions(userId: string, reason = 'admin-forced-offline', actorUserId?: string) {
    return [...this.adminSessions.values()]
      .filter(session => session.userId === userId && session.status === 'ONLINE')
      .flatMap(session => {
        const revokedSession = this.revokeAdminSession(session.id, reason, actorUserId);

        return revokedSession ? [revokedSession] : [];
      });
  }

  recordOperation(input: {
    actorUserId?: string;
    operation: OperationAction;
    operationItem: string;
    resource: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
    result: 'SUCCESS' | 'FAILURE';
    detail: Record<string, unknown>;
  }) {
    const event: OperationLog = {
      id: randomUUID(),
      operator: this.resolveOperator(input.actorUserId),
      operatorUserId: input.actorUserId,
      operation: input.operation,
      operationItem: input.operationItem,
      operationDetail: redactSensitive(input.detail) as Record<string, unknown>,
      operationTime: toIso(this.options.now()),
      operationIp: input.ip,
      resource: input.resource,
      resourceId: input.resourceId,
      userAgent: input.userAgent,
      result: input.result,
    };

    this.operationLogs.unshift(event);

    return event;
  }

  private resolveOperator(actorUserId: string | undefined) {
    if (!actorUserId) {
      return 'anonymous';
    }

    const actor = this.data.adminUsers.find(user => user.id === actorUserId);

    return actor?.username ?? actorUserId;
  }

  private findUserOrThrow(userId: string) {
    const user = this.data.adminUsers.find(item => item.id === userId);

    if (!user) {
      throw new IamDomainError('NOT_FOUND', 'User not found.');
    }

    return user;
  }

  private findRoleOrThrow(roleId: string) {
    const role = this.data.roles.find(item => item.id === roleId);

    if (!role) {
      throw new IamDomainError('NOT_FOUND', 'Role not found.');
    }

    return role;
  }

  private findPermissionOrThrow(permissionId: string) {
    const permission = this.data.permissions.find(item => item.id === permissionId);

    if (!permission) {
      throw new IamDomainError('NOT_FOUND', 'Permission not found.');
    }

    return permission;
  }

  private findMenuOrThrow(menuId: string) {
    const menu = this.data.menus.find(item => item.id === menuId);

    if (!menu) {
      throw new IamDomainError('NOT_FOUND', 'Menu not found.');
    }

    return menu;
  }

  private findFieldPermissionOrThrow(fieldPermissionId: string) {
    const fieldPermission = this.data.fieldPermissions.find(item => item.id === fieldPermissionId);

    if (!fieldPermission) {
      throw new IamDomainError('NOT_FOUND', 'Field permission not found.');
    }

    return fieldPermission;
  }

  private findPolicyOrThrow(policyId: string) {
    const policy = this.data.policies.find(item => item.id === policyId);

    if (!policy) {
      throw new IamDomainError('NOT_FOUND', 'Policy not found.');
    }

    return policy;
  }

  private assertRoleCodesExist(roleCodes: string[]) {
    const knownRoleCodes = new Set(this.data.roles.map(role => role.code));
    const missingRoleCode = roleCodes.find(roleCode => !knownRoleCodes.has(roleCode));

    if (missingRoleCode) {
      throw new IamDomainError('VALIDATION', `Unknown role code: ${missingRoleCode}.`);
    }
  }

  private assertPermissionCodesExist(permissionCodes: string[]) {
    const knownPermissionCodes = new Set<string>(this.data.permissions.map(permission => permission.code));
    const missingPermissionCode = permissionCodes.find(permissionCode => !knownPermissionCodes.has(permissionCode));

    if (missingPermissionCode) {
      throw new IamDomainError('VALIDATION', `Unknown permission code: ${missingPermissionCode}.`);
    }
  }

  private assertMenuParentExists(parentId: string | undefined) {
    if (parentId && !this.data.menus.some(menu => menu.id === parentId)) {
      throw new IamDomainError('VALIDATION', 'Menu parent does not exist.');
    }
  }

  private assertSuperAdminStillExists(targetUser: IamUser, patch: Pick<UpdateUserInput, 'isSuperAdmin' | 'status'>) {
    if (!targetUser.isSuperAdmin) {
      return;
    }

    const wouldLoseSuperAdmin =
      patch.isSuperAdmin === false || patch.status === 'DISABLED' || patch.status === 'LOCKED';

    if (!wouldLoseSuperAdmin) {
      return;
    }

    const remainingSuperAdmins = this.data.adminUsers.filter(
      user => user.id !== targetUser.id && user.isSuperAdmin && user.status === 'ACTIVE',
    );

    if (remainingSuperAdmins.length === 0) {
      throw new IamDomainError('PROTECTED_RESOURCE', 'At least one active super administrator is required.');
    }
  }

  private recordIamMutation(
    resource: string,
    resourceId: string,
    operation: 'create' | 'update' | 'delete',
    meta: IamMutationMeta,
    detail: Record<string, unknown>,
  ) {
    this.recordOperation({
      actorUserId: meta.actorUserId,
      operation: 'IAM_MUTATION',
      operationItem: `${resource}:${resourceId}`,
      resource,
      resourceId,
      result: 'SUCCESS',
      detail: { operation, ...detail },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  private issueTokenPair(user: IamUser, input: Omit<LoginInput, 'username' | 'password'>): AuthTokenPair {
    const now = this.options.now();
    const nowSeconds = toEpochSeconds(now);
    const tokenId = randomUUID();
    const accessExpiresAt = new Date(now.getTime() + this.options.accessTokenTtlSeconds * 1000);
    const refreshExpiresAt = new Date(now.getTime() + this.options.refreshTokenTtlSeconds * 1000);
    const capabilities = this.getCapabilitiesForUser(user);
    const basePayload = {
      sub: user.id,
      tokenId,
      roles: user.roleCodes,
      permissions: capabilities,
      tenantId: user.tenantId,
      tokenVersion: user.tokenVersion,
      iat: nowSeconds,
    };
    const accessPayload: IamJwtPayload = {
      ...basePayload,
      type: 'access',
      exp: toEpochSeconds(accessExpiresAt),
    };
    const refreshPayload: IamJwtPayload = {
      ...basePayload,
      type: 'refresh',
      exp: toEpochSeconds(refreshExpiresAt),
    };
    const session: IamSession = {
      id: randomUUID(),
      userId: user.id,
      tokenId,
      deviceType: input.deviceType ?? 'UNKNOWN',
      ip: input.ip ?? '0.0.0.0',
      userAgent: input.userAgent ?? 'unknown',
      loginTime: toIso(now),
      lastActiveTime: toIso(now),
      expiresAt: toIso(refreshExpiresAt),
      status: 'ONLINE',
    };

    this.adminSessions.set(session.id, session);

    return {
      accessToken: signJwt(accessPayload, this.options.accessTokenSecret),
      refreshToken: signJwt(refreshPayload, this.options.refreshTokenSecret),
      accessTokenExpiresAt: toIso(accessExpiresAt),
      refreshTokenExpiresAt: toIso(refreshExpiresAt),
      tokenId,
    };
  }

  private resolveTokenContext(payload: IamJwtPayload) {
    this.pruneExpiredBlacklistedTokenIds();

    if (this.blacklistedTokenIds.has(payload.tokenId)) {
      throw new Error('Token revoked.');
    }

    const user = this.data.adminUsers.find(item => item.id === payload.sub);

    if (!user || user.status !== 'ACTIVE' || user.tokenVersion !== payload.tokenVersion) {
      throw new Error('Token user is invalid.');
    }

    const session = [...this.adminSessions.values()].find(
      item => item.tokenId === payload.tokenId && item.userId === user.id && item.status === 'ONLINE',
    );

    if (!session) {
      throw new Error('Session expired.');
    }

    if (isIsoExpired(session.expiresAt, this.options.now())) {
      this.adminSessions.set(session.id, {
        ...session,
        status: 'EXPIRED',
      });
      this.blacklistedTokenIds.set(session.tokenId, session.expiresAt);
      this.pruneExpiredBlacklistedTokenIds();
      throw new Error('Session expired.');
    }

    return { user, session };
  }

  private pruneExpiredBlacklistedTokenIds() {
    const now = this.options.now();

    for (const [tokenId, expiresAt] of this.blacklistedTokenIds.entries()) {
      if (isIsoExpired(expiresAt, now)) {
        this.blacklistedTokenIds.delete(tokenId);
      }
    }
  }

  private touchSession(sessionId: string) {
    const session = this.adminSessions.get(sessionId);

    if (!session || session.status !== 'ONLINE') {
      return;
    }

    this.adminSessions.set(sessionId, {
      ...session,
      lastActiveTime: toIso(this.options.now()),
    });
  }
}

export const buildDataConstraint = (user: IamUser, resource: string, dataScope: DataScope): DataConstraint => {
  const ownerField = dataScope.ownerField ?? 'createdById';
  const deptField = dataScope.deptField ?? 'deptId';

  switch (dataScope.type) {
    case 'ALL':
      return { scope: 'ALL', where: {} };
    case 'DEPT':
      return { scope: 'DEPT', where: { [deptField]: user.deptId } };
    case 'DEPT_AND_CHILD':
      return {
        scope: 'DEPT_AND_CHILD',
        where: { [deptField]: { in: Array.from(new Set([user.deptId, ...(dataScope.deptIds ?? [])])) } },
      };
    case 'CUSTOM':
      return { scope: 'CUSTOM', where: { [deptField]: { in: dataScope.deptIds ?? [] } } };
    case 'SELF':
      return { scope: 'SELF', where: { [ownerField]: user.id } };
    default:
      return { scope: 'SELF', where: { [ownerField]: user.id } };
  }
};

export const maskField = (fieldName: string, value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  if (/phone|mobile/i.test(fieldName) && value.length >= 7) {
    return `${value.slice(0, 3)}****${value.slice(-4)}`;
  }

  if (/idCard|identity/i.test(fieldName) && value.length >= 8) {
    return `${value.slice(0, 4)}********${value.slice(-4)}`;
  }

  if (/email/i.test(fieldName)) {
    const [name, domain] = value.split('@');

    return name && domain ? `${name.slice(0, 2)}***@${domain}` : value;
  }

  return value.length > 4 ? `${value.slice(0, 2)}***${value.slice(-2)}` : '****';
};
