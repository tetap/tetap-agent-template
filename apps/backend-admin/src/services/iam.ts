import {
  iamAuditLogsResponseSchema,
  iamCreateFieldPermissionRequestSchema,
  iamCreateMenuRequestSchema,
  iamCreatePermissionRequestSchema,
  iamCreatePolicyRequestSchema,
  iamCreateRoleRequestSchema,
  iamCreateUserRequestSchema,
  iamFieldPermissionsResponseSchema,
  iamFieldPermissionMutationResponseSchema,
  iamMenuMutationResponseSchema,
  iamMenusResponseSchema,
  iamOverviewDataSchema,
  iamOverviewResponseSchema,
  iamPermissionMutationResponseSchema,
  iamPermissionsResponseSchema,
  iamPolicyMutationResponseSchema,
  iamPoliciesResponseSchema,
  iamRoleMutationResponseSchema,
  iamRolesResponseSchema,
  iamSessionRevokeResponseSchema,
  iamSessionsResponseSchema,
  iamUpdateFieldPermissionRequestSchema,
  iamUpdateMenuRequestSchema,
  iamUpdatePermissionRequestSchema,
  iamUpdatePolicyRequestSchema,
  iamUpdateRoleRequestSchema,
  iamUpdateUserRequestSchema,
  iamUserMutationResponseSchema,
  iamUsersResponseSchema,
  fieldPermissionIdParamsSchema,
  menuIdParamsSchema,
  permissionIdParamsSchema,
  policyIdParamsSchema,
  roleIdParamsSchema,
  sessionIdParamsSchema,
  userIdParamsSchema,
} from '@tetap/schema/iam';
import { IamDomainError } from '@tetap/iam';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../shared/app-error.js';
import { sendSuccess } from '../shared/api-response.js';
import { requireAuthContext } from '../shared/auth-context.js';
import { ErrorCode } from '../shared/error-code.js';

const getActorUser = (request: FastifyRequest) => {
  const auth = requireAuthContext(request);
  const user = request.server.iam.getUserById(auth.user.id);

  if (!user) {
    throw new AppError({ code: ErrorCode.LoginExpired });
  }

  return user;
};

const getMutationMeta = (request: FastifyRequest, actorUserId: string) => ({
  actorUserId,
  ip: request.ip,
  userAgent: request.headers['user-agent']?.toString(),
});

const mapIamError = (error: unknown): never => {
  if (error instanceof IamDomainError) {
    if (error.code === 'NOT_FOUND') {
      throw new AppError({ code: ErrorCode.NotFound, cause: error });
    }

    if (error.code === 'PROTECTED_RESOURCE') {
      throw new AppError({ code: ErrorCode.Forbidden, cause: error, exposeDetails: true, details: error.message });
    }

    throw new AppError({ code: ErrorCode.BadRequest, cause: error, exposeDetails: true, details: error.message });
  }

  throw error;
};

const runIamMutation = <TResult>(operation: () => TResult) => {
  try {
    return operation();
  } catch (error) {
    return mapIamError(error);
  }
};

export const getIamOverview = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const data = iamOverviewDataSchema.parse({
    users: request.server.iam.users.map(user => request.server.iam.applyFieldPermissions(actor, 'user', user)),
    roles: request.server.iam.roles,
    permissions: request.server.iam.permissions,
    menus: request.server.iam.getMenuTree(actor),
    fieldPermissions: request.server.iam.fieldPermissions,
    policies: request.server.iam.policies,
    sessions: request.server.iam.listSessions(),
    auditLogs: request.server.iam.audit,
  });

  request.server.iam.recordAudit({
    actorUserId: actor.id,
    action: 'IAM_READ',
    resource: 'iam',
    result: 'SUCCESS',
    detail: { view: 'overview' },
    ip: request.ip,
    userAgent: request.headers['user-agent']?.toString(),
  });

  return sendSuccess(reply, request, iamOverviewResponseSchema, data, 'backendAdmin.iam.overviewOk');
};

export const listUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const users = request.server.iam.users.map(user => request.server.iam.applyFieldPermissions(actor, 'user', user));

  return sendSuccess(reply, request, iamUsersResponseSchema, users, 'backendAdmin.iam.usersOk');
};

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const input = iamCreateUserRequestSchema.parse(request.body);
  const user = runIamMutation(() => request.server.iam.createUser(input, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamUserMutationResponseSchema, user, 'backendAdmin.iam.userCreated');
};

