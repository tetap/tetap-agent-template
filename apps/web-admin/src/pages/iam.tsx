import { useEffect, useState, type ReactNode } from 'react';
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
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';
import {
  Alert,
  AlertDescription,
  AlertTitle,
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
  FieldGroup,
  FieldLabel,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
} from '@tetap/ui';
import { AdminHeader } from '../layout/header.js';
import { AdminMain } from '../layout/main.js';
import { ProfileDropdown } from '../layout/profile-dropdown.js';
import { SearchCommand } from '../layout/search-command.js';
import {
  createIamFieldPermission,
  createIamMenu,
  createIamPermission,
  createIamPolicy,
  createIamRole,
  createIamUser,
  deleteIamFieldPermission,
  deleteIamMenu,
  deleteIamPermission,
  deleteIamPolicy,
  deleteIamRole,
  deleteIamUser,
  fetchIamOverview,
  revokeIamSession,
  revokeIamUserSessions,
  updateIamRole,
  updateIamUser,
} from '../api/backend-admin.js';
import type { IamCreatePolicyRequest, IamCreateRoleRequest, IamMenuNode, IamOverviewData } from '@tetap/schema/iam';

type IamSection =
  | 'overview'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'menus'
  | 'sessions'
  | 'fields'
  | 'policies'
  | 'audit';
type PermissionTypeInput = 'MENU' | 'API' | 'BUTTON' | 'FIELD' | 'DATA';
type PolicyEffectInput = 'ALLOW' | 'DENY';
type FieldPermissionTypeInput = 'HIDE' | 'MASK' | 'READONLY' | 'READWRITE';
type DataScopeTypeInput = 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM';
type RoleItem = IamOverviewData['roles'][number];
type UserItem = IamOverviewData['users'][number];
type PermissionItem = IamOverviewData['permissions'][number];
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

const parsePolicyConditions = (value: string) => JSON.parse(value) as IamCreatePolicyRequest['conditions'];

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

const iamSectionCopy = {
  overview: {
    titleKey: 'webAdmin.iam.pages.overview.title',
    descriptionKey: 'webAdmin.iam.pages.overview.description',
  },
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
  audit: {
    titleKey: 'webAdmin.iam.pages.audit.title',
    descriptionKey: 'webAdmin.iam.pages.audit.description',
  },
} as const;

