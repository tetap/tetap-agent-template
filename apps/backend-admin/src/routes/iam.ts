import type { FastifyInstance } from 'fastify';
import {
  createFieldPermission,
  createMenu,
  createPermission,
  createPolicy,
  createRole,
  createUser,
  deleteFieldPermission,
  deleteMenu,
  deletePermission,
  deletePolicy,
  deleteRole,
  deleteUser,
  getIamOverview,
  listFieldPermissions,
  listMenus,
  listOperationLogs,
  listPermissions,
  listPolicies,
  listRoles,
  listSessions,
  listUsers,
  revokeSession,
  revokeUserSessions,
  updateFieldPermission,
  updateMenu,
  updatePermission,
  updatePolicy,
  updateRole,
  updateUser,
} from '../services/iam.js';

const responseSchema = {
  additionalProperties: true,
  type: 'object',
};

const sessionParamsSchema = {
  type: 'object',
  required: ['sessionId'],
  additionalProperties: false,
  properties: {
    sessionId: { type: 'string', minLength: 1 },
  },
};

const userParamsSchema = {
  type: 'object',
  required: ['userId'],
  additionalProperties: false,
  properties: {
    userId: { type: 'string', minLength: 1 },
  },
};

const roleParamsSchema = {
  type: 'object',
  required: ['roleId'],
  additionalProperties: false,
  properties: {
    roleId: { type: 'string', minLength: 1 },
  },
};

const permissionParamsSchema = {
  type: 'object',
  required: ['permissionId'],
  additionalProperties: false,
  properties: {
    permissionId: { type: 'string', minLength: 1 },
  },
};

const menuParamsSchema = {
  type: 'object',
  required: ['menuId'],
  additionalProperties: false,
  properties: {
    menuId: { type: 'string', minLength: 1 },
  },
};

const fieldPermissionParamsSchema = {
  type: 'object',
  required: ['fieldPermissionId'],
  additionalProperties: false,
  properties: {
    fieldPermissionId: { type: 'string', minLength: 1 },
  },
};

const policyParamsSchema = {
  type: 'object',
  required: ['policyId'],
  additionalProperties: false,
  properties: {
    policyId: { type: 'string', minLength: 1 },
  },
};

const operationLogsQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string' },
    sort: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
};

const dataScopeSchema = {
  type: 'object',
  required: ['type'],
  additionalProperties: false,
  properties: {
    type: { type: 'string', enum: ['ALL', 'DEPT', 'DEPT_AND_CHILD', 'SELF', 'CUSTOM'] },
    deptIds: { type: 'array', items: { type: 'string' } },
    ownerField: { type: 'string', minLength: 1 },
    deptField: { type: 'string', minLength: 1 },
  },
};

const policyConditionsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    all: { type: 'array', items: { type: 'object', additionalProperties: true } },
    any: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
};

const createUserBodySchema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  additionalProperties: false,
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 64 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 7, maxLength: 128 },
    status: { type: 'string', enum: ['ACTIVE', 'DISABLED', 'LOCKED'] },
    deptId: { type: 'string', minLength: 1 },
    tenantId: { type: 'string', minLength: 1 },
    isSuperAdmin: { type: 'boolean' },
    roleCodes: { type: 'array', items: { type: 'string', minLength: 1 } },
  },
};

const updateUserBodySchema = {
  ...createUserBodySchema,
  required: [],
};

const createRoleBodySchema = {
  type: 'object',
  required: ['name', 'code'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 80 },
    code: { type: 'string', minLength: 1, maxLength: 64 },
    description: { type: 'string', maxLength: 300 },
    permissionCodes: { type: 'array', items: { type: 'string', pattern: '^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$' } },
    dataScope: dataScopeSchema,
  },
};

const updateRoleBodySchema = {
  ...createRoleBodySchema,
  required: [],
};

const createPermissionBodySchema = {
  type: 'object',
  required: ['code', 'name', 'type', 'resource', 'action'],
  additionalProperties: false,
  properties: {
    code: { type: 'string', pattern: '^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$' },
    name: { type: 'string', minLength: 1, maxLength: 120 },
    type: { type: 'string', enum: ['MENU', 'API', 'BUTTON', 'FIELD', 'DATA'] },
    resource: { type: 'string', minLength: 1, maxLength: 80 },
    action: { type: 'string', minLength: 1, maxLength: 80 },
  },
};

