import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { getUserTimeZone, useAdminSessionStore, useAdminT } from '@tetap/hooks';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FieldGroup,
  Skeleton,
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
  createIamUser,
  deleteIamFieldPermission,
  deleteIamMenu,
  deleteIamPermission,
  deleteIamPolicy,
  deleteIamUser,
  fetchIamFieldPermissions,
  fetchIamMenus,
  fetchIamOperationLogs,
  fetchIamPermissions,
  fetchIamPolicies,
  fetchIamRoles,
  fetchIamSessions,
  fetchIamUsers,
  resolveBackendAdminErrorMessage,
  revokeIamSession,
  updateIamUser,
  updateIamFieldPermission,
  updateIamPolicy,
} from '../api/backend-admin.js';
import type { FieldPermission, IamMenuNode, IamOperationLogsData, IamPolicy, IamSession } from '@tetap/schema/iam';
import { EnumSelectField, MultiSearchSelectField, SearchableSelectField, TextField } from './iam/form-fields.js';
import { FieldPermissionsSection } from './iam/field-permissions-section.js';
import { MenusSection } from './iam/menus-section.js';
import { OperationLogsTable, type OperationLogQueryState } from './iam/operation-logs-table.js';
import { PoliciesSection } from './iam/policies-section.js';
import { PermissionsSection } from './iam/permissions-section.js';
import { RolesSection } from './iam/roles-section.js';
import { SessionsSection } from './iam/sessions-section.js';
import type {
  CreateDialogKind,
  FieldFormState,
  IamPageData,
  IamSection,
  MenuFormState,
  PermissionFormState,
  PermissionItem,
  PolicyFormState,
  UserFormState,
  UserItem,
} from './iam/types.js';
import {
  fieldPermissionTypeOptions,
  flattenIamMenus,
  parseCsv,
  parsePolicyConditions,
  permissionTypeOptions,
  policyEffectOptions,
  toFieldPermissionType,
  toPermissionType,
  toPolicyEffect,
  uniqueStrings,
} from './iam/utils.js';
import { UsersSection } from './iam/users-section.js';

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