export const AdminIamPage = ({ section = 'overview' }: { section?: IamSection }) => {
  const t = useAdminT();
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const can = useAdminSessionStore(state => state.auth.can);
  const [overview, setOverview] = useState<IamOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  const loadOverview = async () => {
    if (!accessToken) {
      setIsLoading(false);
      setError(t('webAdmin.iam.states.loginExpired'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setOverview(await fetchIamOverview(accessToken));
    } catch {
      setError(t('webAdmin.iam.states.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!accessToken) {
      setError(t('webAdmin.iam.states.loginExpired'));
      return;
    }

    try {
      await revokeIamSession(accessToken, sessionId);
      await loadOverview();
    } catch {
      setError(t('webAdmin.iam.states.revokeFailed'));
    }
  };

  const runMutation = async (operation: (token: string) => Promise<unknown>) => {
    if (!accessToken) {
      setError(t('webAdmin.iam.states.loginExpired'));
      return;
    }

    setIsMutating(true);
    setError(null);
    setNotice(null);

    try {
      await operation(accessToken);
      setNotice(t('webAdmin.iam.states.mutationOk'));
      await loadOverview();
    } catch {
      setError(t('webAdmin.iam.states.mutationFailed'));
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
        deptId: userForm.deptId,
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
      createIamFieldPermission(token, {
        roleCode: fieldForm.roleCode,
        resource: fieldForm.resource,
        fieldName: fieldForm.fieldName,
        permissionType: toFieldPermissionType(fieldForm.permissionType),
      }),
    );

  const submitPolicy = () =>
    runMutation(token =>
      createIamPolicy(token, {
        resource: policyForm.resource,
        action: policyForm.action,
        effect: toPolicyEffect(policyForm.effect),
        conditions: parsePolicyConditions(policyForm.conditions),
      }),
    );

  useEffect(() => {
    void loadOverview();
  }, [accessToken]);

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
            <Badge>{t('webAdmin.iam.badge')}</Badge>
            <h1 id="admin-iam-title" className="text-2xl font-semibold">
              {t(iamSectionCopy[section].titleKey)}
            </h1>
            <p className="text-muted-foreground">{t(iamSectionCopy[section].descriptionKey)}</p>
          </div>
          <Button onClick={() => void loadOverview()} variant="outline">
            <RefreshCw data-icon="inline-start" />
            {t('webAdmin.iam.actions.refresh')}
          </Button>
        </div>
        {error ? (
          <Alert variant="destructive">
            <ShieldCheck />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {notice ? (
          <Alert>
            <ShieldCheck />
            <AlertTitle>{t('common.success')}</AlertTitle>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}
      </section>

      {overview ? (
        <Tabs value={section}>
          <TabsContent value="overview">
            <section className="grid gap-4 md:grid-cols-4">
              <MetricCard label={t('webAdmin.iam.metrics.users')} value={overview.users.length} />
              <MetricCard label={t('webAdmin.iam.metrics.roles')} value={overview.roles.length} />
              <MetricCard label={t('webAdmin.iam.metrics.permissions')} value={overview.permissions.length} />
              <MetricCard label={t('webAdmin.iam.metrics.audit')} value={overview.auditLogs.length} />
            </section>
            <section className="mt-4 grid gap-4 lg:grid-cols-2">
              {overview.users.map(user => (
                <Card key={user.id}>
                  <CardHeader>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {user.roleCodes.map(role => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </section>
          </TabsContent>
          <TabsContent value="users">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.forms.userTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.forms.userDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <TextField
                      label={t('webAdmin.iam.fields.username')}
                      onChange={value => setUserForm(current => ({ ...current, username: value }))}
                      value={userForm.username}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.email')}
                      onChange={value => setUserForm(current => ({ ...current, email: value }))}
                      value={userForm.email}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.password')}
                      onChange={value => setUserForm(current => ({ ...current, password: value }))}
                      type="password"
                      value={userForm.password}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.deptId')}
                      onChange={value => setUserForm(current => ({ ...current, deptId: value }))}
                      value={userForm.deptId}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.roleCodes')}
                      onChange={value => setUserForm(current => ({ ...current, roleCodes: value }))}
                      value={userForm.roleCodes}
                    />
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button disabled={isMutating || !canManageUsers} onClick={() => void submitUser()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createUser')}
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.tables.usersTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.tables.usersDescription')}</CardDescription>
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
                      {overview.users.map(user => (
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
                              <Button
                                disabled={isMutating || !canRevokeSessions}
                                onClick={() => void runMutation(token => revokeIamUserSessions(token, user.id))}
                                size="sm"
                                variant="outline">
                                <LogOut data-icon="inline-start" />
                                {t('webAdmin.iam.actions.revokeUserSessions')}
                              </Button>
                              <Button
                                disabled={isMutating || user.isSuperAdmin || !canManageUsers}
                                onClick={() => void runMutation(token => deleteIamUser(token, user.id))}
                                size="sm"
                                variant="outline">
                                <Trash2 data-icon="inline-start" />
                                {t('webAdmin.iam.actions.delete')}
                              </Button>
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
              permissions={overview.permissions}
              roles={overview.roles}
              users={overview.users}
            />
          </TabsContent>
          <TabsContent value="permissions">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.forms.permissionTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.forms.permissionDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <TextField
                      label={t('webAdmin.iam.fields.code')}
                      onChange={value => setPermissionForm(current => ({ ...current, code: value }))}
                      value={permissionForm.code}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.name')}
                      onChange={value => setPermissionForm(current => ({ ...current, name: value }))}
                      value={permissionForm.name}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.type')}
                      onChange={value => setPermissionForm(current => ({ ...current, type: value }))}
                      value={permissionForm.type}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.resource')}
                      onChange={value => setPermissionForm(current => ({ ...current, resource: value }))}
                      value={permissionForm.resource}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.action')}
                      onChange={value => setPermissionForm(current => ({ ...current, action: value }))}
                      value={permissionForm.action}
                    />
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button disabled={isMutating || !canManageIam} onClick={() => void submitPermission()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createPermission')}
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.tables.permissionsTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.tables.permissionsDescription')}</CardDescription>
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
                      {overview.permissions.map(permission => (
                        <TableRow key={permission.id}>
                          <TableCell>{permission.code}</TableCell>
                          <TableCell>{permission.name}</TableCell>
                          <TableCell>
                            <Badge>{permission.type}</Badge>
                          </TableCell>
                          <TableCell>{permission.resource}</TableCell>
                          <TableCell>{permission.action}</TableCell>
                          <TableCell>
                            <Button
                              disabled={isMutating || !canManageIam}
                              onClick={() => void runMutation(token => deleteIamPermission(token, permission.id))}
                              size="sm"
                              variant="outline">
                              <Trash2 data-icon="inline-start" />
                              {t('webAdmin.iam.actions.delete')}
                            </Button>
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
            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.forms.menuTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.forms.menuDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <TextField
                      label={t('webAdmin.iam.fields.name')}
                      onChange={value => setMenuForm(current => ({ ...current, name: value }))}
                      value={menuForm.name}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.path')}
                      onChange={value => setMenuForm(current => ({ ...current, path: value }))}
                      value={menuForm.path}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.component')}
                      onChange={value => setMenuForm(current => ({ ...current, component: value }))}
                      value={menuForm.component}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.icon')}
                      onChange={value => setMenuForm(current => ({ ...current, icon: value }))}
                      value={menuForm.icon}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.parentId')}
                      onChange={value => setMenuForm(current => ({ ...current, parentId: value }))}
                      value={menuForm.parentId}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.permissionCodes')}
                      onChange={value => setMenuForm(current => ({ ...current, permissionCodes: value }))}
                      value={menuForm.permissionCodes}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.order')}
                      onChange={value => setMenuForm(current => ({ ...current, order: value }))}
                      value={menuForm.order}
                    />
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button disabled={isMutating || !canManageIam} onClick={() => void submitMenu()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createMenu')}
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.tables.menusTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.tables.menusDescription')}</CardDescription>
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
                      {overview.menus.flatMap(flattenIamMenus).map(menu => (
                        <TableRow key={menu.id}>
                          <TableCell>{menu.name}</TableCell>
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
                            <Button
                              disabled={isMutating || !canManageIam}
                              onClick={() => void runMutation(token => deleteIamMenu(token, menu.id))}
                              size="sm"
                              variant="outline">
                              <Trash2 data-icon="inline-start" />
                              {t('webAdmin.iam.actions.delete')}
                            </Button>
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
              {overview.sessions.length > 0 ? (
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
                          <TableHead>{t('webAdmin.iam.fields.deviceType')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.ip')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.status')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.lastActiveTime')}</TableHead>
                          <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overview.sessions.map(session => (
                          <TableRow key={session.id}>
                            <TableCell>{session.userId}</TableCell>
                            <TableCell>{session.deviceType}</TableCell>
                            <TableCell>{session.ip}</TableCell>
                            <TableCell>
                              <Badge>{session.status}</Badge>
                            </TableCell>
                            <TableCell>{session.lastActiveTime}</TableCell>
                            <TableCell>
                              <Button
                                disabled={session.status !== 'ONLINE' || !canRevokeSessions}
                                onClick={() => void revokeSession(session.id)}
                                size="sm"
                                variant="outline">
                                <LogOut data-icon="inline-start" />
                                {t('webAdmin.iam.actions.revoke')}
                              </Button>
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
            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.forms.fieldTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.forms.fieldDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <TextField
                      label={t('webAdmin.iam.fields.roleCode')}
                      onChange={value => setFieldForm(current => ({ ...current, roleCode: value }))}
                      value={fieldForm.roleCode}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.resource')}
                      onChange={value => setFieldForm(current => ({ ...current, resource: value }))}
                      value={fieldForm.resource}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.fieldName')}
                      onChange={value => setFieldForm(current => ({ ...current, fieldName: value }))}
                      value={fieldForm.fieldName}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.permissionType')}
                      onChange={value => setFieldForm(current => ({ ...current, permissionType: value }))}
                      value={fieldForm.permissionType}
                    />
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button disabled={isMutating || !canManageIam} onClick={() => void submitFieldPermission()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createFieldPermission')}
                  </Button>
                </CardFooter>
              </Card>
              <PolicyCard
                description={t('webAdmin.iam.policy.fieldDescription')}
                deleteLabel={t('webAdmin.iam.actions.delete')}
                items={overview.fieldPermissions.map(
                  item => `${item.roleCode}:${item.resource}.${item.fieldName}:${item.permissionType}`,
                )}
                onDelete={
                  canManageIam
                    ? fieldPermissionId => void runMutation(token => deleteIamFieldPermission(token, fieldPermissionId))
                    : undefined
                }
                rawItems={overview.fieldPermissions.map(item => ({
                  id: item.id,
                  label: `${item.roleCode}:${item.resource}.${item.fieldName}:${item.permissionType}`,
                }))}
                title={t('webAdmin.iam.tabs.fields')}
              />
            </section>
          </TabsContent>
          <TabsContent value="policies">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.forms.policyTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.forms.policyDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <TextField
                      label={t('webAdmin.iam.fields.resource')}
                      onChange={value => setPolicyForm(current => ({ ...current, resource: value }))}
                      value={policyForm.resource}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.action')}
                      onChange={value => setPolicyForm(current => ({ ...current, action: value }))}
                      value={policyForm.action}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.effect')}
                      onChange={value => setPolicyForm(current => ({ ...current, effect: value }))}
                      value={policyForm.effect}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.conditions')}
                      onChange={value => setPolicyForm(current => ({ ...current, conditions: value }))}
                      value={policyForm.conditions}
                    />
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button disabled={isMutating || !canUpdatePolicy} onClick={() => void submitPolicy()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createPolicy')}
                  </Button>
                </CardFooter>
              </Card>
              <PolicyCard
                description={t('webAdmin.iam.policy.policyDescription')}
                items={overview.policies.map(item => `${item.effect}:${item.resource}:${item.action}`)}
                deleteLabel={t('webAdmin.iam.actions.delete')}
                onDelete={
                  canUpdatePolicy ? policyId => void runMutation(token => deleteIamPolicy(token, policyId)) : undefined
                }
                rawItems={overview.policies.map(item => ({
                  id: item.id,
                  label: `${item.effect}:${item.resource}:${item.action}`,
                }))}
                title={t('webAdmin.iam.tabs.policies')}
              />
            </section>
          </TabsContent>
          <TabsContent value="audit">
            <section className="grid gap-4">
              <PolicyCard
                description={t('webAdmin.iam.policy.auditDescription')}
                items={overview.auditLogs.map(item => `${item.action}:${item.result}:${item.createdAt}`)}
                title={t('webAdmin.iam.tabs.audit')}
              />
            </section>
          </TabsContent>
        </Tabs>
      ) : null}
    </IamPageFrame>
  );
};

export const AdminIamOverviewPage = () => <AdminIamPage section="overview" />;

export const AdminUsersPage = () => <AdminIamPage section="users" />;

export const AdminRolesPage = () => <AdminIamPage section="roles" />;

export const AdminPermissionsPage = () => <AdminIamPage section="permissions" />;

export const AdminMenusPage = () => <AdminIamPage section="menus" />;

export const AdminFieldPermissionsPage = () => <AdminIamPage section="fields" />;

export const AdminPoliciesPage = () => <AdminIamPage section="policies" />;

export const AdminSessionsPage = () => <AdminIamPage section="sessions" />;

export const AdminAuditPage = () => <AdminIamPage section="audit" />;

const IamPageFrame = ({ children }: { children: ReactNode }) => (
  <>
    <AdminHeader>
      <div className="me-auto" />
      <SearchCommand />
      <ProfileDropdown />
    </AdminHeader>
    <AdminMain aria-labelledby="admin-iam-title" className="flex flex-col gap-4">
      {children}
    </AdminMain>
  </>
);

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardHeader>
      <CardTitle>{label}</CardTitle>
    </CardHeader>
    <CardContent className="text-2xl font-semibold">{value}</CardContent>
  </Card>
);

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
  onMutate: (operation: (token: string) => Promise<unknown>) => Promise<void>;
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
              <Button
                disabled={isMutating || !canDeleteSelected}
                onClick={() => void deleteRoleSelection()}
                size="sm"
                variant="outline">
                <Trash2 data-icon="inline-start" />
                {t('webAdmin.iam.roleManager.actions.delete')}
              </Button>
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
                                onClick={() => void onMutate(token => deleteIamRole(token, role.id))}>
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
    </section>
  );
};

const RoleEditorDialog = ({
  form,
  isMutating,
  mode,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  permissions,
}: {
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
          <TextField
            label={t('webAdmin.iam.fields.dataScope')}
            onChange={value => onChange({ ...form, dataScopeType: toDataScopeType(value) })}
            value={form.dataScopeType}
          />
          <TextField
            label={t('webAdmin.iam.roleManager.fields.deptIds')}
            onChange={value => onChange({ ...form, deptIds: value })}
            value={form.deptIds}
          />
          <TextField
            label={t('webAdmin.iam.fields.permissionCodes')}
            onChange={value => onChange({ ...form, permissionCodes: value })}
            value={form.permissionCodes}
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
  form,
  isMutating,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  role,
}: {
  form: { dataScopeType: string; deptIds: string };
  isMutating: boolean;
  onChange: (form: { dataScopeType: string; deptIds: string }) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  role: RoleItem | null;
}) => {
  const t = useAdminT();
  const dataScopeOptions: DataScopeTypeInput[] = ['ALL', 'CUSTOM', 'DEPT', 'DEPT_AND_CHILD', 'SELF'];

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
          <Field>
            <FieldLabel>{t('webAdmin.iam.fields.dataScope')}</FieldLabel>
            <div className="grid gap-2 md:grid-cols-2">
              {dataScopeOptions.map(scope => (
                <Button
                  key={scope}
                  onClick={() => onChange({ ...form, dataScopeType: scope })}
                  type="button"
                  variant={form.dataScopeType === scope ? 'default' : 'outline'}>
                  {t(dataScopeLabels[scope])}
                </Button>
              ))}
            </div>
          </Field>
          <TextField
            label={t('webAdmin.iam.roleManager.fields.deptIds')}
            onChange={value => onChange({ ...form, deptIds: value })}
            value={form.deptIds}
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
            {users.map(user => (
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">{t('webAdmin.iam.roleManager.permissionMatrix.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('webAdmin.iam.roleManager.permissionMatrix.description')}</p>
      </div>
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
          {permissions.map(permission => (
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
    </div>
  );
};

const PolicyCard = ({
  description,
  deleteLabel,
  items,
  onDelete,
  rawItems,
  title,
}: {
  description: string;
  deleteLabel?: string;
  items: string[];
  onDelete?: (id: string) => void;
  rawItems?: { id: string; label: string }[];
  title: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          {(rawItems ?? items.map(item => ({ id: item, label: item }))).map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.label}</TableCell>
              {onDelete ? (
                <TableCell>
                  <Button onClick={() => onDelete(item.id)} size="sm" variant="outline">
                    <Trash2 data-icon="inline-start" />
                    {deleteLabel}
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const TextField = ({
  label,
  onChange,
  type = 'text',
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) => (
  <Field>
    <FieldLabel>{label}</FieldLabel>
    <Input onChange={event => onChange(event.target.value)} type={type} value={value} />
  </Field>
);
