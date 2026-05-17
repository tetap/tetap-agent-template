import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Database,
  Edit,
  KeyRound,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { getUserTimeZone, useAdminSessionStore, useAdminT } from '@tetap/hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FieldGroup,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  toast,
} from '@tetap/ui';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { SearchCommand } from '../layout/search-command.js';
import { ThemeSwitch } from '../layout/theme-switch.js';
import {
  createIamFieldPermission,
  createIamMenu,
  createIamPermission,
  createIamPolicy,
  createIamRole,
  createIamUser,
  BackendAdminRequestError,
  deleteIamFieldPermission,
  deleteIamMenu,
  deleteIamPermission,
  deleteIamPolicy,
  deleteIamRole,
  deleteIamUser,
  fetchIamFieldPermissions,
  fetchIamMenus,
  fetchIamOperationLogs,
  fetchIamPermissions,
  fetchIamPolicies,
  fetchIamRoles,
  fetchIamSessions,
  fetchIamUsers,
  revokeIamSession,
  updateIamRole,
  updateIamUser,
  updateIamFieldPermission,
  updateIamPolicy,
} from '../api/backend-admin.js';
import type {
  FieldPermission,
  IamCreatePolicyRequest,
  IamCreateRoleRequest,
  IamMenuNode,
  IamOperationLogsData,
  IamPermission,
  IamPolicy,
  IamRole,
  IamSession,
  IamUser,
} from '@tetap/schema/iam';
import {
  EnumSelectField,
  MultiSearchSelectField,
  SearchableSelectField,
  TextField,
  type PickerOption,
} from './iam/form-fields.js';
import { ConfirmActionButton } from './iam/confirm-action-button.js';
import { MenusSection } from './iam/menus-section.js';
import { OperationLogsTable, type OperationLogQueryState } from './iam/operation-logs-table.js';
import { PermissionsSection } from './iam/permissions-section.js';
import { AssignedUsersDialog, PermissionChecklist } from './iam/role-pickers.js';
import { SessionsSection } from './iam/sessions-section.js';
import { UsersSection } from './iam/users-section.js';

type IamSection = 'users' | 'roles' | 'permissions' | 'menus' | 'sessions' | 'fields' | 'policies' | 'operationLogs';
type PermissionTypeInput = 'MENU' | 'API' | 'BUTTON' | 'FIELD' | 'DATA';
type PolicyEffectInput = 'ALLOW' | 'DENY';
type FieldPermissionTypeInput = 'HIDE' | 'MASK' | 'READONLY' | 'READWRITE';
type DataScopeTypeInput = 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM';
type RoleItem = IamRole;
type UserItem = IamUser;
type PermissionItem = IamPermission;
type IamPageData = {
  fieldPermissions: FieldPermission[];
  menus: IamMenuNode[];
  permissions: IamPermission[];
  policies: IamPolicy[];
  roles: IamRole[];
  sessions: IamSession[];
  users: IamUser[];
};
type RoleEditorState = {
  name: string;
  code: string;
  description: string;
  permissionCodes: string;
  dataScopeType: DataScopeTypeInput;
  deptIds: string;
};

const parseCsv = (value: string) =>
  value.split(',').flatMap(item => {
    const trimmed = item.trim();

    return trimmed ? [trimmed] : [];
  });

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const flattenIamMenus = (menu: IamMenuNode): IamMenuNode[] => [menu, ...menu.children.flatMap(flattenIamMenus)];

const parsePolicyConditions = (value: string) => JSON.parse(value) as IamCreatePolicyRequest['conditions'];

const emptyIamPageData = (): IamPageData => ({
  fieldPermissions: [],
  menus: [],
  permissions: [],
  policies: [],
  roles: [],
  sessions: [],
  users: [],
});

let cachedIamPageData: IamPageData = emptyIamPageData();
let cachedOperationLogData: IamOperationLogsData | null = null;
let cachedLoadedSections = new Set<IamSection>();

const hasSectionData = (section: IamSection, data: IamPageData, operationLogs: IamOperationLogsData | null) => {
  switch (section) {
    case 'users':
      return data.users.length > 0;
    case 'roles':
      return data.roles.length > 0;
    case 'permissions':
      return data.permissions.length > 0;
    case 'menus':
      return data.menus.length > 0;
    case 'sessions':
      return data.sessions.length > 0;
    case 'fields':
      return data.fieldPermissions.length > 0;
    case 'policies':
      return data.policies.length > 0;
    case 'operationLogs':
      return Boolean(operationLogs);
    default:
      return false;
  }
};

const isSectionLoaded = (section: IamSection, loadedSections: Set<IamSection>) =>
  loadedSections.has(section) || hasSectionData(section, cachedIamPageData, cachedOperationLogData);

const stringifyPolicyConditions = (conditions: IamPolicy['conditions']) => JSON.stringify(conditions);

const hasIssueMessages = (error: unknown): error is { issues: Array<{ message?: unknown }> } =>
  Boolean(error && typeof error === 'object' && Array.isArray((error as { issues?: unknown }).issues));