const updatePermissionBodySchema = {
  ...createPermissionBodySchema,
  required: [],
};

const createMenuBodySchema = {
  type: 'object',
  required: ['name', 'path', 'component', 'icon'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 80 },
    path: { type: 'string', minLength: 1, maxLength: 200 },
    component: { type: 'string', minLength: 1, maxLength: 120 },
    icon: { type: 'string', minLength: 1, maxLength: 80 },
    parentId: { type: 'string', minLength: 1 },
    permissionCodes: { type: 'array', items: { type: 'string', pattern: '^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$' } },
    order: { type: 'integer' },
  },
};

const updateMenuBodySchema = {
  ...createMenuBodySchema,
  required: [],
};

const createFieldPermissionBodySchema = {
  type: 'object',
  required: ['roleCode', 'resource', 'fieldName', 'permissionType'],
  additionalProperties: false,
  properties: {
    roleCode: { type: 'string', minLength: 1, maxLength: 64 },
    resource: { type: 'string', minLength: 1, maxLength: 80 },
    fieldName: { type: 'string', minLength: 1, maxLength: 80 },
    permissionType: { type: 'string', enum: ['HIDE', 'MASK', 'READONLY', 'READWRITE'] },
  },
};

const updateFieldPermissionBodySchema = {
  ...createFieldPermissionBodySchema,
  required: [],
};

const createPolicyBodySchema = {
  type: 'object',
  required: ['resource', 'action', 'effect', 'conditions'],
  additionalProperties: false,
  properties: {
    resource: { type: 'string', minLength: 1, maxLength: 80 },
    action: { type: 'string', minLength: 1, maxLength: 80 },
    effect: { type: 'string', enum: ['ALLOW', 'DENY'] },
    conditions: policyConditionsSchema,
    description: { type: 'string', maxLength: 300 },
    enabled: { type: 'boolean' },
  },
};

const updatePolicyBodySchema = {
  ...createPolicyBodySchema,
  required: [],
};

