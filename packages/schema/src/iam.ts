import { z } from 'zod/v3';
import { createApiResponseSchema, isoDatetimeSchema, paginationInputSchema } from './common.js';

export const permissionTypeSchema = z.enum(['MENU', 'API', 'BUTTON', 'FIELD', 'DATA']);
export const fieldPermissionTypeSchema = z.enum(['HIDE', 'MASK', 'READONLY', 'READWRITE']);
export const dataScopeTypeSchema = z.enum(['ALL', 'DEPT', 'DEPT_AND_CHILD', 'SELF', 'CUSTOM']);
export const policyEffectSchema = z.enum(['ALLOW', 'DENY']);
export const sessionStatusSchema = z.enum(['ONLINE', 'OFFLINE', 'REVOKED', 'EXPIRED']);
export const deviceTypeSchema = z.enum(['WEB', 'IOS', 'ANDROID', 'DESKTOP', 'UNKNOWN']);
export const auditActionSchema = z.enum([
  'LOGIN',
  'REFRESH',
  'LOGOUT',
  'FORCE_LOGOUT',
  'PERMISSION_DENIED',
  'POLICY_DENIED',
  'SESSION_TOUCH',
  'IAM_READ',
  'IAM_MUTATION',
]);

export const permissionCodeSchema = z.string().regex(/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/);

export const iamPermissionSchema = z.object({
  id: z.string().min(1),
  code: permissionCodeSchema,
  name: z.string().min(1),
  type: permissionTypeSchema,
  resource: z.string().min(1),
  action: z.string().min(1),
});

export const iamDataScopeSchema = z.object({
  type: dataScopeTypeSchema,
  deptIds: z.array(z.string().min(1)).optional(),
  ownerField: z.string().min(1).optional(),
  deptField: z.string().min(1).optional(),
});

export const iamRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  permissionCodes: z.array(permissionCodeSchema),
  dataScope: iamDataScopeSchema,
});

export const iamUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['ACTIVE', 'DISABLED', 'LOCKED']),
  deptId: z.string().min(1),
  tenantId: z.string().min(1),
  isSuperAdmin: z.boolean(),
  roleCodes: z.array(z.string().min(1)),
  tokenVersion: z.number().int().min(0),
});

export const iamMenuBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  component: z.string().min(1),
  icon: z.string().min(1),
  parentId: z.string().min(1).optional(),
  permissionCodes: z.array(permissionCodeSchema),
  order: z.number().int(),
});

type IamMenuBase = z.infer<typeof iamMenuBaseSchema>;

export type IamMenuNode = IamMenuBase & {
  children: IamMenuNode[];
};

export const iamMenuNodeSchema: z.ZodType<IamMenuNode> = iamMenuBaseSchema.extend({
  children: z.lazy(() => z.array(iamMenuNodeSchema)),
});

export const fieldPermissionSchema = z.object({
  id: z.string().min(1),
  roleCode: z.string().min(1),
  resource: z.string().min(1),
  fieldName: z.string().min(1),
  permissionType: fieldPermissionTypeSchema,
});

export const dataConstraintSchema = z.object({
  scope: dataScopeTypeSchema,
  where: z.record(z.unknown()),
});

export const policyConditionSchema = z.object({
  source: z.enum(['user', 'resource', 'environment']),
  path: z.string().min(1),
  operator: z.enum(['eq', 'neq', 'in', 'contains', 'between', 'exists']),
  value: z.unknown().optional(),
});

export const policyConditionsSchema = z
  .object({
    all: z.array(policyConditionSchema).optional(),
    any: z.array(policyConditionSchema).optional(),
  })
  .strict();

export const iamPolicySchema = z.object({
  id: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
  effect: policyEffectSchema,
  conditions: policyConditionsSchema,
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export const iamSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tokenId: z.string().min(1),
  deviceType: deviceTypeSchema,
  ip: z.string().min(1),
  userAgent: z.string().min(1),
  loginTime: isoDatetimeSchema,
  lastActiveTime: isoDatetimeSchema,
  expiresAt: isoDatetimeSchema,
  status: sessionStatusSchema,
  revokedAt: isoDatetimeSchema.optional(),
  revokedReason: z.string().optional(),
});

export const auditLogSchema = z.object({
  id: z.string().min(1),
  actorUserId: z.string().min(1).optional(),
  action: auditActionSchema,
  resource: z.string().min(1),
  resourceId: z.string().min(1).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  result: z.enum(['SUCCESS', 'FAILURE']),
  detail: z.record(z.unknown()),
  createdAt: isoDatetimeSchema,
});