export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = userIdParamsSchema.parse(request.params);
  const input = iamUpdateUserRequestSchema.parse(request.body);
  const user = runIamMutation(() =>
    request.server.iam.updateUser(params.userId, input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(reply, request, iamUserMutationResponseSchema, user, 'backendAdmin.iam.userUpdated');
};

export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = userIdParamsSchema.parse(request.params);
  const user = runIamMutation(() => request.server.iam.deleteUser(params.userId, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamUserMutationResponseSchema, user, 'backendAdmin.iam.userDeleted');
};

export const listRoles = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(reply, request, iamRolesResponseSchema, request.server.iam.roles, 'backendAdmin.iam.rolesOk');

export const createRole = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const input = iamCreateRoleRequestSchema.parse(request.body);
  const role = runIamMutation(() => request.server.iam.createRole(input, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamRoleMutationResponseSchema, role, 'backendAdmin.iam.roleCreated');
};

export const updateRole = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = roleIdParamsSchema.parse(request.params);
  const input = iamUpdateRoleRequestSchema.parse(request.body);
  const role = runIamMutation(() =>
    request.server.iam.updateRole(params.roleId, input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(reply, request, iamRoleMutationResponseSchema, role, 'backendAdmin.iam.roleUpdated');
};

export const deleteRole = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = roleIdParamsSchema.parse(request.params);
  const role = runIamMutation(() => request.server.iam.deleteRole(params.roleId, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamRoleMutationResponseSchema, role, 'backendAdmin.iam.roleDeleted');
};

export const listPermissions = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(
    reply,
    request,
    iamPermissionsResponseSchema,
    request.server.iam.permissions,
    'backendAdmin.iam.permissionsOk',
  );

export const createPermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const input = iamCreatePermissionRequestSchema.parse(request.body);
  const permission = runIamMutation(() =>
    request.server.iam.createPermission(input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(
    reply,
    request,
    iamPermissionMutationResponseSchema,
    permission,
    'backendAdmin.iam.permissionCreated',
  );
};

export const updatePermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = permissionIdParamsSchema.parse(request.params);
  const input = iamUpdatePermissionRequestSchema.parse(request.body);
  const permission = runIamMutation(() =>
    request.server.iam.updatePermission(params.permissionId, input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(
    reply,
    request,
    iamPermissionMutationResponseSchema,
    permission,
    'backendAdmin.iam.permissionUpdated',
  );
};

export const deletePermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = permissionIdParamsSchema.parse(request.params);
  const permission = runIamMutation(() =>
    request.server.iam.deletePermission(params.permissionId, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(
    reply,
    request,
    iamPermissionMutationResponseSchema,
    permission,
    'backendAdmin.iam.permissionDeleted',
  );
};

export const listMenus = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);

  return sendSuccess(
    reply,
    request,
    iamMenusResponseSchema,
    request.server.iam.getMenuTree(actor),
    'backendAdmin.iam.menusOk',
  );
};

export const createMenu = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const input = iamCreateMenuRequestSchema.parse(request.body);
  const menu = runIamMutation(() => request.server.iam.createMenu(input, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamMenuMutationResponseSchema, menu, 'backendAdmin.iam.menuCreated');
};

export const updateMenu = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = menuIdParamsSchema.parse(request.params);
  const input = iamUpdateMenuRequestSchema.parse(request.body);
  const menu = runIamMutation(() =>
    request.server.iam.updateMenu(params.menuId, input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(reply, request, iamMenuMutationResponseSchema, menu, 'backendAdmin.iam.menuUpdated');
};

export const deleteMenu = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = menuIdParamsSchema.parse(request.params);
  const menu = runIamMutation(() => request.server.iam.deleteMenu(params.menuId, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamMenuMutationResponseSchema, menu, 'backendAdmin.iam.menuDeleted');
};

export const listFieldPermissions = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(
    reply,
    request,
    iamFieldPermissionsResponseSchema,
    request.server.iam.fieldPermissions,
    'backendAdmin.iam.fieldPermissionsOk',
  );

export const createFieldPermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const input = iamCreateFieldPermissionRequestSchema.parse(request.body);
  const fieldPermission = runIamMutation(() =>
    request.server.iam.createFieldPermission(input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(
    reply,
    request,
    iamFieldPermissionMutationResponseSchema,
    fieldPermission,
    'backendAdmin.iam.fieldPermissionCreated',
  );
};

export const updateFieldPermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = fieldPermissionIdParamsSchema.parse(request.params);
  const input = iamUpdateFieldPermissionRequestSchema.parse(request.body);
  const fieldPermission = runIamMutation(() =>
    request.server.iam.updateFieldPermission(params.fieldPermissionId, input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(
    reply,
    request,
    iamFieldPermissionMutationResponseSchema,
    fieldPermission,
    'backendAdmin.iam.fieldPermissionUpdated',
  );
};

export const deleteFieldPermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = fieldPermissionIdParamsSchema.parse(request.params);
  const fieldPermission = runIamMutation(() =>
    request.server.iam.deleteFieldPermission(params.fieldPermissionId, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(
    reply,
    request,
    iamFieldPermissionMutationResponseSchema,
    fieldPermission,
    'backendAdmin.iam.fieldPermissionDeleted',
  );
};

export const listPolicies = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(reply, request, iamPoliciesResponseSchema, request.server.iam.policies, 'backendAdmin.iam.policiesOk');

export const createPolicy = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const input = iamCreatePolicyRequestSchema.parse(request.body);
  const policy = runIamMutation(() => request.server.iam.createPolicy(input, getMutationMeta(request, actor.id)));

  return sendSuccess(reply, request, iamPolicyMutationResponseSchema, policy, 'backendAdmin.iam.policyCreated');
};

export const updatePolicy = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = policyIdParamsSchema.parse(request.params);
  const input = iamUpdatePolicyRequestSchema.parse(request.body);
  const policy = runIamMutation(() =>
    request.server.iam.updatePolicy(params.policyId, input, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(reply, request, iamPolicyMutationResponseSchema, policy, 'backendAdmin.iam.policyUpdated');
};

export const deletePolicy = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = policyIdParamsSchema.parse(request.params);
  const policy = runIamMutation(() =>
    request.server.iam.deletePolicy(params.policyId, getMutationMeta(request, actor.id)),
  );

  return sendSuccess(reply, request, iamPolicyMutationResponseSchema, policy, 'backendAdmin.iam.policyDeleted');
};

export const listSessions = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(
    reply,
    request,
    iamSessionsResponseSchema,
    request.server.iam.listSessions(),
    'backendAdmin.iam.sessionsOk',
  );

export const revokeSession = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = sessionIdParamsSchema.parse(request.params);
  const decision = request.server.iam.evaluatePolicy(
    actor,
    'session',
    'revoke',
    { sessionId: params.sessionId },
    { riskLevel: 'normal' },
  );

  if (!decision.allowed) {
    request.server.iam.recordAudit({
      actorUserId: actor.id,
      action: 'POLICY_DENIED',
      resource: 'session',
      resourceId: params.sessionId,
      result: 'FAILURE',
      detail: { action: 'revoke', matchedPolicies: decision.matchedPolicies.map(policy => policy.id) },
      ip: request.ip,
      userAgent: request.headers['user-agent']?.toString(),
    });
    throw new AppError({ code: ErrorCode.PolicyDenied });
  }

  const revokedSession = request.server.iam.revokeSession(params.sessionId, 'admin-forced-offline', actor.id);

  if (!revokedSession) {
    throw new AppError({ code: ErrorCode.NotFound });
  }

  return sendSuccess(
    reply,
    request,
    iamSessionRevokeResponseSchema,
    { revokedSessions: [revokedSession] },
    'backendAdmin.iam.revokeSessionOk',
  );
};

export const revokeUserSessions = async (request: FastifyRequest, reply: FastifyReply) => {
  const actor = getActorUser(request);
  const params = userIdParamsSchema.parse(request.params);
  const decision = request.server.iam.evaluatePolicy(
    actor,
    'session',
    'revoke',
    { userId: params.userId },
    { riskLevel: 'normal' },
  );

  if (!decision.allowed) {
    request.server.iam.recordAudit({
      actorUserId: actor.id,
      action: 'POLICY_DENIED',
      resource: 'session',
      resourceId: params.userId,
      result: 'FAILURE',
      detail: { action: 'revokeUserSessions', matchedPolicies: decision.matchedPolicies.map(policy => policy.id) },
      ip: request.ip,
      userAgent: request.headers['user-agent']?.toString(),
    });
    throw new AppError({ code: ErrorCode.PolicyDenied });
  }

  const revokedSessions = request.server.iam.revokeUserSessions(params.userId, 'admin-forced-offline', actor.id);

  return sendSuccess(
    reply,
    request,
    iamSessionRevokeResponseSchema,
    { revokedSessions },
    'backendAdmin.iam.revokeSessionOk',
  );
};

export const listAuditLogs = async (request: FastifyRequest, reply: FastifyReply) =>
  sendSuccess(reply, request, iamAuditLogsResponseSchema, request.server.iam.audit, 'backendAdmin.iam.auditLogsOk');