export const registerIamRoutes = (app: FastifyInstance) => {
  app.get(
    '/iam/overview',
    { config: { auth: { permission: 'iam:read' }, skipSecurity: true }, schema: { response: { 200: responseSchema } } },
    getIamOverview,
  );
  app.get(
    '/iam/users',
    {
      config: { auth: { permission: 'user:read' }, skipSecurity: true },
      schema: { response: { 200: responseSchema } },
    },
    listUsers,
  );
  app.post(
    '/iam/users',
    {
      config: { auth: { permission: 'user:update' }, skipSecurity: true },
      schema: { body: createUserBodySchema, response: { 200: responseSchema } },
    },
    createUser,
  );
  app.patch(
    '/iam/users/:userId',
    {
      config: { auth: { permission: 'user:update' }, skipSecurity: true },
      schema: { body: updateUserBodySchema, params: userParamsSchema, response: { 200: responseSchema } },
    },
    updateUser,
  );
  app.delete(
    '/iam/users/:userId',
    {
      config: { auth: { permission: 'user:update' }, skipSecurity: true },
      schema: { params: userParamsSchema, response: { 200: responseSchema } },
    },
    deleteUser,
  );
  app.get(
    '/iam/roles',
    {
      config: { auth: { permission: 'role:read' }, skipSecurity: true },
      schema: { response: { 200: responseSchema } },
    },
    listRoles,
  );
  app.post(
    '/iam/roles',
    {
      config: { auth: { permission: 'role:update' }, skipSecurity: true },
      schema: { body: createRoleBodySchema, response: { 200: responseSchema } },
    },
    createRole,
  );
  app.patch(
    '/iam/roles/:roleId',
    {
      config: { auth: { permission: 'role:update' }, skipSecurity: true },
      schema: { body: updateRoleBodySchema, params: roleParamsSchema, response: { 200: responseSchema } },
    },
    updateRole,
  );
  app.delete(
    '/iam/roles/:roleId',
    {
      config: { auth: { permission: 'role:update' }, skipSecurity: true },
      schema: { params: roleParamsSchema, response: { 200: responseSchema } },
    },
    deleteRole,
  );
  app.get(
    '/iam/permissions',
    { config: { auth: { permission: 'iam:read' }, skipSecurity: true }, schema: { response: { 200: responseSchema } } },
    listPermissions,
  );
  app.post(
    '/iam/permissions',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { body: createPermissionBodySchema, response: { 200: responseSchema } },
    },
    createPermission,
  );
  app.patch(
    '/iam/permissions/:permissionId',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: {
        body: updatePermissionBodySchema,
        params: permissionParamsSchema,
        response: { 200: responseSchema },
      },
    },
    updatePermission,
  );
  app.delete(
    '/iam/permissions/:permissionId',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { params: permissionParamsSchema, response: { 200: responseSchema } },
    },
    deletePermission,
  );
  app.get(
    '/iam/menus',
    {
      config: { auth: { permission: 'menu:read' }, skipSecurity: true },
      schema: { response: { 200: responseSchema } },
    },
    listMenus,
  );
  app.post(
    '/iam/menus',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { body: createMenuBodySchema, response: { 200: responseSchema } },
    },
    createMenu,
  );
  app.patch(
    '/iam/menus/:menuId',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { body: updateMenuBodySchema, params: menuParamsSchema, response: { 200: responseSchema } },
    },
    updateMenu,
  );
  app.delete(
    '/iam/menus/:menuId',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { params: menuParamsSchema, response: { 200: responseSchema } },
    },
    deleteMenu,
  );
  app.get(
    '/iam/field-permissions',
    {
      config: { auth: { permission: 'field:read' }, skipSecurity: true },
      schema: { response: { 200: responseSchema } },
    },
    listFieldPermissions,
  );
  app.post(
    '/iam/field-permissions',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { body: createFieldPermissionBodySchema, response: { 200: responseSchema } },
    },
    createFieldPermission,
  );
  app.patch(
    '/iam/field-permissions/:fieldPermissionId',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: {
        body: updateFieldPermissionBodySchema,
        params: fieldPermissionParamsSchema,
        response: { 200: responseSchema },
      },
    },
    updateFieldPermission,
  );
  app.delete(
    '/iam/field-permissions/:fieldPermissionId',
    {
      config: { auth: { permission: 'iam:manage' }, skipSecurity: true },
      schema: { params: fieldPermissionParamsSchema, response: { 200: responseSchema } },
    },
    deleteFieldPermission,
  );
  app.get(
    '/iam/policies',
    {
      config: { auth: { permission: 'policy:read' }, skipSecurity: true },
      schema: { response: { 200: responseSchema } },
    },
    listPolicies,
  );
  app.post(
    '/iam/policies',
    {
      config: { auth: { permission: 'policy:update' }, skipSecurity: true },
      schema: { body: createPolicyBodySchema, response: { 200: responseSchema } },
    },
    createPolicy,
  );
  app.patch(
    '/iam/policies/:policyId',
    {
      config: { auth: { permission: 'policy:update' }, skipSecurity: true },
      schema: { body: updatePolicyBodySchema, params: policyParamsSchema, response: { 200: responseSchema } },
    },
    updatePolicy,
  );
  app.delete(
    '/iam/policies/:policyId',
    {
      config: { auth: { permission: 'policy:update' }, skipSecurity: true },
      schema: { params: policyParamsSchema, response: { 200: responseSchema } },
    },
    deletePolicy,
  );
  app.get(
    '/iam/sessions',
    {
      config: { auth: { permission: 'session:read' }, skipSecurity: true },
      schema: { response: { 200: responseSchema } },
    },
    listSessions,
  );
  app.post(
    '/iam/sessions/:sessionId/revoke',
    {
      config: { auth: { permission: 'session:revoke' }, skipSecurity: true },
      schema: {
        params: sessionParamsSchema,
        response: { 200: responseSchema },
      },
    },
    revokeSession,
  );
  app.post(
    '/iam/users/:userId/revoke-sessions',
    {
      config: { auth: { permission: 'session:revoke' }, skipSecurity: true },
      schema: {
        params: userParamsSchema,
        response: { 200: responseSchema },
      },
    },
    revokeUserSessions,
  );
  app.get(
    '/iam/operation-logs',
    {
      config: { auth: { permission: 'operation-log:read' }, skipSecurity: true },
      schema: { querystring: operationLogsQuerySchema, response: { 200: responseSchema } },
    },
    listOperationLogs,
  );
};