export const iamLoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  deviceType: deviceTypeSchema.default('WEB'),
  rememberMe: z.boolean().default(false),
});

export const iamRefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const iamCreateUserRequestSchema = z
  .object({
    username: z.string().min(3).max(64),
    email: z.string().email(),
    password: z.string().min(7).max(128),
    status: iamUserSchema.shape.status.default('ACTIVE'),
    deptId: z.string().min(1).optional(),
    tenantId: z.string().min(1).optional(),
    isSuperAdmin: z.boolean().default(false),
    roleCodes: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const iamUpdateUserRequestSchema = iamCreateUserRequestSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: z.string().min(7).max(128).optional(),
  })
  .strict();

export const iamCreateRoleRequestSchema = z
  .object({
    name: z.string().min(1).max(80),
    code: z.string().min(1).max(64),
    description: z.string().max(300).optional(),
    permissionCodes: z.array(permissionCodeSchema).default([]),
    dataScope: iamDataScopeSchema.default({ type: 'SELF' }),
  })
  .strict();

export const iamUpdateRoleRequestSchema = iamCreateRoleRequestSchema.partial().strict();

export const iamCreatePermissionRequestSchema = z
  .object({
    code: permissionCodeSchema,
    name: z.string().min(1).max(120),
    type: permissionTypeSchema,
    resource: z.string().min(1).max(80),
    action: z.string().min(1).max(80),
  })
  .strict();

export const iamUpdatePermissionRequestSchema = iamCreatePermissionRequestSchema.partial().strict();

export const iamCreateMenuRequestSchema = z
  .object({
    name: z.string().min(1).max(80),
    path: z.string().min(1).max(200),
    component: z.string().min(1).max(120),
    icon: z.string().min(1).max(80),
    parentId: z.string().min(1).optional(),
    permissionCodes: z.array(permissionCodeSchema).default([]),
    order: z.number().int().default(0),
  })
  .strict();

export const iamUpdateMenuRequestSchema = iamCreateMenuRequestSchema.partial().strict();

export const iamCreateFieldPermissionRequestSchema = z
  .object({
    roleCode: z.string().min(1).max(64),
    resource: z.string().min(1).max(80),
    fieldName: z.string().min(1).max(80),
    permissionType: fieldPermissionTypeSchema,
  })
  .strict();

export const iamUpdateFieldPermissionRequestSchema = iamCreateFieldPermissionRequestSchema.partial().strict();

export const iamCreatePolicyRequestSchema = z
  .object({
    resource: z.string().min(1).max(80),
    action: z.string().min(1).max(80),
    effect: policyEffectSchema,
    conditions: policyConditionsSchema,
    description: z.string().max(300).optional(),
    enabled: z.boolean().default(true),
  })
  .strict();

export const iamUpdatePolicyRequestSchema = iamCreatePolicyRequestSchema.partial().strict();

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().min(1),
});

export const userIdParamsSchema = z.object({
  userId: z.string().min(1),
});

export const roleIdParamsSchema = z.object({
  roleId: z.string().min(1),
});

export const permissionIdParamsSchema = z.object({
  permissionId: z.string().min(1),
});

export const menuIdParamsSchema = z.object({
  menuId: z.string().min(1),
});

export const fieldPermissionIdParamsSchema = z.object({
  fieldPermissionId: z.string().min(1),
});

export const policyIdParamsSchema = z.object({
  policyId: z.string().min(1),
});

export const iamListQuerySchema = paginationInputSchema.extend({
  search: z.string().optional(),
});

export const iamTokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessTokenExpiresAt: isoDatetimeSchema,
  refreshTokenExpiresAt: isoDatetimeSchema,
  tokenId: z.string().min(1),
});

export const iamLoginDataSchema = iamTokenPairSchema.extend({
  user: iamUserSchema,
  capabilities: z.array(permissionCodeSchema),
  menus: z.array(iamMenuNodeSchema),
});

export const iamBootstrapDataSchema = z.object({
  user: iamUserSchema,
  roles: z.array(iamRoleSchema),
  capabilities: z.array(permissionCodeSchema),
  menus: z.array(iamMenuNodeSchema),
  dataConstraint: dataConstraintSchema,
  fieldPermissions: z.array(fieldPermissionSchema),
});