export const AdminIamPage = memo(function AdminIamPage({ section = 'users' }: { section?: IamSection }) {
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

  const changeCreateDialog = useCallback((dialog: CreateDialogKind | null) => {
    setCreateDialog(dialog);

    if (!dialog) {
      setEditingFieldPermissionId(null);
      setEditingPolicyId(null);
    }
  }, []);

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
      toast.error(resolveBackendAdminErrorMessage(error, t('webAdmin.iam.states.loadFailed')));
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
        toast.error(resolveBackendAdminErrorMessage(error, t('webAdmin.iam.states.revokeFailed')));
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
        toast.error(resolveBackendAdminErrorMessage(error, t('webAdmin.iam.states.mutationFailed')));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, loadSectionData, t],
  );

  const submitUser = useCallback(
    () =>
      runMutation(token =>
        createIamUser(token, {
          username: userForm.username,
          email: userForm.email,
          password: userForm.password,
          deptId: userForm.deptId || undefined,
          roleCodes: parseCsv(userForm.roleCodes),
        }),
      ),
    [runMutation, userForm],
  );

  const submitPermission = useCallback(
    () =>
      runMutation(token =>
        createIamPermission(token, {
          code: permissionForm.code,
          name: permissionForm.name,
          type: toPermissionType(permissionForm.type),
          resource: permissionForm.resource,
          action: permissionForm.action,
        }),
      ),
    [permissionForm, runMutation],
  );

  const submitMenu = useCallback(
    () =>
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
      ),
    [menuForm, runMutation],
  );

  const submitFieldPermission = useCallback(
    () =>
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
      ),
    [editingFieldPermissionId, fieldForm, runMutation],
  );

  const submitPolicy = useCallback(
    () =>
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
      ),
    [editingPolicyId, policyForm, runMutation],
  );

  const openCreateFieldPermission = useCallback(() => {
    setEditingFieldPermissionId(null);
    setFieldForm({ fieldName: '', permissionType: 'MASK', resource: '', roleCode: '' });
    setCreateDialog('fields');
  }, []);

  const openEditFieldPermission = useCallback((fieldPermission: FieldPermission) => {
    setEditingFieldPermissionId(fieldPermission.id);
    setFieldForm({
      fieldName: fieldPermission.fieldName,
      permissionType: fieldPermission.permissionType,
      resource: fieldPermission.resource,
      roleCode: fieldPermission.roleCode,
    });
    setCreateDialog('fields');
  }, []);

  const openCreatePolicy = useCallback(() => {
    setEditingPolicyId(null);
    setPolicyForm({ action: '', conditions: '{"all":[]}', effect: 'ALLOW', resource: '' });
    setCreateDialog('policies');
  }, []);

  const openEditPolicy = useCallback((policy: IamPolicy) => {
    setEditingPolicyId(policy.id);
    setPolicyForm({
      action: policy.action,
      conditions: JSON.stringify(policy.conditions),
      effect: policy.effect,
      resource: policy.resource,
    });
    setCreateDialog('policies');
  }, []);

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

  const refreshSectionData = useCallback(() => {
    void loadSectionData();
  }, [loadSectionData]);

  const submitUserAndClose = useCallback(() => {
    void submitUser().then(ok => ok && changeCreateDialog(null));
  }, [changeCreateDialog, submitUser]);

  const submitPermissionAndClose = useCallback(() => {
    void submitPermission().then(ok => ok && changeCreateDialog(null));
  }, [changeCreateDialog, submitPermission]);

  const submitMenuAndClose = useCallback(() => {
    void submitMenu().then(ok => ok && changeCreateDialog(null));
  }, [changeCreateDialog, submitMenu]);

  const submitFieldPermissionAndClose = useCallback(() => {
    void submitFieldPermission().then(ok => ok && changeCreateDialog(null));
  }, [changeCreateDialog, submitFieldPermission]);

  const submitPolicyAndClose = useCallback(() => {
    void submitPolicy().then(ok => ok && changeCreateDialog(null));
  }, [changeCreateDialog, submitPolicy]);

  const deleteFieldPermission = useCallback(
    (fieldPermission: FieldPermission) => {
      void runMutation(token => deleteIamFieldPermission(token, fieldPermission.id));
    },
    [runMutation],
  );

  const deletePolicy = useCallback(
    (policy: IamPolicy) => {
      void runMutation(token => deleteIamPolicy(token, policy.id));
    },
    [runMutation],
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
          <Button disabled={isRefreshing} onClick={refreshSectionData} variant="outline">
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
            onSubmitFieldPermission={submitFieldPermissionAndClose}
            onSubmitMenu={submitMenuAndClose}
            onSubmitPermission={submitPermissionAndClose}
            onSubmitPolicy={submitPolicyAndClose}
            onSubmitUser={submitUserAndClose}
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
              <RolesSection
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
              <FieldPermissionsSection
                canManageIam={canManageIam}
                fieldPermissions={data.fieldPermissions}
                isMutating={isMutating}
                onCreate={openCreateFieldPermission}
                onDelete={deleteFieldPermission}
                onEdit={openEditFieldPermission}
              />
            </TabsContent>
            <TabsContent value="policies">
              <PoliciesSection
                canUpdatePolicy={canUpdatePolicy}
                isMutating={isMutating}
                onCreate={openCreatePolicy}
                onDelete={deletePolicy}
                onEdit={openEditPolicy}
                policies={data.policies}
              />
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
});

export const AdminUsersPage = memo(function AdminUsersPage() {
  return <AdminIamPage section="users" />;
});

export const AdminRolesPage = memo(function AdminRolesPage() {
  return <AdminIamPage section="roles" />;
});

export const AdminPermissionsPage = memo(function AdminPermissionsPage() {
  return <AdminIamPage section="permissions" />;
});

export const AdminMenusPage = memo(function AdminMenusPage() {
  return <AdminIamPage section="menus" />;
});

export const AdminFieldPermissionsPage = memo(function AdminFieldPermissionsPage() {
  return <AdminIamPage section="fields" />;
});

export const AdminPoliciesPage = memo(function AdminPoliciesPage() {
  return <AdminIamPage section="policies" />;
});

export const AdminSessionsPage = memo(function AdminSessionsPage() {
  return <AdminIamPage section="sessions" />;
});

export const AdminOperationLogsPage = memo(function AdminOperationLogsPage() {
  return <AdminIamPage section="operationLogs" />;
});

const IamPageFrame = memo(function IamPageFrame({ children }: { children: ReactNode }) {
  return (
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
});

const CreateIamDialogs = memo(function CreateIamDialogs({
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
}) {
  const t = useAdminT();
  const roleOptions = useMemo(
    () =>
      data.roles.map(role => ({
        description: role.description,
        label: `${role.name} (${role.code})`,
        value: role.code,
      })),
    [data.roles],
  );
  const departmentOptions = useMemo(
    () => [
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
    ],
    [data.roles, data.users, t],
  );
  const permissionOptions = useMemo(
    () =>
      data.permissions.map(permission => ({
        description: `${permission.type} / ${permission.resource}:${permission.action}`,
        label: permission.code,
        value: permission.code,
      })),
    [data.permissions],
  );
  const menuOptions = useMemo(
    () => [
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
    ],
    [data.menus, t],
  );
  const close = useCallback((open: boolean) => onDialogChange(open ? dialog : null), [dialog, onDialogChange]);

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
});