const resolveBackendErrorDetail = (error: BackendAdminRequestError) => {
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

const resolveBackendErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof BackendAdminRequestError) {
    return resolveBackendErrorDetail(error) ?? fallback;
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

const toPermissionType = (value: string): PermissionTypeInput =>
  ['MENU', 'API', 'BUTTON', 'FIELD', 'DATA'].includes(value) ? (value as PermissionTypeInput) : 'API';

const toPolicyEffect = (value: string): PolicyEffectInput => (value === 'DENY' ? 'DENY' : 'ALLOW');

const toFieldPermissionType = (value: string): FieldPermissionTypeInput =>
  ['HIDE', 'MASK', 'READONLY', 'READWRITE'].includes(value) ? (value as FieldPermissionTypeInput) : 'MASK';

const toDataScopeType = (value: string): DataScopeTypeInput =>
  ['ALL', 'DEPT', 'DEPT_AND_CHILD', 'SELF', 'CUSTOM'].includes(value) ? (value as DataScopeTypeInput) : 'SELF';

const emptyRoleEditorState = (): RoleEditorState => ({
  code: '',
  dataScopeType: 'DEPT_AND_CHILD',
  deptIds: '',
  description: '',
  name: '',
  permissionCodes: '',
});

const roleToEditorState = (role: RoleItem): RoleEditorState => ({
  code: role.code,
  dataScopeType: role.dataScope.type,
  deptIds: role.dataScope.deptIds?.join(', ') ?? '',
  description: role.description ?? '',
  name: role.name,
  permissionCodes: role.permissionCodes.join(', '),
});

const roleEditorToPayload = (form: RoleEditorState): IamCreateRoleRequest => {
  const deptIds = parseCsv(form.deptIds);

  return {
    code: form.code,
    dataScope: {
      type: toDataScopeType(form.dataScopeType),
      ...(deptIds.length ? { deptField: 'deptId', deptIds } : {}),
    },
    description: form.description || undefined,
    name: form.name,
    permissionCodes: parseCsv(form.permissionCodes),
  };
};

const dataScopeLabels = {
  ALL: 'webAdmin.iam.dataScopes.all',
  CUSTOM: 'webAdmin.iam.dataScopes.custom',
  DEPT: 'webAdmin.iam.dataScopes.dept',
  DEPT_AND_CHILD: 'webAdmin.iam.dataScopes.deptAndChild',
  SELF: 'webAdmin.iam.dataScopes.self',
} as const;

const permissionTypeOptions: { label: PermissionTypeInput; value: PermissionTypeInput }[] = [
  { label: 'API', value: 'API' },
  { label: 'MENU', value: 'MENU' },
  { label: 'BUTTON', value: 'BUTTON' },
  { label: 'FIELD', value: 'FIELD' },
  { label: 'DATA', value: 'DATA' },
];

const fieldPermissionTypeOptions: { label: FieldPermissionTypeInput; value: FieldPermissionTypeInput }[] = [
  { label: 'HIDE', value: 'HIDE' },
  { label: 'MASK', value: 'MASK' },
  { label: 'READONLY', value: 'READONLY' },
  { label: 'READWRITE', value: 'READWRITE' },
];

const policyEffectOptions: { label: PolicyEffectInput; value: PolicyEffectInput }[] = [
  { label: 'ALLOW', value: 'ALLOW' },
  { label: 'DENY', value: 'DENY' },
];

const dataScopeOptions: { label: string; value: DataScopeTypeInput }[] = [
  { label: dataScopeLabels.ALL, value: 'ALL' },
  { label: dataScopeLabels.CUSTOM, value: 'CUSTOM' },
  { label: dataScopeLabels.DEPT, value: 'DEPT' },
  { label: dataScopeLabels.DEPT_AND_CHILD, value: 'DEPT_AND_CHILD' },
  { label: dataScopeLabels.SELF, value: 'SELF' },
];

const iamSectionCopy = {
  users: {
    titleKey: 'webAdmin.iam.pages.users.title',
    descriptionKey: 'webAdmin.iam.pages.users.description',
  },
  roles: {
    titleKey: 'webAdmin.iam.pages.roles.title',
    descriptionKey: 'webAdmin.iam.pages.roles.description',
  },
  permissions: {
    titleKey: 'webAdmin.iam.pages.permissions.title',
    descriptionKey: 'webAdmin.iam.pages.permissions.description',
  },
  menus: {
    titleKey: 'webAdmin.iam.pages.menus.title',
    descriptionKey: 'webAdmin.iam.pages.menus.description',
  },
  sessions: {
    titleKey: 'webAdmin.iam.pages.sessions.title',
    descriptionKey: 'webAdmin.iam.pages.sessions.description',
  },
  fields: {
    titleKey: 'webAdmin.iam.pages.fields.title',
    descriptionKey: 'webAdmin.iam.pages.fields.description',
  },
  policies: {
    titleKey: 'webAdmin.iam.pages.policies.title',
    descriptionKey: 'webAdmin.iam.pages.policies.description',
  },
  operationLogs: {
    titleKey: 'webAdmin.iam.pages.operationLogs.title',
    descriptionKey: 'webAdmin.iam.pages.operationLogs.description',
  },
} as const;

export const AdminIamPage = ({ section = 'users' }: { section?: IamSection }) => {
  const t = useAdminT();
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const can = useAdminSessionStore(state => state.auth.can);
  const [data, setData] = useState<IamPageData>(() => cachedIamPageData);
  const [operationLogData, setOperationLogData] = useState<IamOperationLogsData | null>(() => cachedOperationLogData);
  const [loadedSections, setLoadedSections] = useState<Set<IamSection>>(() => new Set(cachedLoadedSections));
  const [operationLogQuery, setOperationLogQuery] = useState<OperationLogQueryState>({
    page: 1,
    pageSize: 20,
    search: '',
    sort: 'desc',
  });
  const [isLoading, setIsLoading] = useState(() => !isSectionLoaded(section, cachedLoadedSections));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [createDialog, setCreateDialog] = useState<Exclude<IamSection, 'roles' | 'sessions' | 'operationLogs'> | null>(
    null,
  );
  const [editingFieldPermissionId, setEditingFieldPermissionId] = useState<string | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    roleCodes: '',
    deptId: '',
  });
  const [permissionForm, setPermissionForm] = useState({
    code: '',
    name: '',
    type: 'API',
    resource: '',
    action: '',
  });
  const [menuForm, setMenuForm] = useState({
    name: '',
    path: '',
    component: '',
    icon: 'ShieldCheck',
    parentId: '',
    permissionCodes: '',
    order: '0',
  });
  const [fieldForm, setFieldForm] = useState({
    roleCode: '',
    resource: '',
    fieldName: '',
    permissionType: 'MASK',
  });
  const [policyForm, setPolicyForm] = useState({
    resource: '',
    action: '',
    effect: 'ALLOW',
    conditions: '{"all":[]}',
  });
  const canManageUsers = can('user:update');
  const canManageRoles = can('role:update');
  const canManageIam = can('iam:manage');
  const canUpdatePolicy = can('policy:update');
  const canRevokeSessions = can('session:revoke');
  const timeZone = getUserTimeZone();

  const changeCreateDialog = (dialog: CreateDialogKind | null) => {
    setCreateDialog(dialog);

    if (!dialog) {
      setEditingFieldPermissionId(null);
      setEditingPolicyId(null);
    }
  };

  const loadSectionData = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      setIsRefreshing(false);
      toast.error(t('webAdmin.iam.states.loginExpired'));
      return;
    }

    setIsRefreshing(true);
    setIsLoading(!isSectionLoaded(section, cachedLoadedSections));

    try {
      const patch: Partial<IamPageData> = {};

      if (section === 'users') {
        const [users, roles] = await Promise.all([fetchIamUsers(accessToken), fetchIamRoles(accessToken)]);

        patch.users = users;
        patch.roles = roles;
      } else if (section === 'roles') {
        const [roles, users, permissions] = await Promise.all([
          fetchIamRoles(accessToken),
          fetchIamUsers(accessToken),
          fetchIamPermissions(accessToken),
        ]);

        patch.roles = roles;
        patch.users = users;
        patch.permissions = permissions;
      } else if (section === 'permissions') {
        patch.permissions = await fetchIamPermissions(accessToken);
      } else if (section === 'menus') {
        const [menus, permissions] = await Promise.all([fetchIamMenus(accessToken), fetchIamPermissions(accessToken)]);

        patch.menus = menus;
        patch.permissions = permissions;
      } else if (section === 'sessions') {
        patch.sessions = await fetchIamSessions(accessToken);
      } else if (section === 'fields') {
        const [fieldPermissions, roles] = await Promise.all([
          fetchIamFieldPermissions(accessToken),
          fetchIamRoles(accessToken),
        ]);

        patch.fieldPermissions = fieldPermissions;
        patch.roles = roles;
      } else if (section === 'policies') {
        patch.policies = await fetchIamPolicies(accessToken);
      } else if (section === 'operationLogs') {
        const logs = await fetchIamOperationLogs(accessToken, operationLogQuery);

        cachedOperationLogData = logs;
        setOperationLogData(logs);
      }

      if (Object.keys(patch).length > 0) {
        cachedIamPageData = { ...cachedIamPageData, ...patch };
        setData(cachedIamPageData);
      }

      cachedLoadedSections = new Set([...cachedLoadedSections, section]);
      setLoadedSections(new Set(cachedLoadedSections));
    } catch (error) {
      toast.error(resolveBackendErrorMessage(error, t('webAdmin.iam.states.loadFailed')));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, operationLogQuery, section, t]);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      if (!accessToken) {
        toast.error(t('webAdmin.iam.states.loginExpired'));
        return;
      }

      setIsMutating(true);

      try {
        await revokeIamSession(accessToken, sessionId);
        toast.success(t('webAdmin.iam.states.mutationOk'));
        await loadSectionData();
      } catch (error) {
        toast.error(resolveBackendErrorMessage(error, t('webAdmin.iam.states.revokeFailed')));
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, loadSectionData, t],
  );

  const runMutation = useCallback(
    async (operation: (token: string) => Promise<unknown>) => {
      if (!accessToken) {
        toast.error(t('webAdmin.iam.states.loginExpired'));
        return false;
      }

      setIsMutating(true);

      try {
        await operation(accessToken);
        toast.success(t('webAdmin.iam.states.mutationOk'));
        await loadSectionData();
        return true;
      } catch (error) {
        toast.error(resolveBackendErrorMessage(error, t('webAdmin.iam.states.mutationFailed')));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, loadSectionData, t],
  );

  const submitUser = () =>
    runMutation(token =>
      createIamUser(token, {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        deptId: userForm.deptId || undefined,
        roleCodes: parseCsv(userForm.roleCodes),
      }),
    );

  const submitPermission = () =>
    runMutation(token =>
      createIamPermission(token, {
        code: permissionForm.code,
        name: permissionForm.name,
        type: toPermissionType(permissionForm.type),
        resource: permissionForm.resource,
        action: permissionForm.action,
      }),
    );

  const submitMenu = () =>
    runMutation(token =>
      createIamMenu(token, {
        name: menuForm.name,
        path: menuForm.path,
        component: menuForm.component,
        icon: menuForm.icon,
        parentId: menuForm.parentId || undefined,
        permissionCodes: parseCsv(menuForm.permissionCodes),
        order: Number.parseInt(menuForm.order, 10) || 0,
      }),
    );

  const submitFieldPermission = () =>
    runMutation(token =>
      editingFieldPermissionId
        ? updateIamFieldPermission(token, editingFieldPermissionId, {
            roleCode: fieldForm.roleCode,
            resource: fieldForm.resource,
            fieldName: fieldForm.fieldName,
            permissionType: toFieldPermissionType(fieldForm.permissionType),
          })
        : createIamFieldPermission(token, {
            roleCode: fieldForm.roleCode,
            resource: fieldForm.resource,
            fieldName: fieldForm.fieldName,
            permissionType: toFieldPermissionType(fieldForm.permissionType),
          }),
    );

  const submitPolicy = () =>
    runMutation(token =>
      editingPolicyId
        ? updateIamPolicy(token, editingPolicyId, {
            resource: policyForm.resource,
            action: policyForm.action,
            effect: toPolicyEffect(policyForm.effect),
            conditions: parsePolicyConditions(policyForm.conditions),
          })
        : createIamPolicy(token, {
            resource: policyForm.resource,
            action: policyForm.action,
            effect: toPolicyEffect(policyForm.effect),
            conditions: parsePolicyConditions(policyForm.conditions),
          }),
    );

  const openCreateFieldPermission = () => {
    setEditingFieldPermissionId(null);
    setFieldForm({ fieldName: '', permissionType: 'MASK', resource: '', roleCode: '' });
    setCreateDialog('fields');
  };

  const openEditFieldPermission = (fieldPermission: FieldPermission) => {
    setEditingFieldPermissionId(fieldPermission.id);
    setFieldForm({
      fieldName: fieldPermission.fieldName,
      permissionType: fieldPermission.permissionType,
      resource: fieldPermission.resource,
      roleCode: fieldPermission.roleCode,
    });
    setCreateDialog('fields');
  };

  const openCreatePolicy = () => {
    setEditingPolicyId(null);
    setPolicyForm({ action: '', conditions: '{"all":[]}', effect: 'ALLOW', resource: '' });
    setCreateDialog('policies');
  };

  const openEditPolicy = (policy: IamPolicy) => {
    setEditingPolicyId(policy.id);
    setPolicyForm({
      action: policy.action,
      conditions: JSON.stringify(policy.conditions),
      effect: policy.effect,
      resource: policy.resource,
    });
    setCreateDialog('policies');
  };

  const openCreateUser = useCallback(() => {
    setCreateDialog('users');
  }, []);

  const openCreatePermission = useCallback(() => {
    setCreateDialog('permissions');
  }, []);

  const openCreateMenu = useCallback(() => {
    setCreateDialog('menus');
  }, []);

  const toggleUserStatus = useCallback(
    (user: UserItem) => {
      void runMutation(token =>
        updateIamUser(token, user.id, {
          status: user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
        }),
      );
    },
    [runMutation],
  );

  const deleteUser = useCallback(
    (user: UserItem) => {
      void runMutation(token => deleteIamUser(token, user.id));
    },
    [runMutation],
  );

  const deletePermission = useCallback(
    (permission: PermissionItem) => {
      void runMutation(token => deleteIamPermission(token, permission.id));
    },
    [runMutation],
  );

  const deleteMenu = useCallback(
    (menu: IamMenuNode) => {
      void runMutation(token => deleteIamMenu(token, menu.id));
    },
    [runMutation],
  );

  const revokeUserSession = useCallback(
    (session: IamSession) => {
      void revokeSession(session.id);
    },
    [revokeSession],
  );

  useEffect(() => {
    void loadSectionData();
  }, [loadSectionData]);

  if (isLoading) {
    return (
      <IamPageFrame>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </IamPageFrame>
    );
  }

  return (
    <IamPageFrame>
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 id="admin-iam-title" className="text-2xl font-semibold">
              {t(iamSectionCopy[section].titleKey)}
            </h1>
            <p className="text-muted-foreground">{t(iamSectionCopy[section].descriptionKey)}</p>
          </div>
          <Button disabled={isRefreshing} onClick={() => void loadSectionData()} variant="outline">
            <RefreshCw className={isRefreshing ? 'animate-spin' : undefined} data-icon="inline-start" />
            {t('webAdmin.iam.actions.refresh')}
          </Button>
        </div>
      </section>

      {isSectionLoaded(section, loadedSections) ? (
        <>
          <CreateIamDialogs
            dialog={createDialog}
            fieldForm={fieldForm}
            isMutating={isMutating}
            menuForm={menuForm}
            onDialogChange={changeCreateDialog}
            onFieldFormChange={setFieldForm}
            onMenuFormChange={setMenuForm}
            onPermissionFormChange={setPermissionForm}
            onPolicyFormChange={setPolicyForm}
            onSubmitFieldPermission={() => void submitFieldPermission().then(ok => ok && changeCreateDialog(null))}
            onSubmitMenu={() => void submitMenu().then(ok => ok && changeCreateDialog(null))}
            onSubmitPermission={() => void submitPermission().then(ok => ok && changeCreateDialog(null))}
            onSubmitPolicy={() => void submitPolicy().then(ok => ok && changeCreateDialog(null))}
            onSubmitUser={() => void submitUser().then(ok => ok && changeCreateDialog(null))}
            onUserFormChange={setUserForm}
            data={data}
            permissionForm={permissionForm}
            policyForm={policyForm}
            userForm={userForm}
            fieldMode={editingFieldPermissionId ? 'edit' : 'create'}
            policyMode={editingPolicyId ? 'edit' : 'create'}
          />
          <Tabs className="min-w-0" value={section}>
            <TabsContent value="users">
              <UsersSection
                canManageUsers={canManageUsers}
                isMutating={isMutating}
                onCreate={openCreateUser}
                onDelete={deleteUser}
                onToggleStatus={toggleUserStatus}
                users={data.users}
              />
            </TabsContent>
            <TabsContent value="roles">
              <RoleManagementPanel
                canManageRoles={canManageRoles}
                isMutating={isMutating}
                onMutate={runMutation}
                permissions={data.permissions}
                roles={data.roles}
                users={data.users}
              />
            </TabsContent>
            <TabsContent value="permissions">
              <PermissionsSection
                canManageIam={canManageIam}
                isMutating={isMutating}
                onCreate={openCreatePermission}
                onDelete={deletePermission}
                permissions={data.permissions}
              />
            </TabsContent>
            <TabsContent value="menus">
              <MenusSection
                canManageIam={canManageIam}
                isMutating={isMutating}
                menus={data.menus}
                onCreate={openCreateMenu}
                onDelete={deleteMenu}
              />
            </TabsContent>
            <TabsContent value="sessions">
              <SessionsSection
                canRevokeSessions={canRevokeSessions}
                isMutating={isMutating}
                onRevoke={revokeUserSession}
                sessions={data.sessions}
                timeZone={timeZone}
              />
            </TabsContent>
            <TabsContent value="fields">
              <section className="grid min-w-0 gap-4">
                <FieldPermissionsTable
                  canManageIam={canManageIam}
                  fieldPermissions={data.fieldPermissions}
                  isMutating={isMutating}
                  onCreate={openCreateFieldPermission}
                  onDelete={fieldPermissionId =>
                    void runMutation(token => deleteIamFieldPermission(token, fieldPermissionId))
                  }
                  onEdit={openEditFieldPermission}
                />
              </section>
            </TabsContent>
            <TabsContent value="policies">
              <section className="grid min-w-0 gap-4">
                <PoliciesTable
                  canUpdatePolicy={canUpdatePolicy}
                  isMutating={isMutating}
                  onCreate={openCreatePolicy}
                  onDelete={policyId => void runMutation(token => deleteIamPolicy(token, policyId))}
                  onEdit={openEditPolicy}
                  policies={data.policies}
                />
              </section>
            </TabsContent>
            <TabsContent value="operationLogs">
              <section className="grid min-w-0 gap-4">
                <OperationLogsTable
                  isLoading={isRefreshing}
                  onQueryChange={setOperationLogQuery}
                  operationLogs={operationLogData}
                  query={operationLogQuery}
                  timeZone={timeZone}
                />
              </section>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </IamPageFrame>
  );
};

export const AdminUsersPage = () => <AdminIamPage section="users" />;

export const AdminRolesPage = () => <AdminIamPage section="roles" />;

export const AdminPermissionsPage = () => <AdminIamPage section="permissions" />;

export const AdminMenusPage = () => <AdminIamPage section="menus" />;

export const AdminFieldPermissionsPage = () => <AdminIamPage section="fields" />;

export const AdminPoliciesPage = () => <AdminIamPage section="policies" />;

export const AdminSessionsPage = () => <AdminIamPage section="sessions" />;

export const AdminOperationLogsPage = () => <AdminIamPage section="operationLogs" />;

const IamPageFrame = ({ children }: { children: ReactNode }) => (
  <>
    <AdminHeader>
      <div className="me-auto" />
      <SearchCommand />
      <ThemeSwitch />
    </AdminHeader>
    <AdminMain aria-labelledby="admin-iam-title" className="flex flex-col gap-4">
      {children}
    </AdminMain>
  </>
);

type CreateDialogKind = Exclude<IamSection, 'roles' | 'sessions' | 'operationLogs'>;

type UserFormState = {
  deptId: string;
  email: string;
  password: string;
  roleCodes: string;
  username: string;
};

type PermissionFormState = {
  action: string;
  code: string;
  name: string;
  resource: string;
  type: string;
};

type MenuFormState = {
  component: string;
  icon: string;
  name: string;
  order: string;
  parentId: string;
  path: string;
  permissionCodes: string;
};

type FieldFormState = {
  fieldName: string;
  permissionType: string;
  resource: string;
  roleCode: string;
};

type PolicyFormState = {
  action: string;
  conditions: string;
  effect: string;
  resource: string;
};

const CreateIamDialogs = ({
  dialog,
  fieldForm,
  isMutating,
  menuForm,
  onDialogChange,
  onFieldFormChange,
  onMenuFormChange,
  onPermissionFormChange,
  onPolicyFormChange,
  onSubmitFieldPermission,
  onSubmitMenu,
  onSubmitPermission,
  onSubmitPolicy,
  onSubmitUser,
  onUserFormChange,
  data,
  fieldMode,
  permissionForm,
  policyMode,
  policyForm,
  userForm,
}: {
  dialog: CreateDialogKind | null;
  fieldForm: FieldFormState;
  isMutating: boolean;
  menuForm: MenuFormState;
  onDialogChange: (dialog: CreateDialogKind | null) => void;
  onFieldFormChange: (form: FieldFormState) => void;
  onMenuFormChange: (form: MenuFormState) => void;
  onPermissionFormChange: (form: PermissionFormState) => void;
  onPolicyFormChange: (form: PolicyFormState) => void;
  onSubmitFieldPermission: () => void;
  onSubmitMenu: () => void;
  onSubmitPermission: () => void;
  onSubmitPolicy: () => void;
  onSubmitUser: () => void;
  onUserFormChange: (form: UserFormState) => void;
  data: IamPageData;
  fieldMode: 'create' | 'edit';
  permissionForm: PermissionFormState;
  policyMode: 'create' | 'edit';
  policyForm: PolicyFormState;
  userForm: UserFormState;
}) => {
  const t = useAdminT();
  const roleOptions = data.roles.map(role => ({
    description: role.description,
    label: `${role.name} (${role.code})`,
    value: role.code,
  }));
  const departmentOptions = [
    {
      description: t('webAdmin.iam.selection.defaultDeptDescription'),
      label: t('webAdmin.iam.selection.defaultDept'),
      value: '',
    },
    ...uniqueStrings([
      ...data.users.map(user => user.deptId),
      ...data.roles.flatMap(role => role.dataScope.deptIds ?? []),
    ])
      .sort()
      .map(deptId => ({
        label: t('webAdmin.iam.selection.department', { deptId }),
        value: deptId,
      })),
  ];
  const permissionOptions = data.permissions.map(permission => ({
    description: `${permission.type} / ${permission.resource}:${permission.action}`,
    label: permission.code,
    value: permission.code,
  }));
  const menuOptions = [
    {
      description: t('webAdmin.iam.selection.rootDescription'),
      label: t('webAdmin.iam.selection.rootMenu'),
      value: '',
    },
    ...data.menus.flatMap(menu =>
      flattenIamMenus(menu).map(menuItem => ({
        description: menuItem.path,
        label: menuItem.name,
        value: menuItem.id,
      })),
    ),
  ];
  const close = (open: boolean) => onDialogChange(open ? dialog : null);

  return (
    <>
      <Dialog onOpenChange={close} open={dialog === 'users'}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('webAdmin.iam.forms.userTitle')}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.forms.userDescription')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField
              label={t('webAdmin.iam.fields.username')}
              onChange={value => onUserFormChange({ ...userForm, username: value })}
              value={userForm.username}
            />
            <TextField
              label={t('webAdmin.iam.fields.email')}
              onChange={value => onUserFormChange({ ...userForm, email: value })}
              value={userForm.email}
            />
            <TextField
              label={t('webAdmin.iam.fields.password')}
              onChange={value => onUserFormChange({ ...userForm, password: value })}
              type="password"
              value={userForm.password}
            />
            <MultiSearchSelectField
              label={t('webAdmin.iam.fields.roleCodes')}
              onChange={values => onUserFormChange({ ...userForm, roleCodes: values.join(', ') })}
              options={roleOptions}
              values={parseCsv(userForm.roleCodes)}
            />
            <SearchableSelectField
              label={t('webAdmin.iam.fields.deptId')}
              onChange={value => onUserFormChange({ ...userForm, deptId: value })}
              options={departmentOptions}
              value={userForm.deptId}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={isMutating} onClick={onSubmitUser}>
              {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={close} open={dialog === 'permissions'}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('webAdmin.iam.forms.permissionTitle')}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.forms.permissionDescription')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField
              label={t('webAdmin.iam.fields.code')}
              onChange={value => onPermissionFormChange({ ...permissionForm, code: value })}
              value={permissionForm.code}
            />
            <TextField
              label={t('webAdmin.iam.fields.name')}
              onChange={value => onPermissionFormChange({ ...permissionForm, name: value })}
              value={permissionForm.name}
            />
            <EnumSelectField
              label={t('webAdmin.iam.fields.type')}
              onChange={value => onPermissionFormChange({ ...permissionForm, type: value })}
              options={permissionTypeOptions}
              value={toPermissionType(permissionForm.type)}
            />
            <TextField
              label={t('webAdmin.iam.fields.resource')}
              onChange={value => onPermissionFormChange({ ...permissionForm, resource: value })}
              value={permissionForm.resource}
            />
            <TextField
              label={t('webAdmin.iam.fields.action')}
              onChange={value => onPermissionFormChange({ ...permissionForm, action: value })}
              value={permissionForm.action}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={isMutating} onClick={onSubmitPermission}>
              {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={close} open={dialog === 'menus'}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('webAdmin.iam.forms.menuTitle')}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.forms.menuDescription')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField
              label={t('webAdmin.iam.fields.name')}
              onChange={value => onMenuFormChange({ ...menuForm, name: value })}
              value={menuForm.name}
            />
            <TextField
              label={t('webAdmin.iam.fields.path')}
              onChange={value => onMenuFormChange({ ...menuForm, path: value })}
              value={menuForm.path}
            />
            <TextField
              label={t('webAdmin.iam.fields.component')}
              onChange={value => onMenuFormChange({ ...menuForm, component: value })}
              value={menuForm.component}
            />
            <TextField
              label={t('webAdmin.iam.fields.icon')}
              onChange={value => onMenuFormChange({ ...menuForm, icon: value })}
              value={menuForm.icon}
            />
            <SearchableSelectField
              label={t('webAdmin.iam.fields.parentMenu')}
              onChange={value => onMenuFormChange({ ...menuForm, parentId: value })}
              options={menuOptions}
              value={menuForm.parentId}
            />
            <MultiSearchSelectField
              label={t('webAdmin.iam.fields.permissionCodes')}
              onChange={values => onMenuFormChange({ ...menuForm, permissionCodes: values.join(', ') })}
              options={permissionOptions}
              values={parseCsv(menuForm.permissionCodes)}
            />
            <TextField
              label={t('webAdmin.iam.fields.order')}
              onChange={value => onMenuFormChange({ ...menuForm, order: value })}
              value={menuForm.order}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={isMutating} onClick={onSubmitMenu}>
              {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={close} open={dialog === 'fields'}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {fieldMode === 'edit' ? t('webAdmin.iam.forms.fieldEditTitle') : t('webAdmin.iam.forms.fieldTitle')}
            </DialogTitle>
            <DialogDescription>{t('webAdmin.iam.forms.fieldDescription')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <SearchableSelectField
              label={t('webAdmin.iam.fields.roleCode')}
              onChange={value => onFieldFormChange({ ...fieldForm, roleCode: value })}
              options={roleOptions}
              value={fieldForm.roleCode}
            />
            <TextField
              label={t('webAdmin.iam.fields.resource')}
              onChange={value => onFieldFormChange({ ...fieldForm, resource: value })}
              value={fieldForm.resource}
            />
            <TextField
              label={t('webAdmin.iam.fields.fieldName')}
              onChange={value => onFieldFormChange({ ...fieldForm, fieldName: value })}
              value={fieldForm.fieldName}
            />
            <EnumSelectField
              label={t('webAdmin.iam.fields.permissionType')}
              onChange={value => onFieldFormChange({ ...fieldForm, permissionType: value })}
              options={fieldPermissionTypeOptions}
              value={toFieldPermissionType(fieldForm.permissionType)}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={isMutating} onClick={onSubmitFieldPermission}>
              {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={close} open={dialog === 'policies'}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {policyMode === 'edit' ? t('webAdmin.iam.forms.policyEditTitle') : t('webAdmin.iam.forms.policyTitle')}
            </DialogTitle>
            <DialogDescription>{t('webAdmin.iam.forms.policyDescription')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField
              label={t('webAdmin.iam.fields.resource')}
              onChange={value => onPolicyFormChange({ ...policyForm, resource: value })}
              value={policyForm.resource}
            />
            <TextField
              label={t('webAdmin.iam.fields.action')}
              onChange={value => onPolicyFormChange({ ...policyForm, action: value })}
              value={policyForm.action}
            />
            <EnumSelectField
              label={t('webAdmin.iam.fields.effect')}
              onChange={value => onPolicyFormChange({ ...policyForm, effect: value })}
              options={policyEffectOptions}
              value={toPolicyEffect(policyForm.effect)}
            />
            <TextField
              label={t('webAdmin.iam.fields.conditions')}
              onChange={value => onPolicyFormChange({ ...policyForm, conditions: value })}
              value={policyForm.conditions}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={isMutating} onClick={onSubmitPolicy}>
              {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RoleManagementPanel = ({
  canManageRoles,
  isMutating,
  onMutate,
  permissions,
  roles,
  users,
}: {
  canManageRoles: boolean;
  isMutating: boolean;
  onMutate: (operation: (token: string) => Promise<unknown>) => Promise<boolean>;
  permissions: PermissionItem[];
  roles: RoleItem[];
  users: UserItem[];
}) => {
  const t = useAdminT();
  const [query, setQuery] = useState({ code: '', dataScope: '', name: '' });
  const [appliedQuery, setAppliedQuery] = useState({ code: '', dataScope: '', name: '' });
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editorForm, setEditorForm] = useState<RoleEditorState>(emptyRoleEditorState);
  const [permissionRole, setPermissionRole] = useState<RoleItem | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<string[]>([]);
  const [dataScopeRole, setDataScopeRole] = useState<RoleItem | null>(null);
  const [dataScopeForm, setDataScopeForm] = useState({ dataScopeType: 'DEPT_AND_CHILD', deptIds: '' });
  const [assignRole, setAssignRole] = useState<RoleItem | null>(null);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [roleDeleteTarget, setRoleDeleteTarget] = useState<RoleItem | null>(null);
  const departmentOptions = uniqueStrings([
    ...users.map(user => user.deptId),
    ...roles.flatMap(role => role.dataScope.deptIds ?? []),
  ])
    .sort()
    .map(deptId => ({
      label: t('webAdmin.iam.selection.department', { deptId }),
      value: deptId,
    }));

  const normalizedName = appliedQuery.name.trim().toLowerCase();
  const normalizedCode = appliedQuery.code.trim().toLowerCase();
  const normalizedDataScope = appliedQuery.dataScope.trim().toLowerCase();
  const filteredRoles = roles.filter(role => {
    const nameMatches = !normalizedName || role.name.toLowerCase().includes(normalizedName);
    const codeMatches = !normalizedCode || role.code.toLowerCase().includes(normalizedCode);
    const scopeMatches = !normalizedDataScope || role.dataScope.type.toLowerCase().includes(normalizedDataScope);

    return nameMatches && codeMatches && scopeMatches;
  });
  const selectedRoles = roles.filter(role => selectedRoleIds.includes(role.id));
  const canEditSelected = selectedRoleIds.length === 1 && canManageRoles;
  const canDeleteSelected =
    selectedRoleIds.length > 0 && canManageRoles && selectedRoles.every(role => role.code !== 'super-admin');
  const areAllFilteredRolesSelected =
    filteredRoles.length > 0 && filteredRoles.every(role => selectedRoleIds.includes(role.id));

  const toggleRoleSelection = (roleId: string, checked: boolean | 'indeterminate') => {
    setSelectedRoleIds(current =>
      checked === true ? uniqueStrings([...current, roleId]) : current.filter(item => item !== roleId),
    );
  };

  const toggleAllFilteredRoles = (checked: boolean | 'indeterminate') => {
    setSelectedRoleIds(current => {
      const filteredIds = filteredRoles.map(role => role.id);

      if (checked === true) {
        return uniqueStrings([...current, ...filteredIds]);
      }

      return current.filter(roleId => !filteredIds.includes(roleId));
    });
  };

  const openCreateRole = () => {
    setEditingRoleId(null);
    setEditorForm(emptyRoleEditorState());
    setEditorOpen(true);
  };

  const openEditRole = (role: RoleItem) => {
    setEditingRoleId(role.id);
    setEditorForm(roleToEditorState(role));
    setEditorOpen(true);
  };

  const submitRoleEditor = async () => {
    const payload = roleEditorToPayload(editorForm);
    const roleId = editingRoleId;
    const ok = await onMutate(token =>
      roleId ? updateIamRole(token, roleId, payload) : createIamRole(token, payload),
    );

    if (ok) {
      setEditorOpen(false);
    }
  };

  const deleteRoleSelection = async () => {
    const targets = selectedRoles.filter(role => role.code !== 'super-admin');
    const ok = await onMutate(async token => Promise.all(targets.map(role => deleteIamRole(token, role.id))));

    if (ok) {
      setSelectedRoleIds([]);
    }
  };

  const openPermissionGrant = (role: RoleItem) => {
    setPermissionRole(role);
    setPermissionDraft(role.permissionCodes);
  };

  const togglePermission = (permissionCode: string, checked: boolean | 'indeterminate') => {
    setPermissionDraft(current =>
      checked === true ? uniqueStrings([...current, permissionCode]) : current.filter(item => item !== permissionCode),
    );
  };

  const submitPermissionGrant = async () => {
    if (!permissionRole) {
      return;
    }

    const ok = await onMutate(token => updateIamRole(token, permissionRole.id, { permissionCodes: permissionDraft }));

    if (ok) {
      setPermissionRole(null);
    }
  };

  const openDataScopeEditor = (role: RoleItem) => {
    setDataScopeRole(role);
    setDataScopeForm({
      dataScopeType: role.dataScope.type,
      deptIds: role.dataScope.deptIds?.join(', ') ?? '',
    });
  };

  const submitDataScope = async () => {
    if (!dataScopeRole) {
      return;
    }

    const payload = roleEditorToPayload({
      ...roleToEditorState(dataScopeRole),
      dataScopeType: toDataScopeType(dataScopeForm.dataScopeType),
      deptIds: dataScopeForm.deptIds,
    });

    const ok = await onMutate(token => updateIamRole(token, dataScopeRole.id, { dataScope: payload.dataScope }));

    if (ok) {
      setDataScopeRole(null);
    }
  };

  const openAssignedUsers = (role: RoleItem) => {
    setAssignRole(role);
    setAssignedUserIds(users.flatMap(user => (user.roleCodes.includes(role.code) ? [user.id] : [])));
  };

  const toggleAssignedUser = (userId: string, checked: boolean | 'indeterminate') => {
    setAssignedUserIds(current =>
      checked === true ? uniqueStrings([...current, userId]) : current.filter(item => item !== userId),
    );
  };

  const submitAssignedUsers = async () => {
    if (!assignRole) {
      return;
    }

    const ok = await onMutate(async token => {
      const updates = users.flatMap(user => {
        const shouldHaveRole = assignedUserIds.includes(user.id);
        const hasRole = user.roleCodes.includes(assignRole.code);

        if (shouldHaveRole === hasRole) {
          return [];
        }

        return [
          updateIamUser(token, user.id, {
            roleCodes: shouldHaveRole
              ? uniqueStrings([...user.roleCodes, assignRole.code])
              : user.roleCodes.filter(roleCode => roleCode !== assignRole.code),
          }),
        ];
      });

      return Promise.all(updates);
    });

    if (ok) {
      setAssignRole(null);
    }
  };

  const resetQuery = () => {
    const nextQuery = { code: '', dataScope: '', name: '' };

    setQuery(nextQuery);
    setAppliedQuery(nextQuery);
  };

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('webAdmin.iam.roleManager.filters.title')}</CardTitle>
          <CardDescription>{t('webAdmin.iam.roleManager.filters.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 md:grid-cols-3">
            <TextField
              label={t('webAdmin.iam.roleManager.filters.roleName')}
              onChange={value => setQuery(current => ({ ...current, name: value }))}
              value={query.name}
            />
            <TextField
              label={t('webAdmin.iam.roleManager.filters.roleCode')}
              onChange={value => setQuery(current => ({ ...current, code: value }))}
              value={query.code}
            />
            <TextField
              label={t('webAdmin.iam.roleManager.filters.dataScope')}
              onChange={value => setQuery(current => ({ ...current, dataScope: value }))}
              value={query.dataScope}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={() => setAppliedQuery(query)}>
            <Search data-icon="inline-start" />
            {t('webAdmin.iam.roleManager.actions.search')}
          </Button>
          <Button onClick={resetQuery} variant="outline">
            <RotateCcw data-icon="inline-start" />
            {t('webAdmin.iam.roleManager.actions.reset')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t('webAdmin.iam.tables.rolesTitle')}</CardTitle>
              <CardDescription>{t('webAdmin.iam.tables.rolesDescription')}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={isMutating || !canManageRoles} onClick={openCreateRole} size="sm">
                <Plus data-icon="inline-start" />
                {t('webAdmin.iam.roleManager.actions.add')}
              </Button>
              <Button
                disabled={isMutating || !canEditSelected}
                onClick={() => {
                  const [role] = selectedRoles;

                  if (role) {
                    openEditRole(role);
                  }
                }}
                size="sm"
                variant="outline">
                <Edit data-icon="inline-start" />
                {t('webAdmin.iam.roleManager.actions.edit')}
              </Button>
              <ConfirmActionButton
                description={t('webAdmin.iam.confirm.deleteDescription', {
                  item: selectedRoles.map(role => role.name).join(', '),
                })}
                disabled={isMutating || !canDeleteSelected}
                onConfirm={() => void deleteRoleSelection()}
                pending={isMutating}
                size="sm"
                title={t('webAdmin.iam.confirm.deleteTitle')}
                variant="outline">
                <Trash2 data-icon="inline-start" />
                {t('webAdmin.iam.roleManager.actions.delete')}
              </ConfirmActionButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    aria-label={t('webAdmin.iam.roleManager.selection.selectAll')}
                    checked={areAllFilteredRolesSelected}
                    onCheckedChange={toggleAllFilteredRoles}
                  />
                </TableHead>
                <TableHead>{t('webAdmin.iam.roleManager.columns.index')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.name')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.code')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.dataScope')}</TableHead>
                <TableHead>{t('webAdmin.iam.roleManager.columns.users')}</TableHead>
                <TableHead>{t('webAdmin.iam.roleManager.columns.permissions')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length ? (
                filteredRoles.map((role, index) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Checkbox
                        aria-label={t('webAdmin.iam.roleManager.selection.selectRole')}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={checked => toggleRoleSelection(role.id, checked)}
                      />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{role.name}</span>
                        {role.description ? (
                          <span className="text-muted-foreground text-xs">{role.description}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{role.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(dataScopeLabels[role.dataScope.type])}</Badge>
                    </TableCell>
                    <TableCell>{users.filter(user => user.roleCodes.includes(role.code)).length}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{role.permissionCodes.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={isMutating || !canManageRoles}
                          onClick={() => openEditRole(role)}
                          size="sm"
                          variant="ghost">
                          <Edit data-icon="inline-start" />
                          {t('webAdmin.iam.roleManager.actions.edit')}
                        </Button>
                        <Button
                          disabled={isMutating || !canManageRoles}
                          onClick={() => openPermissionGrant(role)}
                          size="sm"
                          variant="ghost">
                          <KeyRound data-icon="inline-start" />
                          {t('webAdmin.iam.roleManager.actions.permissions')}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal data-icon="inline-start" />
                              {t('webAdmin.iam.roleManager.actions.more')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                disabled={isMutating || !canManageRoles}
                                onClick={() => openDataScopeEditor(role)}>
                                <Database />
                                {t('webAdmin.iam.roleManager.actions.dataScope')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={isMutating || !canManageRoles}
                                onClick={() => openAssignedUsers(role)}>
                                <UserPlus />
                                {t('webAdmin.iam.roleManager.actions.assignUsers')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={isMutating || role.code === 'super-admin' || !canManageRoles}
                                onClick={() => setRoleDeleteTarget(role)}>
                                <Trash2 />
                                {t('webAdmin.iam.roleManager.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>{t('webAdmin.iam.roleManager.empty')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoleEditorDialog
        departmentOptions={departmentOptions}
        form={editorForm}
        isMutating={isMutating}
        mode={editingRoleId ? 'edit' : 'create'}
        onChange={setEditorForm}
        onOpenChange={setEditorOpen}
        onSubmit={() => void submitRoleEditor()}
        open={editorOpen}
        permissions={permissions}
      />
      <PermissionGrantDialog
        draft={permissionDraft}
        isMutating={isMutating}
        onOpenChange={open => setPermissionRole(open ? permissionRole : null)}
        onSubmit={() => void submitPermissionGrant()}
        onToggle={togglePermission}
        open={Boolean(permissionRole)}
        permissions={permissions}
        role={permissionRole}
      />
      <DataScopeDialog
        departmentOptions={departmentOptions}
        form={dataScopeForm}
        isMutating={isMutating}
        onChange={setDataScopeForm}
        onOpenChange={open => setDataScopeRole(open ? dataScopeRole : null)}
        onSubmit={() => void submitDataScope()}
        open={Boolean(dataScopeRole)}
        role={dataScopeRole}
      />
      <AssignedUsersDialog
        assignedUserIds={assignedUserIds}
        isMutating={isMutating}
        onOpenChange={open => setAssignRole(open ? assignRole : null)}
        onSubmit={() => void submitAssignedUsers()}
        onToggle={toggleAssignedUser}
        open={Boolean(assignRole)}
        role={assignRole}
        users={users}
      />
      <AlertDialog
        onOpenChange={open => setRoleDeleteTarget(open ? roleDeleteTarget : null)}
        open={Boolean(roleDeleteTarget)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('webAdmin.iam.confirm.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('webAdmin.iam.confirm.deleteDescription', { item: roleDeleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const role = roleDeleteTarget;

                if (role) {
                  void onMutate(token => deleteIamRole(token, role.id));
                }

                setRoleDeleteTarget(null);
              }}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

const RoleEditorDialog = ({
  departmentOptions,
  form,
  isMutating,
  mode,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  permissions,
}: {
  departmentOptions: PickerOption[];
  form: RoleEditorState;
  isMutating: boolean;
  mode: 'create' | 'edit';
  onChange: (form: RoleEditorState) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  permissions: PermissionItem[];
}) => {
  const t = useAdminT();
  const selectedPermissionCodes = parseCsv(form.permissionCodes);
  const permissionOptions = permissions.map(permission => ({
    description: `${permission.type} / ${permission.resource}:${permission.action}`,
    label: permission.code,
    value: permission.code,
  }));
  const togglePermission = (permissionCode: string, checked: boolean | 'indeterminate') => {
    const nextCodes =
      checked === true
        ? uniqueStrings([...selectedPermissionCodes, permissionCode])
        : selectedPermissionCodes.filter(code => code !== permissionCode);

    onChange({ ...form, permissionCodes: nextCodes.join(', ') });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? t('webAdmin.iam.roleManager.dialogs.createTitle')
              : t('webAdmin.iam.roleManager.dialogs.editTitle')}
          </DialogTitle>
          <DialogDescription>{t('webAdmin.iam.roleManager.dialogs.editorDescription')}</DialogDescription>
        </DialogHeader>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <TextField
            label={t('webAdmin.iam.fields.name')}
            onChange={value => onChange({ ...form, name: value })}
            value={form.name}
          />
          <TextField
            label={t('webAdmin.iam.fields.code')}
            onChange={value => onChange({ ...form, code: value })}
            value={form.code}
          />
          <EnumSelectField
            label={t('webAdmin.iam.fields.dataScope')}
            onChange={value => onChange({ ...form, dataScopeType: toDataScopeType(value) })}
            options={dataScopeOptions.map(option => ({
              label: t(option.label as Parameters<typeof t>[0]),
              value: option.value,
            }))}
            value={toDataScopeType(form.dataScopeType)}
          />
          <MultiSearchSelectField
            label={t('webAdmin.iam.roleManager.fields.deptIds')}
            onChange={values => onChange({ ...form, deptIds: values.join(', ') })}
            options={departmentOptions}
            values={parseCsv(form.deptIds)}
          />
          <MultiSearchSelectField
            label={t('webAdmin.iam.fields.permissionCodes')}
            onChange={values => onChange({ ...form, permissionCodes: values.join(', ') })}
            options={permissionOptions}
            values={selectedPermissionCodes}
          />
          <TextField
            label={t('webAdmin.iam.roleManager.fields.description')}
            onChange={value => onChange({ ...form, description: value })}
            value={form.description}
          />
        </FieldGroup>
        <PermissionChecklist
          onToggle={togglePermission}
          permissions={permissions}
          selectedPermissionCodes={selectedPermissionCodes}
        />
        <DialogFooter>
          <Button disabled={isMutating} onClick={onSubmit}>
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PermissionGrantDialog = ({
  draft,
  isMutating,
  onOpenChange,
  onSubmit,
  onToggle,
  open,
  permissions,
  role,
}: {
  draft: string[];
  isMutating: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onToggle: (permissionCode: string, checked: boolean | 'indeterminate') => void;
  open: boolean;
  permissions: PermissionItem[];
  role: RoleItem | null;
}) => {
  const t = useAdminT();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('webAdmin.iam.roleManager.dialogs.permissionsTitle')}</DialogTitle>
          <DialogDescription>
            {role
              ? t('webAdmin.iam.roleManager.dialogs.permissionsDescription', { role: role.name })
              : t('webAdmin.iam.roleManager.dialogs.permissionsFallback')}
          </DialogDescription>
        </DialogHeader>
        <PermissionChecklist onToggle={onToggle} permissions={permissions} selectedPermissionCodes={draft} />
        <DialogFooter>
          <Button disabled={isMutating || !role} onClick={onSubmit}>
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DataScopeDialog = ({
  departmentOptions,
  form,
  isMutating,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  role,
}: {
  departmentOptions: PickerOption[];
  form: { dataScopeType: string; deptIds: string };
  isMutating: boolean;
  onChange: (form: { dataScopeType: string; deptIds: string }) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  role: RoleItem | null;
}) => {
  const t = useAdminT();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('webAdmin.iam.roleManager.dialogs.dataScopeTitle')}</DialogTitle>
          <DialogDescription>
            {role
              ? t('webAdmin.iam.roleManager.dialogs.dataScopeDescription', { role: role.name })
              : t('webAdmin.iam.roleManager.dialogs.dataScopeFallback')}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <EnumSelectField
            label={t('webAdmin.iam.fields.dataScope')}
            onChange={value => onChange({ ...form, dataScopeType: value })}
            options={dataScopeOptions.map(option => ({
              label: t(option.label as Parameters<typeof t>[0]),
              value: option.value,
            }))}
            value={toDataScopeType(form.dataScopeType)}
          />
          <MultiSearchSelectField
            label={t('webAdmin.iam.roleManager.fields.deptIds')}
            onChange={values => onChange({ ...form, deptIds: values.join(', ') })}
            options={departmentOptions}
            values={parseCsv(form.deptIds)}
          />
        </FieldGroup>
        <DialogFooter>
          <Button disabled={isMutating || !role} onClick={onSubmit}>
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FieldPermissionsTable = ({
  canManageIam,
  fieldPermissions,
  isMutating,
  onCreate,
  onDelete,
  onEdit,
}: {
  canManageIam: boolean;
  fieldPermissions: FieldPermission[];
  isMutating: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onEdit: (fieldPermission: FieldPermission) => void;
}) => {
  const t = useAdminT();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>{t('webAdmin.iam.tables.fieldPermissionsTitle')}</CardTitle>
            <CardDescription>{t('webAdmin.iam.policy.fieldDescription')}</CardDescription>
          </div>
          <Button disabled={isMutating || !canManageIam} onClick={onCreate}>
            <Plus data-icon="inline-start" />
            {t('webAdmin.iam.actions.createFieldPermission')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('webAdmin.iam.fields.roleCode')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.resource')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.fieldName')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.permissionType')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldPermissions.map(fieldPermission => (
                <TableRow key={fieldPermission.id}>
                  <TableCell>{fieldPermission.roleCode}</TableCell>
                  <TableCell>{fieldPermission.resource}</TableCell>
                  <TableCell>{fieldPermission.fieldName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{fieldPermission.permissionType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={isMutating || !canManageIam}
                        onClick={() => onEdit(fieldPermission)}
                        size="sm"
                        variant="outline">
                        <Edit data-icon="inline-start" />
                        {t('webAdmin.iam.actions.edit')}
                      </Button>
                      <ConfirmActionButton
                        description={t('webAdmin.iam.confirm.deleteDescription', {
                          item: `${fieldPermission.roleCode}:${fieldPermission.resource}.${fieldPermission.fieldName}`,
                        })}
                        disabled={isMutating || !canManageIam}
                        onConfirm={() => onDelete(fieldPermission.id)}
                        pending={isMutating}
                        size="sm"
                        title={t('webAdmin.iam.confirm.deleteTitle')}
                        variant="outline">
                        <Trash2 data-icon="inline-start" />
                        {t('webAdmin.iam.actions.delete')}
                      </ConfirmActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!fieldPermissions.length ? (
                <TableRow>
                  <TableCell colSpan={5}>{t('webAdmin.iam.tables.emptyFieldPermissions')}</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const PoliciesTable = ({
  canUpdatePolicy,
  isMutating,
  onCreate,
  onDelete,
  onEdit,
  policies,
}: {
  canUpdatePolicy: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onEdit: (policy: IamPolicy) => void;
  policies: IamPolicy[];
}) => {
  const t = useAdminT();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>{t('webAdmin.iam.tables.policiesTitle')}</CardTitle>
            <CardDescription>{t('webAdmin.iam.policy.policyDescription')}</CardDescription>
          </div>
          <Button disabled={isMutating || !canUpdatePolicy} onClick={onCreate}>
            <Plus data-icon="inline-start" />
            {t('webAdmin.iam.actions.createPolicy')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('webAdmin.iam.fields.effect')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.resource')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.action')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.conditions')}</TableHead>
                <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map(policy => {
                const conditions = stringifyPolicyConditions(policy.conditions);

                return (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Badge variant={policy.effect === 'ALLOW' ? 'default' : 'secondary'}>{policy.effect}</Badge>
                    </TableCell>
                    <TableCell>{policy.resource}</TableCell>
                    <TableCell>{policy.action}</TableCell>
                    <TableCell className="max-w-md truncate" title={conditions}>
                      {conditions}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={isMutating || !canUpdatePolicy}
                          onClick={() => onEdit(policy)}
                          size="sm"
                          variant="outline">
                          <Edit data-icon="inline-start" />
                          {t('webAdmin.iam.actions.edit')}
                        </Button>
                        <ConfirmActionButton
                          description={t('webAdmin.iam.confirm.deleteDescription', {
                            item: `${policy.effect}:${policy.resource}:${policy.action}`,
                          })}
                          disabled={isMutating || !canUpdatePolicy}
                          onConfirm={() => onDelete(policy.id)}
                          pending={isMutating}
                          size="sm"
                          title={t('webAdmin.iam.confirm.deleteTitle')}
                          variant="outline">
                          <Trash2 data-icon="inline-start" />
                          {t('webAdmin.iam.actions.delete')}
                        </ConfirmActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!policies.length ? (
                <TableRow>
                  <TableCell colSpan={5}>{t('webAdmin.iam.tables.emptyPolicies')}</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