export const iamOverviewDataSchema = z.object({
  users: z.array(iamUserSchema),
  roles: z.array(iamRoleSchema),
  permissions: z.array(iamPermissionSchema),
  menus: z.array(iamMenuNodeSchema),
  fieldPermissions: z.array(fieldPermissionSchema),
  policies: z.array(iamPolicySchema),
  sessions: z.array(iamSessionSchema),
  auditLogs: z.array(auditLogSchema),
});

export const iamSessionRevokeDataSchema = z.object({
  revokedSessions: z.array(iamSessionSchema),
});

export const iamLoginResponseSchema = createApiResponseSchema(iamLoginDataSchema);
export const iamRefreshResponseSchema = createApiResponseSchema(iamTokenPairSchema);
export const iamCurrentUserResponseSchema = createApiResponseSchema(iamBootstrapDataSchema);
export const iamOverviewResponseSchema = createApiResponseSchema(iamOverviewDataSchema);
export const iamUserMutationResponseSchema = createApiResponseSchema(iamUserSchema);
export const iamUsersResponseSchema = createApiResponseSchema(z.array(iamUserSchema));
export const iamRoleMutationResponseSchema = createApiResponseSchema(iamRoleSchema);
export const iamRolesResponseSchema = createApiResponseSchema(z.array(iamRoleSchema));
export const iamPermissionMutationResponseSchema = createApiResponseSchema(iamPermissionSchema);
export const iamPermissionsResponseSchema = createApiResponseSchema(z.array(iamPermissionSchema));
export const iamMenuMutationResponseSchema = createApiResponseSchema(iamMenuBaseSchema);
export const iamMenusResponseSchema = createApiResponseSchema(z.array(iamMenuNodeSchema));
export const iamFieldPermissionMutationResponseSchema = createApiResponseSchema(fieldPermissionSchema);
export const iamFieldPermissionsResponseSchema = createApiResponseSchema(z.array(fieldPermissionSchema));
export const iamPolicyMutationResponseSchema = createApiResponseSchema(iamPolicySchema);
export const iamPoliciesResponseSchema = createApiResponseSchema(z.array(iamPolicySchema));
export const iamSessionsResponseSchema = createApiResponseSchema(z.array(iamSessionSchema));
export const iamAuditLogsResponseSchema = createApiResponseSchema(z.array(auditLogSchema));
export const iamSessionRevokeResponseSchema = createApiResponseSchema(iamSessionRevokeDataSchema);

export type IamPermission = z.output<typeof iamPermissionSchema>;
export type IamRole = z.output<typeof iamRoleSchema>;
export type IamUser = z.output<typeof iamUserSchema>;
export type FieldPermission = z.output<typeof fieldPermissionSchema>;
export type IamPolicy = z.output<typeof iamPolicySchema>;
export type IamSession = z.output<typeof iamSessionSchema>;
export type AuditLog = z.output<typeof auditLogSchema>;
export type IamLoginRequest = z.input<typeof iamLoginRequestSchema>;
export type IamCreateUserRequest = z.input<typeof iamCreateUserRequestSchema>;
export type IamUpdateUserRequest = z.input<typeof iamUpdateUserRequestSchema>;
export type IamCreateRoleRequest = z.input<typeof iamCreateRoleRequestSchema>;
export type IamUpdateRoleRequest = z.input<typeof iamUpdateRoleRequestSchema>;
export type IamCreatePermissionRequest = z.input<typeof iamCreatePermissionRequestSchema>;
export type IamUpdatePermissionRequest = z.input<typeof iamUpdatePermissionRequestSchema>;
export type IamCreateMenuRequest = z.input<typeof iamCreateMenuRequestSchema>;
export type IamUpdateMenuRequest = z.input<typeof iamUpdateMenuRequestSchema>;
export type IamCreateFieldPermissionRequest = z.input<typeof iamCreateFieldPermissionRequestSchema>;
export type IamUpdateFieldPermissionRequest = z.input<typeof iamUpdateFieldPermissionRequestSchema>;
export type IamCreatePolicyRequest = z.input<typeof iamCreatePolicyRequestSchema>;
export type IamUpdatePolicyRequest = z.input<typeof iamUpdatePolicyRequestSchema>;
export type IamLoginData = z.output<typeof iamLoginDataSchema>;
export type IamBootstrapData = z.output<typeof iamBootstrapDataSchema>;
export type IamOverviewData = z.output<typeof iamOverviewDataSchema>;
