import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import {
  Database,
  Edit,
  KeyRound,
  LogOut,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { formatUserDateTime, getUserTimeZone, useAdminSessionStore, useAdminT } from '@tetap/hooks';
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
type OperationLogQueryState = {
  page: number;
  pageSize: number;
  search: string;
  sort: 'asc' | 'desc';
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
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const flattenIamMenus = (menu: IamMenuNode): IamMenuNode[] => [menu, ...menu.children.flatMap(flattenIamMenus)];

const flattenIamMenuTree = (menus: IamMenuNode[], depth = 0): (IamMenuNode & { depth: number })[] =>
  menus.flatMap(menu => [{ ...menu, depth }, ...flattenIamMenuTree(menu.children, depth + 1)]);

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

const resolveBackendErrorMessage = (error: unknown, fallback: string) =>
  error instanceof BackendAdminRequestError && error.message ? error.message : fallback;

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

  const loadSectionData = async () => {
    if (!accessToken) {
      setIsLoading(false);
      toast.error(t('webAdmin.iam.states.loginExpired'));
      return;
    }

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
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!accessToken) {
      toast.error(t('webAdmin.iam.states.loginExpired'));
      return;
    }

    try {
      await revokeIamSession(accessToken, sessionId);
      toast.success(t('webAdmin.iam.states.mutationOk'));
      await loadSectionData();
    } catch (error) {
      toast.error(resolveBackendErrorMessage(error, t('webAdmin.iam.states.revokeFailed')));
    }
  };

  const runMutation = async (operation: (token: string) => Promise<unknown>) => {
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
  };

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

  useEffect(() => {
    void loadSectionData();
  }, [
    accessToken,
    section,
    operationLogQuery.page,
    operationLogQuery.pageSize,
    operationLogQuery.search,
    operationLogQuery.sort,
  ]);

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
          <Button disabled={isLoading} onClick={() => void loadSectionData()} variant="outline">
            <RefreshCw data-icon="inline-start" />
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
          <Tabs value={section}>
            <TabsContent value="users">
              <section className="grid gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle>{t('webAdmin.iam.tables.usersTitle')}</CardTitle>
                        <CardDescription>{t('webAdmin.iam.tables.usersDescription')}</CardDescription>
                      </div>
                      <Button disabled={isMutating || !canManageUsers} onClick={() => setCreateDialog('users')}>
                        <Plus data-icon="inline-start" />
                        {t('webAdmin.iam.actions.createUser')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('webAdmin.iam.fields.username')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.email')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.roleCodes')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.status')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.users.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roleCodes.map(role => (
                                  <Badge key={role} variant="secondary">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  disabled={isMutating || user.isSuperAdmin || !canManageUsers}
                                  onClick={() =>
                                    void runMutation(token =>
                                      updateIamUser(token, user.id, {
                                        status: user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                                      }),
                                    )
                                  }
                                  size="sm"
                                  variant="outline">
                                  {user.status === 'ACTIVE'
                                    ? t('webAdmin.iam.actions.disableUser')
                                    : t('webAdmin.iam.actions.activateUser')}
                                </Button>
                                <ConfirmActionButton
                                  description={t('webAdmin.iam.confirm.deleteDescription', { item: user.username })}
                                  disabled={isMutating || user.isSuperAdmin || !canManageUsers}
                                  onConfirm={() => void runMutation(token => deleteIamUser(token, user.id))}
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
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
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
              <section className="grid gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle>{t('webAdmin.iam.tables.permissionsTitle')}</CardTitle>
                        <CardDescription>{t('webAdmin.iam.tables.permissionsDescription')}</CardDescription>
                      </div>
                      <Button disabled={isMutating || !canManageIam} onClick={() => setCreateDialog('permissions')}>
                        <Plus data-icon="inline-start" />
                        {t('webAdmin.iam.actions.createPermission')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('webAdmin.iam.fields.code')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.name')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.type')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.resource')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.action')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.permissions.map(permission => (
                          <TableRow key={permission.id}>
                            <TableCell>{permission.code}</TableCell>
                            <TableCell>{permission.name}</TableCell>
                            <TableCell>
                              <Badge>{permission.type}</Badge>
                            </TableCell>
                            <TableCell>{permission.resource}</TableCell>
                            <TableCell>{permission.action}</TableCell>
                            <TableCell>
                              <ConfirmActionButton
                                description={t('webAdmin.iam.confirm.deleteDescription', { item: permission.code })}
                                disabled={isMutating || !canManageIam}
                                onConfirm={() => void runMutation(token => deleteIamPermission(token, permission.id))}
                                size="sm"
                                title={t('webAdmin.iam.confirm.deleteTitle')}
                                variant="outline">
                                <Trash2 data-icon="inline-start" />
                                {t('webAdmin.iam.actions.delete')}
                              </ConfirmActionButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
            <TabsContent value="menus">
              <section className="grid gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle>{t('webAdmin.iam.tables.menusTitle')}</CardTitle>
                        <CardDescription>{t('webAdmin.iam.tables.menusDescription')}</CardDescription>
                      </div>
                      <Button disabled={isMutating || !canManageIam} onClick={() => setCreateDialog('menus')}>
                        <Plus data-icon="inline-start" />
                        {t('webAdmin.iam.actions.createMenu')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('webAdmin.iam.fields.name')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.path')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.component')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.permissionCodes')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flattenIamMenuTree(data.menus).map(menu => (
                          <TableRow key={menu.id}>
                            <TableCell>
                              <span style={{ paddingInlineStart: `${menu.depth * 16}px` }}>{menu.name}</span>
                            </TableCell>
                            <TableCell>{menu.path}</TableCell>
                            <TableCell>{menu.component}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {menu.permissionCodes.map(permission => (
                                  <Badge key={permission} variant="outline">
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <ConfirmActionButton
                                description={t('webAdmin.iam.confirm.deleteDescription', { item: menu.name })}
                                disabled={isMutating || !canManageIam}
                                onConfirm={() => void runMutation(token => deleteIamMenu(token, menu.id))}
                                size="sm"
                                title={t('webAdmin.iam.confirm.deleteTitle')}
                                variant="outline">
                                <Trash2 data-icon="inline-start" />
                                {t('webAdmin.iam.actions.delete')}
                              </ConfirmActionButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
            <TabsContent value="sessions">
              <section className="grid gap-4">
                {data.sessions.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('webAdmin.iam.tables.sessionsTitle')}</CardTitle>
                      <CardDescription>{t('webAdmin.iam.tables.sessionsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('webAdmin.iam.fields.userId')}</TableHead>
                            <TableHead>{t('webAdmin.iam.fields.email')}</TableHead>
                            <TableHead>{t('webAdmin.iam.fields.deviceType')}</TableHead>
                            <TableHead>{t('webAdmin.iam.fields.ip')}</TableHead>
                            <TableHead>{t('webAdmin.iam.fields.status')}</TableHead>
                            <TableHead>{t('webAdmin.iam.fields.lastActiveTime')}</TableHead>
                            <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.sessions.map(session => (
                            <TableRow key={session.id}>
                              <TableCell>{session.username ?? session.userId}</TableCell>
                              <TableCell>{session.email ?? '-'}</TableCell>
                              <TableCell>{session.deviceType}</TableCell>
                              <TableCell>{session.ip}</TableCell>
                              <TableCell>
                                <Badge>{session.status}</Badge>
                              </TableCell>
                              <TableCell>{formatUserDateTime(session.lastActiveTime, timeZone)}</TableCell>
                              <TableCell>
                                <ConfirmActionButton
                                  description={t('webAdmin.iam.confirm.revokeDescription', {
                                    item: session.username ?? session.userId,
                                  })}
                                  disabled={session.status !== 'ONLINE' || !canRevokeSessions}
                                  onConfirm={() => void revokeSession(session.id)}
                                  size="sm"
                                  title={t('webAdmin.iam.confirm.revokeTitle')}
                                  variant="outline">
                                  <LogOut data-icon="inline-start" />
                                  {t('webAdmin.iam.actions.revoke')}
                                </ConfirmActionButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('webAdmin.iam.states.noSessions')}</CardTitle>
                      <CardDescription>{t('webAdmin.iam.states.noSessionsDescription')}</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </section>
            </TabsContent>
            <TabsContent value="fields">
              <section className="grid gap-4">
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
              <section className="grid gap-4">
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
              <section className="grid gap-4">
                <OperationLogsTable
                  isLoading={isLoading}
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
    ...data.menus.flatMap(flattenIamMenus).map(menu => ({
      description: menu.path,
      label: menu.name,
      value: menu.id,
    })),
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

    await onMutate(token => (roleId ? updateIamRole(token, roleId, payload) : createIamRole(token, payload)));
    setEditorOpen(false);
  };

  const deleteRoleSelection = async () => {
    const targets = selectedRoles.filter(role => role.code !== 'super-admin');

    await onMutate(async token => Promise.all(targets.map(role => deleteIamRole(token, role.id))));
    setSelectedRoleIds([]);
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

    await onMutate(token => updateIamRole(token, permissionRole.id, { permissionCodes: permissionDraft }));
    setPermissionRole(null);
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

    await onMutate(token => updateIamRole(token, dataScopeRole.id, { dataScope: payload.dataScope }));
    setDataScopeRole(null);
  };

  const openAssignedUsers = (role: RoleItem) => {
    setAssignRole(role);
    setAssignedUserIds(users.filter(user => user.roleCodes.includes(role.code)).map(user => user.id));
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

    await onMutate(async token => {
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
    setAssignRole(null);
  };

  const resetQuery = () => {
    const nextQuery = { code: '', dataScope: '', name: '' };

    setQuery(nextQuery);
    setAppliedQuery(nextQuery);
  };

  return (
    <section className="flex flex-col gap-4">
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
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AssignedUsersDialog = ({
  assignedUserIds,
  isMutating,
  onOpenChange,
  onSubmit,
  onToggle,
  open,
  role,
  users,
}: {
  assignedUserIds: string[];
  isMutating: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onToggle: (userId: string, checked: boolean | 'indeterminate') => void;
  open: boolean;
  role: RoleItem | null;
  users: UserItem[];
}) => {
  const t = useAdminT();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedQuery
      ? users.filter(
          user =>
            user.username.toLowerCase().includes(normalizedQuery) || user.email.toLowerCase().includes(normalizedQuery),
        )
      : users;
  }, [users, query]);
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / optionPageSize));
  const pageItems = filteredUsers.slice(page * optionPageSize, (page + 1) * optionPageSize);

  useEffect(() => {
    setPage(0);
  }, [query, users]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('webAdmin.iam.roleManager.dialogs.assignUsersTitle')}</DialogTitle>
          <DialogDescription>
            {role
              ? t('webAdmin.iam.roleManager.dialogs.assignUsersDescription', { role: role.name })
              : t('webAdmin.iam.roleManager.dialogs.assignUsersFallback')}
          </DialogDescription>
        </DialogHeader>
        <TextField label={t('webAdmin.iam.selection.search')} onChange={setQuery} value={query} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('webAdmin.iam.roleManager.selection.selectRole')}</TableHead>
              <TableHead>{t('webAdmin.iam.fields.username')}</TableHead>
              <TableHead>{t('webAdmin.iam.fields.email')}</TableHead>
              <TableHead>{t('webAdmin.iam.fields.status')}</TableHead>
              <TableHead>{t('webAdmin.iam.fields.roleCodes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    aria-label={t('webAdmin.iam.roleManager.selection.selectUser')}
                    checked={assignedUserIds.includes(user.id)}
                    onCheckedChange={checked => onToggle(user.id, checked)}
                  />
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.roleCodes.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button disabled={page === 0} onClick={() => setPage(current => Math.max(0, current - 1))} variant="outline">
            {t('webAdmin.iam.selection.prev')}
          </Button>
          <Button
            disabled={page + 1 >= pageCount}
            onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
            variant="outline">
            {t('webAdmin.iam.selection.next')}
          </Button>
          <Button disabled={isMutating || !role} onClick={onSubmit}>
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PermissionChecklist = ({
  onToggle,
  permissions,
  selectedPermissionCodes,
}: {
  onToggle: (permissionCode: string, checked: boolean | 'indeterminate') => void;
  permissions: PermissionItem[];
  selectedPermissionCodes: string[];
}) => {
  const t = useAdminT();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const filteredPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedQuery
      ? permissions.filter(
          permission =>
            permission.code.toLowerCase().includes(normalizedQuery) ||
            permission.name.toLowerCase().includes(normalizedQuery) ||
            permission.resource.toLowerCase().includes(normalizedQuery),
        )
      : permissions;
  }, [permissions, query]);
  const pageCount = Math.max(1, Math.ceil(filteredPermissions.length / optionPageSize));
  const pageItems = filteredPermissions.slice(page * optionPageSize, (page + 1) * optionPageSize);

  useEffect(() => {
    setPage(0);
  }, [query, permissions]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">{t('webAdmin.iam.roleManager.permissionMatrix.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('webAdmin.iam.roleManager.permissionMatrix.description')}</p>
      </div>
      <TextField label={t('webAdmin.iam.selection.search')} onChange={setQuery} value={query} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('webAdmin.iam.roleManager.selection.selectPermission')}</TableHead>
            <TableHead>{t('webAdmin.iam.fields.code')}</TableHead>
            <TableHead>{t('webAdmin.iam.fields.name')}</TableHead>
            <TableHead>{t('webAdmin.iam.fields.type')}</TableHead>
            <TableHead>{t('webAdmin.iam.fields.resource')}</TableHead>
            <TableHead>{t('webAdmin.iam.fields.action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map(permission => (
            <TableRow key={permission.id}>
              <TableCell>
                <Checkbox
                  aria-label={t('webAdmin.iam.roleManager.selection.selectPermission')}
                  checked={selectedPermissionCodes.includes(permission.code)}
                  onCheckedChange={checked => onToggle(permission.code, checked)}
                />
              </TableCell>
              <TableCell>{permission.code}</TableCell>
              <TableCell>{permission.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{permission.type}</Badge>
              </TableCell>
              <TableCell>{permission.resource}</TableCell>
              <TableCell>{permission.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-2">
        <Button disabled={page === 0} onClick={() => setPage(current => Math.max(0, current - 1))} variant="outline">
          {t('webAdmin.iam.selection.prev')}
        </Button>
        <Button
          disabled={page + 1 >= pageCount}
          onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
          variant="outline">
          {t('webAdmin.iam.selection.next')}
        </Button>
      </div>
    </div>
  );
};

type ConfirmActionButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  description: string;
  onConfirm: () => void;
  title: string;
};

const ConfirmActionButton = ({
  children,
  description,
  disabled,
  onConfirm,
  title,
  ...buttonProps
}: ConfirmActionButtonProps) => {
  const t = useAdminT();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <Button disabled={disabled} onClick={() => setOpen(true)} {...buttonProps}>
        {children}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('common.confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

const OperationLogsTable = ({
  isLoading,
  onQueryChange,
  operationLogs,
  query,
  timeZone,
}: {
  isLoading: boolean;
  onQueryChange: (query: OperationLogQueryState) => void;
  operationLogs: IamOperationLogsData | null;
  query: OperationLogQueryState;
  timeZone: string;
}) => {
  const t = useAdminT();
  const [searchDraft, setSearchDraft] = useState(query.search);
  const logs = operationLogs?.items ?? [];
  const total = operationLogs?.total ?? 0;
  const totalPages = operationLogs?.totalPages ?? 1;
  const submitSearch = () => onQueryChange({ ...query, page: 1, search: searchDraft });

  useEffect(() => {
    setSearchDraft(query.search);
  }, [query.search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('webAdmin.iam.tabs.operationLogs')}</CardTitle>
        <CardDescription>{t('webAdmin.iam.policy.operationLogDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form
            className="min-w-0 flex-1"
            onSubmit={event => {
              event.preventDefault();
              submitSearch();
            }}>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <InputGroup className="min-w-0 flex-1">
                <InputGroupInput
                  aria-label={t('webAdmin.iam.operationLogs.search')}
                  onChange={event => setSearchDraft(event.target.value)}
                  placeholder={t('webAdmin.iam.operationLogs.search')}
                  value={searchDraft}
                />
                <InputGroupAddon align="inline-start">
                  <Search aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
              <Button className="shrink-0" disabled={isLoading} type="submit">
                <Search data-icon="inline-start" />
                {t('webAdmin.iam.operationLogs.search')}
              </Button>
            </div>
          </form>
          <Select
            onValueChange={value => onQueryChange({ ...query, page: 1, sort: value === 'asc' ? 'asc' : 'desc' })}
            value={query.sort}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="desc">{t('webAdmin.iam.operationLogs.sortDesc')}</SelectItem>
                <SelectItem value="asc">{t('webAdmin.iam.operationLogs.sortAsc')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('webAdmin.iam.operationLogs.operator')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.item')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.detail')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.time')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.ip')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.operator}</TableCell>
                <TableCell>{log.operationItem}</TableCell>
                <TableCell className="max-w-sm truncate">{JSON.stringify(log.operationDetail)}</TableCell>
                <TableCell>{formatUserDateTime(log.operationTime, timeZone)}</TableCell>
                <TableCell>{log.operationIp ?? '-'}</TableCell>
              </TableRow>
            ))}
            {!logs.length ? (
              <TableRow>
                <TableCell colSpan={5}>{t('webAdmin.iam.operationLogs.empty')}</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>{t('webAdmin.iam.operationLogs.total', { total })}</span>
          <div className="flex items-center gap-2">
            <Button
              disabled={isLoading || query.page <= 1}
              onClick={() => onQueryChange({ ...query, page: Math.max(1, query.page - 1) })}
              size="sm"
              variant="outline">
              {t('webAdmin.iam.selection.prev')}
            </Button>
            <span>{t('webAdmin.iam.operationLogs.pageInfo', { page: query.page, totalPages })}</span>
            <Button
              disabled={isLoading || query.page >= totalPages}
              onClick={() => onQueryChange({ ...query, page: Math.min(totalPages, query.page + 1) })}
              size="sm"
              variant="outline">
              {t('webAdmin.iam.selection.next')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TextField = ({
  description,
  label,
  onChange,
  type = 'text',
  value,
}: {
  description?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) => <TextFieldInner description={description} label={label} onChange={onChange} type={type} value={value} />;

const TextFieldInner = ({
  description,
  label,
  onChange,
  type,
  value,
}: {
  description?: string;
  label: string;
  onChange: (value: string) => void;
  type: string;
  value: string;
}) => {
  const t = useAdminT();

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input onChange={event => onChange(event.target.value)} type={type} value={value} />
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.generic', { label })}</FieldDescription>
    </Field>
  );
};

type PickerOption = {
  description?: string;
  label: string;
  value: string;
};

const optionPageSize = 8;

const EnumSelectField = <TValue extends string>({
  description,
  label,
  onChange,
  options,
  value,
}: {
  description?: string;
  label: string;
  onChange: (value: TValue) => void;
  options: { label: string; value: TValue }[];
  value: TValue;
}) => {
  const t = useAdminT();

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select onValueChange={value => onChange(value as TValue)} value={value}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.select', { label })}</FieldDescription>
    </Field>
  );
};

const SearchableSelectField = ({
  description,
  label,
  onChange,
  options,
  value,
}: {
  description?: string;
  label: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  value: string;
}) => {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const selected = options.find(option => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedQuery
      ? options.filter(
          option =>
            option.label.toLowerCase().includes(normalizedQuery) ||
            option.value.toLowerCase().includes(normalizedQuery) ||
            option.description?.toLowerCase().includes(normalizedQuery),
        )
      : options;
  }, [options, query]);
  const pageCount = Math.max(1, Math.ceil(filteredOptions.length / optionPageSize));
  const pageItems = filteredOptions.slice(page * optionPageSize, (page + 1) * optionPageSize);

  useEffect(() => {
    setPage(0);
  }, [query, options]);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Button className="justify-between" onClick={() => setOpen(true)} type="button" variant="outline">
        <span className="truncate">{selected?.label ?? t('webAdmin.iam.selection.placeholder')}</span>
        <Search />
      </Button>
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.searchableSelect', { label })}</FieldDescription>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.selection.description')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField label={t('webAdmin.iam.selection.search')} onChange={setQuery} value={query} />
            <div className="max-h-72 overflow-y-auto rounded-md border">
              {pageItems.length ? (
                pageItems.map(option => (
                  <button
                    className="hover:bg-accent flex w-full flex-col gap-1 px-3 py-2 text-left text-sm"
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    type="button">
                    <span className="font-medium">{option.label}</span>
                    {option.description ? (
                      <span className="text-muted-foreground text-xs">{option.description}</span>
                    ) : null}
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground p-3 text-sm">{t('webAdmin.iam.selection.empty')}</p>
              )}
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              disabled={page === 0}
              onClick={() => setPage(current => Math.max(0, current - 1))}
              variant="outline">
              {t('webAdmin.iam.selection.prev')}
            </Button>
            <Button
              disabled={page + 1 >= pageCount}
              onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
              variant="outline">
              {t('webAdmin.iam.selection.next')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field>
  );
};

const MultiSearchSelectField = ({
  description,
  label,
  onChange,
  options,
  values,
}: {
  description?: string;
  label: string;
  onChange: (values: string[]) => void;
  options: PickerOption[];
  values: string[];
}) => {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const selected = new Set(values);
  const selectedLabels = options.filter(option => selected.has(option.value)).map(option => option.label);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return normalizedQuery
      ? options.filter(
          option =>
            option.label.toLowerCase().includes(normalizedQuery) ||
            option.value.toLowerCase().includes(normalizedQuery) ||
            option.description?.toLowerCase().includes(normalizedQuery),
        )
      : options;
  }, [options, query]);
  const pageCount = Math.max(1, Math.ceil(filteredOptions.length / optionPageSize));
  const pageItems = filteredOptions.slice(page * optionPageSize, (page + 1) * optionPageSize);

  useEffect(() => {
    setPage(0);
  }, [query, options]);

  const toggle = (value: string, checked: boolean | 'indeterminate') => {
    onChange(checked === true ? uniqueStrings([...values, value]) : values.filter(item => item !== value));
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Button className="justify-between" onClick={() => setOpen(true)} type="button" variant="outline">
        <span className="truncate">
          {selectedLabels.length ? selectedLabels.join(', ') : t('webAdmin.iam.selection.placeholder')}
        </span>
        <Search />
      </Button>
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.multiSelect', { label })}</FieldDescription>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.selection.description')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField label={t('webAdmin.iam.selection.search')} onChange={setQuery} value={query} />
            <div className="max-h-72 overflow-y-auto rounded-md border">
              {pageItems.length ? (
                pageItems.map(option => (
                  <label className="hover:bg-accent flex items-start gap-3 px-3 py-2 text-sm" key={option.value}>
                    <Checkbox
                      checked={selected.has(option.value)}
                      onCheckedChange={checked => toggle(option.value, checked)}
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{option.label}</span>
                      {option.description ? (
                        <span className="text-muted-foreground text-xs">{option.description}</span>
                      ) : null}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-muted-foreground p-3 text-sm">{t('webAdmin.iam.selection.empty')}</p>
              )}
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              disabled={page === 0}
              onClick={() => setPage(current => Math.max(0, current - 1))}
              variant="outline">
              {t('webAdmin.iam.selection.prev')}
            </Button>
            <Button
              disabled={page + 1 >= pageCount}
              onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
              variant="outline">
              {t('webAdmin.iam.selection.next')}
            </Button>
            <Button onClick={() => setOpen(false)}>{t('common.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field>
  );
};
