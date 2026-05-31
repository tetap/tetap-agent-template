import {
  iamCreateFieldPermissionRequestSchema,
  iamCreatePermissionRequestSchema,
  iamCreatePolicyRequestSchema,
  iamCreateRoleRequestSchema,
  iamCreateUserRequestSchema,
  iamCurrentUserResponseSchema,
  iamFieldPermissionMutationResponseSchema,
  iamFieldPermissionsResponseSchema,
  iamMenuMutationResponseSchema,
  iamMenusResponseSchema,
  iamCreateMenuRequestSchema,
  iamLoginRequestSchema,
  iamLoginResponseSchema,
  iamOperationLogsQuerySchema,
  iamOperationLogsResponseSchema,
  iamOverviewResponseSchema,
  iamPermissionMutationResponseSchema,
  iamPermissionsResponseSchema,
  iamPolicyMutationResponseSchema,
  iamPoliciesResponseSchema,
  iamRoleMutationResponseSchema,
  iamRolesResponseSchema,
  iamSessionsResponseSchema,
  iamSessionRevokeResponseSchema,
  iamUpdateFieldPermissionRequestSchema,
  iamUpdateMenuRequestSchema,
  iamUpdatePermissionRequestSchema,
  iamUpdatePolicyRequestSchema,
  iamUpdateRoleRequestSchema,
  iamUpdateUserRequestSchema,
  iamUserMutationResponseSchema,
  iamUsersResponseSchema,
  type IamCreateFieldPermissionRequest,
  type IamCreateMenuRequest,
  type IamCreatePermissionRequest,
  type IamCreatePolicyRequest,
  type IamCreateRoleRequest,
  type IamCreateUserRequest,
  type IamLoginRequest,
  type IamOperationLogsQuery,
  type IamUpdateFieldPermissionRequest,
  type IamUpdateMenuRequest,
  type IamUpdatePermissionRequest,
  type IamUpdatePolicyRequest,
  type IamUpdateRoleRequest,
  type IamUpdateUserRequest,
} from '@tetap/schema/iam';
import { getUserTimeZone } from '@tetap/hooks';

const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const backendAdminBaseUrl = metaEnv?.VITE_BACKEND_ADMIN_BASE_URL ?? 'http://127.0.0.1:3001';

const joinUrl = (path: string) => `${backendAdminBaseUrl.replace(/\/$/, '')}${path}`;

const createHeaders = (accessToken?: string) => ({
  'content-type': 'application/json',
  'x-time-zone': getUserTimeZone(),
  ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
});

const createQueryString = (query: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const value = searchParams.toString();

  return value ? `?${value}` : '';
};

type BackendAdminErrorBody = {
  code?: unknown;
  data?: unknown;
  message?: unknown;
};

export class BackendAdminRequestError extends Error {
  readonly body: unknown;
  readonly code?: unknown;
  readonly status: number;

  constructor(status: number, body: unknown) {
    const errorBody = body && typeof body === 'object' ? (body as BackendAdminErrorBody) : {};
    const message = typeof errorBody.message === 'string' ? errorBody.message : 'Backend admin request failed.';

    super(message);
    this.name = 'BackendAdminRequestError';
    this.body = body;
    this.code = errorBody.code;
    this.status = status;
  }
}

const hasIssueMessages = (error: unknown): error is { issues: Array<{ message?: unknown }> } =>
  Boolean(error && typeof error === 'object' && Array.isArray((error as { issues?: unknown }).issues));

const parseJsonResponse = async (response: Response) => {
  try {
    return (await response.json()) as unknown;
  } catch (error) {
    if (!response.ok) {
      return null;
    }

    throw error;
  }
};

const resolveBackendAdminErrorDetail = (error: BackendAdminRequestError) => {
  const body = error.body as { data?: unknown; message?: unknown } | null;

  if (typeof body?.data === 'string' && body.data.trim()) {
    return body.data;
  }

  if (body?.data && typeof body.data === 'object' && 'issues' in body.data) {
    const issues = (body.data as { issues?: Array<{ message?: unknown }> }).issues ?? [];
    const message = issues
      .map(issue => issue.message)
      .find((issueMessage): issueMessage is string => typeof issueMessage === 'string');

    if (message) {
      return message;
    }
  }

  return typeof body?.message === 'string' && body.message.trim() ? body.message : undefined;
};

