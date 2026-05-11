export type PermissionType = 'MENU' | 'API' | 'BUTTON' | 'FIELD' | 'DATA';

export type FieldPermissionType = 'HIDE' | 'MASK' | 'READONLY' | 'READWRITE';

export type DataScopeType = 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM';

export type PolicyEffect = 'ALLOW' | 'DENY';

export type SessionStatus = 'ONLINE' | 'OFFLINE' | 'REVOKED' | 'EXPIRED';

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED';

export type DeviceType = 'WEB' | 'IOS' | 'ANDROID' | 'DESKTOP' | 'UNKNOWN';

export type PermissionCode = `${string}:${string}`;

export type IamUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  deptId: string;
  tenantId: string;
  isSuperAdmin: boolean;
  roleCodes: string[];
  tokenVersion: number;
};

export type IamFrontendUser = {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  deptId: string;
  tenantId: string;
};

export type IamRole = {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissionCodes: PermissionCode[];
  dataScope: DataScope;
};

export type IamPermission = {
  id: string;
  code: PermissionCode;
  name: string;
  type: PermissionType;
  resource: string;
  action: string;
};

export type IamMenu = {
  id: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  parentId?: string;
  permissionCodes: PermissionCode[];
  order: number;
};

export type IamMenuNode = IamMenu & {
  children: IamMenuNode[];
};

export type FieldPermission = {
  id: string;
  roleCode: string;
  resource: string;
  fieldName: string;
  permissionType: FieldPermissionType;
};

export type DataScope = {
  type: DataScopeType;
  deptIds?: string[];
  ownerField?: string;
  deptField?: string;
};

export type DataConstraint = {
  scope: DataScopeType;
  where: Record<string, unknown>;
};

export type PolicyConditionOperator = 'eq' | 'neq' | 'in' | 'contains' | 'between' | 'exists';

export type PolicyCondition = {
  source: 'user' | 'resource' | 'environment';
  path: string;
  operator: PolicyConditionOperator;
  value?: unknown;
};

export type PolicyConditions = {
  all?: PolicyCondition[];
  any?: PolicyCondition[];
};

export type IamPolicy = {
  id: string;
  resource: string;
  action: string;
  effect: PolicyEffect;
  conditions: PolicyConditions;
  description?: string;
  enabled?: boolean;
};

export type IamSession = {
  id: string;
  userId: string;
  username?: string;
  email?: string;
  tokenId: string;
  deviceType: DeviceType;
  ip: string;
  userAgent: string;
  loginTime: string;
  lastActiveTime: string;
  expiresAt: string;
  status: SessionStatus;
  revokedAt?: string;
  revokedReason?: string;
};

export type OperationAction =
  | 'BACKEND_OPERATION'
  | 'LOGIN'
  | 'REFRESH'
  | 'LOGOUT'
  | 'FORCE_LOGOUT'
  | 'PERMISSION_DENIED'
  | 'POLICY_DENIED'
  | 'SESSION_TOUCH'
  | 'IAM_READ'
  | 'IAM_MUTATION';

export type OperationLog = {
  id: string;
  operator: string;
  operatorUserId?: string;
  operation: OperationAction;
  operationItem: string;
  operationDetail: Record<string, unknown>;
  operationTime: string;
  operationIp?: string;
  resource: string;
  resourceId?: string;
  userAgent?: string;
  result: 'SUCCESS' | 'FAILURE';
};

export type JwtTokenType = 'access' | 'refresh';

export type IamJwtPayload = {
  sub: string;
  tokenId: string;
  roles: string[];
  permissions: PermissionCode[];
  tenantId: string;
  tokenVersion: number;
  type: JwtTokenType;
  iat: number;
  exp: number;
};

export type AuthenticatedUserContext = {
  user: Omit<IamUser, 'passwordHash'>;
  session: IamSession;
  roles: IamRole[];
  capabilities: PermissionCode[];
};

export type LoginInput = {
  username: string;
  password: string;
  deviceType?: DeviceType;
  ip?: string;
  userAgent?: string;
  rememberMe?: boolean;
};

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  tokenId: string;
};

export type LoginResult = AuthTokenPair & {
  user: AuthenticatedUserContext['user'];
  capabilities: PermissionCode[];
  menus: IamMenuNode[];
};

export type IamDataSet = {
  adminUsers: IamUser[];
  frontendUsers: IamFrontendUser[];
  frontendSessions: IamSession[];
  roles: IamRole[];
  permissions: IamPermission[];
  menus: IamMenu[];
  fieldPermissions: FieldPermission[];
  policies: IamPolicy[];
};

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  status?: UserStatus;
  deptId?: string;
  tenantId?: string;
  isSuperAdmin?: boolean;
  roleCodes?: string[];
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & {
  password?: string;
};

export type CreateRoleInput = {
  name: string;
  code: string;
  description?: string;
  permissionCodes?: string[];
  dataScope?: DataScope;
};

export type UpdateRoleInput = Partial<CreateRoleInput>;

export type CreatePermissionInput = {
  code: string;
  name: string;
  type: PermissionType;
  resource: string;
  action: string;
};

export type UpdatePermissionInput = Partial<CreatePermissionInput>;

export type CreateMenuInput = {
  name: string;
  path: string;
  component: string;
  icon: string;
  parentId?: string;
  permissionCodes?: string[];
  order?: number;
};

export type UpdateMenuInput = Partial<CreateMenuInput>;

export type CreateFieldPermissionInput = {
  roleCode: string;
  resource: string;
  fieldName: string;
  permissionType: FieldPermissionType;
};

export type UpdateFieldPermissionInput = Partial<CreateFieldPermissionInput>;

export type CreatePolicyInput = {
  resource: string;
  action: string;
  effect: PolicyEffect;
  conditions: PolicyConditions;
  description?: string;
  enabled?: boolean;
};

export type UpdatePolicyInput = Partial<CreatePolicyInput>;

export type IamMutationMeta = {
  actorUserId?: string;
  ip?: string;
  userAgent?: string;
};
