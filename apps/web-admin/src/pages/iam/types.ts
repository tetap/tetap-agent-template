import type {
  FieldPermission,
  IamMenuNode,
  IamOperationLogsData,
  IamPermission,
  IamPolicy,
  IamRole,
  IamSession,
  IamUser,
} from '@tetap/schema/iam';

export type IamSection =
  | 'users'
  | 'roles'
  | 'permissions'
  | 'menus'
  | 'sessions'
  | 'fields'
  | 'policies'
  | 'operationLogs';

export type PermissionTypeInput = 'MENU' | 'API' | 'BUTTON' | 'FIELD' | 'DATA';
export type PolicyEffectInput = 'ALLOW' | 'DENY';
export type FieldPermissionTypeInput = 'HIDE' | 'MASK' | 'READONLY' | 'READWRITE';
export type DataScopeTypeInput = 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM';

export type RoleItem = IamRole;
export type UserItem = IamUser;
export type PermissionItem = IamPermission;

export type IamPageData = {
  fieldPermissions: FieldPermission[];
  menus: IamMenuNode[];
  permissions: IamPermission[];
  policies: IamPolicy[];
  roles: IamRole[];
  sessions: IamSession[];
  users: IamUser[];
};

export type RoleEditorState = {
  code: string;
  dataScopeType: DataScopeTypeInput;
  deptIds: string;
  description: string;
  name: string;
  permissionCodes: string;
};

export type UserFormState = {
  deptId: string;
  email: string;
  password: string;
  roleCodes: string;
  username: string;
};

export type PermissionFormState = {
  action: string;
  code: string;
  name: string;
  resource: string;
  type: string;
};

export type MenuFormState = {
  component: string;
  icon: string;
  name: string;
  order: string;
  parentId: string;
  path: string;
  permissionCodes: string;
};

export type FieldFormState = {
  fieldName: string;
  permissionType: string;
  resource: string;
  roleCode: string;
};

export type PolicyFormState = {
  action: string;
  conditions: string;
  effect: string;
  resource: string;
};

export type CreateDialogKind = Exclude<IamSection, 'roles' | 'sessions' | 'operationLogs'>;

export type IamOperationLogsState = IamOperationLogsData | null;