export const resolveBackendAdminErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof BackendAdminRequestError) {
    return resolveBackendAdminErrorDetail(error) ?? fallback;
  }

  if (hasIssueMessages(error)) {
    return (
      error.issues.map(issue => issue.message).find((message): message is string => typeof message === 'string') ??
      fallback
    );
  }

  if (error instanceof SyntaxError && error.message) {
    return error.message;
  }

  return fallback;
};

const requestJson = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(joinUrl(path), options);
  const body = await parseJsonResponse(response);

  if (!response.ok) {
    throw new BackendAdminRequestError(response.status, body);
  }

  return body;
};

export const loginAdmin = async (input: IamLoginRequest) => {
  const body = iamLoginRequestSchema.parse(input);
  const response = await requestJson('/auth/login', {
    body: JSON.stringify(body),
    headers: createHeaders(),
    method: 'POST',
  });

  return iamLoginResponseSchema.parse(response).data;
};

export const fetchAdminBootstrap = async (accessToken: string) => {
  const response = await requestJson('/auth/me', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamCurrentUserResponseSchema.parse(response).data;
};

export const logoutAdmin = async (accessToken: string) => {
  await requestJson('/auth/logout', {
    headers: createHeaders(accessToken),
    method: 'POST',
  });
};

export const fetchIamOverview = async (accessToken: string) => {
  const response = await requestJson('/iam/overview', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamOverviewResponseSchema.parse(response).data;
};

export const fetchIamUsers = async (accessToken: string) => {
  const response = await requestJson('/iam/users', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamUsersResponseSchema.parse(response).data;
};

export const fetchIamRoles = async (accessToken: string) => {
  const response = await requestJson('/iam/roles', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamRolesResponseSchema.parse(response).data;
};

export const fetchIamPermissions = async (accessToken: string) => {
  const response = await requestJson('/iam/permissions', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamPermissionsResponseSchema.parse(response).data;
};

export const fetchIamMenus = async (accessToken: string) => {
  const response = await requestJson('/iam/menus', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamMenusResponseSchema.parse(response).data;
};

export const fetchIamFieldPermissions = async (accessToken: string) => {
  const response = await requestJson('/iam/field-permissions', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamFieldPermissionsResponseSchema.parse(response).data;
};

export const fetchIamPolicies = async (accessToken: string) => {
  const response = await requestJson('/iam/policies', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamPoliciesResponseSchema.parse(response).data;
};

export const fetchIamSessions = async (accessToken: string) => {
  const response = await requestJson('/iam/sessions', {
    headers: createHeaders(accessToken),
    method: 'GET',
  });

  return iamSessionsResponseSchema.parse(response).data;
};

export const fetchIamOperationLogs = async (accessToken: string, input: IamOperationLogsQuery = {}) => {
  const query = iamOperationLogsQuerySchema.parse(input);
  const response = await requestJson(
    `/iam/operation-logs${createQueryString({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      sort: query.sort,
    })}`,
    {
      headers: createHeaders(accessToken),
      method: 'GET',
    },
  );

  return iamOperationLogsResponseSchema.parse(response).data;
};

export const revokeIamSession = async (accessToken: string, sessionId: string) => {
  const response = await requestJson(`/iam/sessions/${encodeURIComponent(sessionId)}/revoke`, {
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamSessionRevokeResponseSchema.parse(response).data;
};

export const revokeIamUserSessions = async (accessToken: string, userId: string) => {
  const response = await requestJson(`/iam/users/${encodeURIComponent(userId)}/revoke-sessions`, {
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamSessionRevokeResponseSchema.parse(response).data;
};

export const createIamUser = async (accessToken: string, input: IamCreateUserRequest) => {
  const body = iamCreateUserRequestSchema.parse(input);
  const response = await requestJson('/iam/users', {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamUserMutationResponseSchema.parse(response).data;
};

export const updateIamUser = async (accessToken: string, userId: string, input: IamUpdateUserRequest) => {
  const body = iamUpdateUserRequestSchema.parse(input);
  const response = await requestJson(`/iam/users/${encodeURIComponent(userId)}`, {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return iamUserMutationResponseSchema.parse(response).data;
};

export const deleteIamUser = async (accessToken: string, userId: string) => {
  const response = await requestJson(`/iam/users/${encodeURIComponent(userId)}`, {
    headers: createHeaders(accessToken),
    method: 'DELETE',
  });

  return iamUserMutationResponseSchema.parse(response).data;
};

export const createIamRole = async (accessToken: string, input: IamCreateRoleRequest) => {
  const body = iamCreateRoleRequestSchema.parse(input);
  const response = await requestJson('/iam/roles', {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamRoleMutationResponseSchema.parse(response).data;
};

export const updateIamRole = async (accessToken: string, roleId: string, input: IamUpdateRoleRequest) => {
  const body = iamUpdateRoleRequestSchema.parse(input);
  const response = await requestJson(`/iam/roles/${encodeURIComponent(roleId)}`, {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return iamRoleMutationResponseSchema.parse(response).data;
};

export const deleteIamRole = async (accessToken: string, roleId: string) => {
  const response = await requestJson(`/iam/roles/${encodeURIComponent(roleId)}`, {
    headers: createHeaders(accessToken),
    method: 'DELETE',
  });

  return iamRoleMutationResponseSchema.parse(response).data;
};

export const createIamPermission = async (accessToken: string, input: IamCreatePermissionRequest) => {
  const body = iamCreatePermissionRequestSchema.parse(input);
  const response = await requestJson('/iam/permissions', {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamPermissionMutationResponseSchema.parse(response).data;
};

export const updateIamPermission = async (
  accessToken: string,
  permissionId: string,
  input: IamUpdatePermissionRequest,
) => {
  const body = iamUpdatePermissionRequestSchema.parse(input);
  const response = await requestJson(`/iam/permissions/${encodeURIComponent(permissionId)}`, {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return iamPermissionMutationResponseSchema.parse(response).data;
};

export const deleteIamPermission = async (accessToken: string, permissionId: string) => {
  const response = await requestJson(`/iam/permissions/${encodeURIComponent(permissionId)}`, {
    headers: createHeaders(accessToken),
    method: 'DELETE',
  });

  return iamPermissionMutationResponseSchema.parse(response).data;
};

export const createIamMenu = async (accessToken: string, input: IamCreateMenuRequest) => {
  const body = iamCreateMenuRequestSchema.parse(input);
  const response = await requestJson('/iam/menus', {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamMenuMutationResponseSchema.parse(response).data;
};

export const updateIamMenu = async (accessToken: string, menuId: string, input: IamUpdateMenuRequest) => {
  const body = iamUpdateMenuRequestSchema.parse(input);
  const response = await requestJson(`/iam/menus/${encodeURIComponent(menuId)}`, {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return iamMenuMutationResponseSchema.parse(response).data;
};

export const deleteIamMenu = async (accessToken: string, menuId: string) => {
  const response = await requestJson(`/iam/menus/${encodeURIComponent(menuId)}`, {
    headers: createHeaders(accessToken),
    method: 'DELETE',
  });

  return iamMenuMutationResponseSchema.parse(response).data;
};

export const createIamPolicy = async (accessToken: string, input: IamCreatePolicyRequest) => {
  const body = iamCreatePolicyRequestSchema.parse(input);
  const response = await requestJson('/iam/policies', {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamPolicyMutationResponseSchema.parse(response).data;
};

export const updateIamPolicy = async (accessToken: string, policyId: string, input: IamUpdatePolicyRequest) => {
  const body = iamUpdatePolicyRequestSchema.parse(input);
  const response = await requestJson(`/iam/policies/${encodeURIComponent(policyId)}`, {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return iamPolicyMutationResponseSchema.parse(response).data;
};

export const deleteIamPolicy = async (accessToken: string, policyId: string) => {
  const response = await requestJson(`/iam/policies/${encodeURIComponent(policyId)}`, {
    headers: createHeaders(accessToken),
    method: 'DELETE',
  });

  return iamPolicyMutationResponseSchema.parse(response).data;
};

export const createIamFieldPermission = async (accessToken: string, input: IamCreateFieldPermissionRequest) => {
  const body = iamCreateFieldPermissionRequestSchema.parse(input);
  const response = await requestJson('/iam/field-permissions', {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return iamFieldPermissionMutationResponseSchema.parse(response).data;
};

export const updateIamFieldPermission = async (
  accessToken: string,
  fieldPermissionId: string,
  input: IamUpdateFieldPermissionRequest,
) => {
  const body = iamUpdateFieldPermissionRequestSchema.parse(input);
  const response = await requestJson(`/iam/field-permissions/${encodeURIComponent(fieldPermissionId)}`, {
    body: JSON.stringify(body),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return iamFieldPermissionMutationResponseSchema.parse(response).data;
};

export const deleteIamFieldPermission = async (accessToken: string, fieldPermissionId: string) => {
  const response = await requestJson(`/iam/field-permissions/${encodeURIComponent(fieldPermissionId)}`, {
    headers: createHeaders(accessToken),
    method: 'DELETE',
  });

  return iamFieldPermissionMutationResponseSchema.parse(response).data;
};
