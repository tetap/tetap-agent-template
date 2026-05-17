import { memo, useCallback, useMemo, useState } from 'react';
import {
  Database,
  Edit,
  KeyRound,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useAdminT } from '@tetap/hooks';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tetap/ui';
import { createIamRole, deleteIamRole, updateIamRole, updateIamUser } from '../../api/backend-admin.js';
import { ConfirmActionButton } from './confirm-action-button.js';
import { EnumSelectField, MultiSearchSelectField, TextField, type PickerOption } from './form-fields.js';
import { AssignedUsersDialog, PermissionChecklist } from './role-pickers.js';
import type { PermissionItem, RoleEditorState, RoleItem, UserItem } from './types.js';
import {
  dataScopeLabels,
  dataScopeOptions,
  emptyRoleEditorState,
  parseCsv,
  roleEditorToPayload,
  roleToEditorState,
  toDataScopeType,
  uniqueStrings,
} from './utils.js';

type RoleMutationRunner = (operation: (token: string) => Promise<unknown>) => Promise<boolean>;

type RoleQueryState = {
  code: string;
  dataScope: string;
  name: string;
};

const emptyRoleQuery = (): RoleQueryState => ({ code: '', dataScope: '', name: '' });

type RolesSectionProps = {
  canManageRoles: boolean;
  isMutating: boolean;
  onMutate: RoleMutationRunner;
  permissions: PermissionItem[];
  roles: RoleItem[];
  users: UserItem[];
};

export const RolesSection = memo(function RolesSection({
  canManageRoles,
  isMutating,
  onMutate,
  permissions,
  roles,
  users,
}: RolesSectionProps) {
  const t = useAdminT();
  const [query, setQuery] = useState<RoleQueryState>(emptyRoleQuery);
  const [appliedQuery, setAppliedQuery] = useState<RoleQueryState>(emptyRoleQuery);
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
  const departmentOptions = useMemo(
    () =>
      uniqueStrings([...users.map(user => user.deptId), ...roles.flatMap(role => role.dataScope.deptIds ?? [])])
        .sort()
        .map(deptId => ({
          label: t('webAdmin.iam.selection.department', { deptId }),
          value: deptId,
        })),
    [roles, t, users],
  );
  const filteredRoles = useMemo(() => {
    const normalizedName = appliedQuery.name.trim().toLowerCase();
    const normalizedCode = appliedQuery.code.trim().toLowerCase();
    const normalizedDataScope = appliedQuery.dataScope.trim().toLowerCase();

    return roles.filter(role => {
      const nameMatches = !normalizedName || role.name.toLowerCase().includes(normalizedName);
      const codeMatches = !normalizedCode || role.code.toLowerCase().includes(normalizedCode);
      const scopeMatches = !normalizedDataScope || role.dataScope.type.toLowerCase().includes(normalizedDataScope);

      return nameMatches && codeMatches && scopeMatches;
    });
  }, [appliedQuery, roles]);
  const selectedRoles = useMemo(
    () => roles.filter(role => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds],
  );
  const canEditSelected = selectedRoleIds.length === 1 && canManageRoles;
  const canDeleteSelected =
    selectedRoleIds.length > 0 && canManageRoles && selectedRoles.every(role => role.code !== 'super-admin');
  const areAllFilteredRolesSelected =
    filteredRoles.length > 0 && filteredRoles.every(role => selectedRoleIds.includes(role.id));

  const toggleRoleSelection = useCallback((roleId: string, checked: boolean | 'indeterminate') => {
    setSelectedRoleIds(current =>
      checked === true ? uniqueStrings([...current, roleId]) : current.filter(item => item !== roleId),
    );
  }, []);

  const toggleAllFilteredRoles = useCallback(
    (checked: boolean | 'indeterminate') => {
      setSelectedRoleIds(current => {
        const filteredIds = filteredRoles.map(role => role.id);

        if (checked === true) {
          return uniqueStrings([...current, ...filteredIds]);
        }

        return current.filter(roleId => !filteredIds.includes(roleId));
      });
    },
    [filteredRoles],
  );

  const openCreateRole = useCallback(() => {
    setEditingRoleId(null);
    setEditorForm(emptyRoleEditorState());
    setEditorOpen(true);
  }, []);

  const openEditRole = useCallback((role: RoleItem) => {
    setEditingRoleId(role.id);
    setEditorForm(roleToEditorState(role));
    setEditorOpen(true);
  }, []);

  const submitRoleEditor = useCallback(async () => {
    const payload = roleEditorToPayload(editorForm);
    const roleId = editingRoleId;
    const ok = await onMutate(token =>
      roleId ? updateIamRole(token, roleId, payload) : createIamRole(token, payload),
    );

    if (ok) {
      setEditorOpen(false);
    }
  }, [editingRoleId, editorForm, onMutate]);

  const deleteRoleSelection = useCallback(async () => {
    const targets = selectedRoles.filter(role => role.code !== 'super-admin');
    const ok = await onMutate(async token => Promise.all(targets.map(role => deleteIamRole(token, role.id))));

    if (ok) {
      setSelectedRoleIds([]);
    }
  }, [onMutate, selectedRoles]);

  const openPermissionGrant = useCallback((role: RoleItem) => {
    setPermissionRole(role);
    setPermissionDraft(role.permissionCodes);
  }, []);

  const togglePermission = useCallback((permissionCode: string, checked: boolean | 'indeterminate') => {
    setPermissionDraft(current =>
      checked === true ? uniqueStrings([...current, permissionCode]) : current.filter(item => item !== permissionCode),
    );
  }, []);

  const submitPermissionGrant = useCallback(async () => {
    if (!permissionRole) {
      return;
    }

    const ok = await onMutate(token => updateIamRole(token, permissionRole.id, { permissionCodes: permissionDraft }));

    if (ok) {
      setPermissionRole(null);
    }
  }, [onMutate, permissionDraft, permissionRole]);

  const openDataScopeEditor = useCallback((role: RoleItem) => {
    setDataScopeRole(role);
    setDataScopeForm({
      dataScopeType: role.dataScope.type,
      deptIds: role.dataScope.deptIds?.join(', ') ?? '',
    });
  }, []);

  const submitDataScope = useCallback(async () => {
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
  }, [dataScopeForm, dataScopeRole, onMutate]);

  const openAssignedUsers = useCallback(
    (role: RoleItem) => {
      setAssignRole(role);
      setAssignedUserIds(users.flatMap(user => (user.roleCodes.includes(role.code) ? [user.id] : [])));
    },
    [users],
  );

  const toggleAssignedUser = useCallback((userId: string, checked: boolean | 'indeterminate') => {
    setAssignedUserIds(current =>
      checked === true ? uniqueStrings([...current, userId]) : current.filter(item => item !== userId),
    );
  }, []);

  const submitAssignedUsers = useCallback(async () => {
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
  }, [assignedUserIds, assignRole, onMutate, users]);

  const applyQuery = useCallback(() => {
    setAppliedQuery(query);
  }, [query]);

  const resetQuery = useCallback(() => {
    const nextQuery = emptyRoleQuery();

    setQuery(nextQuery);
    setAppliedQuery(nextQuery);
  }, []);

  const changePermissionDialogOpen = useCallback(
    (open: boolean) => {
      setPermissionRole(open ? permissionRole : null);
    },
    [permissionRole],
  );

  const changeDataScopeDialogOpen = useCallback(
    (open: boolean) => {
      setDataScopeRole(open ? dataScopeRole : null);
    },
    [dataScopeRole],
  );

  const changeAssignDialogOpen = useCallback(
    (open: boolean) => {
      setAssignRole(open ? assignRole : null);
    },
    [assignRole],
  );

  const changeDeleteTargetOpen = useCallback(
    (open: boolean) => {
      setRoleDeleteTarget(open ? roleDeleteTarget : null);
    },
    [roleDeleteTarget],
  );

  const confirmDeleteTarget = useCallback(() => {
    const role = roleDeleteTarget;

    if (role) {
      void onMutate(token => deleteIamRole(token, role.id));
    }

    setRoleDeleteTarget(null);
  }, [onMutate, roleDeleteTarget]);

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <RoleFiltersCard onApply={applyQuery} onQueryChange={setQuery} onReset={resetQuery} query={query} />
      <RoleTable
        areAllFilteredRolesSelected={areAllFilteredRolesSelected}
        canDeleteSelected={canDeleteSelected}
        canEditSelected={canEditSelected}
        canManageRoles={canManageRoles}
        filteredRoles={filteredRoles}
        isMutating={isMutating}
        onAssignUsers={openAssignedUsers}
        onDataScope={openDataScopeEditor}
        onDeleteRole={setRoleDeleteTarget}
        onDeleteSelection={deleteRoleSelection}
        onEditRole={openEditRole}
        onGrantPermissions={openPermissionGrant}
        onSelectAll={toggleAllFilteredRoles}
        onSelectRole={toggleRoleSelection}
        onCreateRole={openCreateRole}
        selectedRoleIds={selectedRoleIds}
        selectedRoles={selectedRoles}
        users={users}
      />
      <RoleEditorDialog
        departmentOptions={departmentOptions}
        form={editorForm}
        isMutating={isMutating}
        mode={editingRoleId ? 'edit' : 'create'}
        onChange={setEditorForm}
        onOpenChange={setEditorOpen}
        onSubmit={submitRoleEditor}
        open={editorOpen}
        permissions={permissions}
      />
      <PermissionGrantDialog
        draft={permissionDraft}
        isMutating={isMutating}
        onOpenChange={changePermissionDialogOpen}
        onSubmit={submitPermissionGrant}
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
        onOpenChange={changeDataScopeDialogOpen}
        onSubmit={submitDataScope}
        open={Boolean(dataScopeRole)}
        role={dataScopeRole}
      />
      <AssignedUsersDialog
        assignedUserIds={assignedUserIds}
        isMutating={isMutating}
        onOpenChange={changeAssignDialogOpen}
        onSubmit={submitAssignedUsers}
        onToggle={toggleAssignedUser}
        open={Boolean(assignRole)}
        role={assignRole}
        users={users}
      />
      <AlertDialog onOpenChange={changeDeleteTargetOpen} open={Boolean(roleDeleteTarget)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('webAdmin.iam.confirm.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('webAdmin.iam.confirm.deleteDescription', { item: roleDeleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTarget}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
});

type RoleFiltersCardProps = {
  onApply: () => void;
  onQueryChange: (query: RoleQueryState) => void;
  onReset: () => void;
  query: RoleQueryState;
};

const RoleFiltersCard = memo(function RoleFiltersCard({
  onApply,
  onQueryChange,
  onReset,
  query,
}: RoleFiltersCardProps) {
  const t = useAdminT();
  const changeName = useCallback(
    (value: string) => {
      onQueryChange({ ...query, name: value });
    },
    [onQueryChange, query],
  );
  const changeCode = useCallback(
    (value: string) => {
      onQueryChange({ ...query, code: value });
    },
    [onQueryChange, query],
  );
  const changeDataScope = useCallback(
    (value: string) => {
      onQueryChange({ ...query, dataScope: value });
    },
    [onQueryChange, query],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('webAdmin.iam.roleManager.filters.title')}</CardTitle>
        <CardDescription>{t('webAdmin.iam.roleManager.filters.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <TextField label={t('webAdmin.iam.roleManager.filters.roleName')} onChange={changeName} value={query.name} />
          <TextField label={t('webAdmin.iam.roleManager.filters.roleCode')} onChange={changeCode} value={query.code} />
          <TextField
            label={t('webAdmin.iam.roleManager.filters.dataScope')}
            onChange={changeDataScope}
            value={query.dataScope}
          />
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={onApply} type="button">
          <Search data-icon="inline-start" />
          {t('webAdmin.iam.roleManager.actions.search')}
        </Button>
        <Button onClick={onReset} type="button" variant="outline">
          <RotateCcw data-icon="inline-start" />
          {t('webAdmin.iam.roleManager.actions.reset')}
        </Button>
      </CardFooter>
    </Card>
  );
});

type RoleTableProps = {
  areAllFilteredRolesSelected: boolean;
  canDeleteSelected: boolean;
  canEditSelected: boolean;
  canManageRoles: boolean;
  filteredRoles: RoleItem[];
  isMutating: boolean;
  onAssignUsers: (role: RoleItem) => void;
  onCreateRole: () => void;
  onDataScope: (role: RoleItem) => void;
  onDeleteRole: (role: RoleItem) => void;
  onDeleteSelection: () => Promise<void>;
  onEditRole: (role: RoleItem) => void;
  onGrantPermissions: (role: RoleItem) => void;
  onSelectAll: (checked: boolean | 'indeterminate') => void;
  onSelectRole: (roleId: string, checked: boolean | 'indeterminate') => void;
  selectedRoleIds: string[];
  selectedRoles: RoleItem[];
  users: UserItem[];
};

const RoleTable = memo(function RoleTable({
  areAllFilteredRolesSelected,
  canDeleteSelected,
  canEditSelected,
  canManageRoles,
  filteredRoles,
  isMutating,
  onAssignUsers,
  onCreateRole,
  onDataScope,
  onDeleteRole,
  onDeleteSelection,
  onEditRole,
  onGrantPermissions,
  onSelectAll,
  onSelectRole,
  selectedRoleIds,
  selectedRoles,
  users,
}: RoleTableProps) {
  const t = useAdminT();
  const selectedRoleNames = useMemo(() => selectedRoles.map(role => role.name).join(', '), [selectedRoles]);
  const editSelectedRole = useCallback(() => {
    const [role] = selectedRoles;

    if (role) {
      onEditRole(role);
    }
  }, [onEditRole, selectedRoles]);
  const deleteSelectedRoles = useCallback(() => {
    void onDeleteSelection();
  }, [onDeleteSelection]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>{t('webAdmin.iam.tables.rolesTitle')}</CardTitle>
            <CardDescription>{t('webAdmin.iam.tables.rolesDescription')}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isMutating || !canManageRoles} onClick={onCreateRole} size="sm" type="button">
              <Plus data-icon="inline-start" />
              {t('webAdmin.iam.roleManager.actions.add')}
            </Button>
            <Button
              disabled={isMutating || !canEditSelected}
              onClick={editSelectedRole}
              size="sm"
              type="button"
              variant="outline">
              <Edit data-icon="inline-start" />
              {t('webAdmin.iam.roleManager.actions.edit')}
            </Button>
            <ConfirmActionButton
              description={t('webAdmin.iam.confirm.deleteDescription', { item: selectedRoleNames })}
              disabled={isMutating || !canDeleteSelected}
              onConfirm={deleteSelectedRoles}
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
                  onCheckedChange={onSelectAll}
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
                <RoleTableRow
                  canManageRoles={canManageRoles}
                  index={index}
                  isMutating={isMutating}
                  key={role.id}
                  onAssignUsers={onAssignUsers}
                  onDataScope={onDataScope}
                  onDeleteRole={onDeleteRole}
                  onEditRole={onEditRole}
                  onGrantPermissions={onGrantPermissions}
                  onSelectRole={onSelectRole}
                  role={role}
                  selected={selectedRoleIds.includes(role.id)}
                  userCount={users.filter(user => user.roleCodes.includes(role.code)).length}
                />
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
  );
});

type RoleTableRowProps = {
  canManageRoles: boolean;
  index: number;
  isMutating: boolean;
  onAssignUsers: (role: RoleItem) => void;
  onDataScope: (role: RoleItem) => void;
  onDeleteRole: (role: RoleItem) => void;
  onEditRole: (role: RoleItem) => void;
  onGrantPermissions: (role: RoleItem) => void;
  onSelectRole: (roleId: string, checked: boolean | 'indeterminate') => void;
  role: RoleItem;
  selected: boolean;
  userCount: number;
};

const RoleTableRow = memo(function RoleTableRow({
  canManageRoles,
  index,
  isMutating,
  onAssignUsers,
  onDataScope,
  onDeleteRole,
  onEditRole,
  onGrantPermissions,
  onSelectRole,
  role,
  selected,
  userCount,
}: RoleTableRowProps) {
  const t = useAdminT();
  const selectRole = useCallback(
    (checked: boolean | 'indeterminate') => {
      onSelectRole(role.id, checked);
    },
    [onSelectRole, role.id],
  );
  const editRole = useCallback(() => {
    onEditRole(role);
  }, [onEditRole, role]);
  const grantPermissions = useCallback(() => {
    onGrantPermissions(role);
  }, [onGrantPermissions, role]);
  const editDataScope = useCallback(() => {
    onDataScope(role);
  }, [onDataScope, role]);
  const assignUsers = useCallback(() => {
    onAssignUsers(role);
  }, [onAssignUsers, role]);
  const deleteRole = useCallback(() => {
    onDeleteRole(role);
  }, [onDeleteRole, role]);

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          aria-label={t('webAdmin.iam.roleManager.selection.selectRole')}
          checked={selected}
          onCheckedChange={selectRole}
        />
      </TableCell>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{role.name}</span>
          {role.description ? <span className="text-muted-foreground text-xs">{role.description}</span> : null}
        </div>
      </TableCell>
      <TableCell>{role.code}</TableCell>
      <TableCell>
        <Badge variant="outline">{t(dataScopeLabels[role.dataScope.type])}</Badge>
      </TableCell>
      <TableCell>{userCount}</TableCell>
      <TableCell>
        <Badge variant="secondary">{role.permissionCodes.length}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button disabled={isMutating || !canManageRoles} onClick={editRole} size="sm" type="button" variant="ghost">
            <Edit data-icon="inline-start" />
            {t('webAdmin.iam.roleManager.actions.edit')}
          </Button>
          <Button
            disabled={isMutating || !canManageRoles}
            onClick={grantPermissions}
            size="sm"
            type="button"
            variant="ghost">
            <KeyRound data-icon="inline-start" />
            {t('webAdmin.iam.roleManager.actions.permissions')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" type="button" variant="ghost">
                <MoreHorizontal data-icon="inline-start" />
                {t('webAdmin.iam.roleManager.actions.more')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem disabled={isMutating || !canManageRoles} onClick={editDataScope}>
                  <Database />
                  {t('webAdmin.iam.roleManager.actions.dataScope')}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isMutating || !canManageRoles} onClick={assignUsers}>
                  <UserPlus />
                  {t('webAdmin.iam.roleManager.actions.assignUsers')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isMutating || role.code === 'super-admin' || !canManageRoles}
                  onClick={deleteRole}>
                  <Trash2 />
                  {t('webAdmin.iam.roleManager.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

type RoleEditorDialogProps = {
  departmentOptions: PickerOption[];
  form: RoleEditorState;
  isMutating: boolean;
  mode: 'create' | 'edit';
  onChange: (form: RoleEditorState) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  permissions: PermissionItem[];
};

const RoleEditorDialog = memo(function RoleEditorDialog({
  departmentOptions,
  form,
  isMutating,
  mode,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  permissions,
}: RoleEditorDialogProps) {
  const t = useAdminT();
  const selectedPermissionCodes = useMemo(() => parseCsv(form.permissionCodes), [form.permissionCodes]);
  const permissionOptions = useMemo(
    () =>
      permissions.map(permission => ({
        description: `${permission.type} / ${permission.resource}:${permission.action}`,
        label: permission.code,
        value: permission.code,
      })),
    [permissions],
  );
  const translatedDataScopeOptions = useMemo(
    () =>
      dataScopeOptions.map(option => ({
        label: t(option.label as Parameters<typeof t>[0]),
        value: option.value,
      })),
    [t],
  );
  const changeName = useCallback((value: string) => onChange({ ...form, name: value }), [form, onChange]);
  const changeCode = useCallback((value: string) => onChange({ ...form, code: value }), [form, onChange]);
  const changeDataScopeType = useCallback(
    (value: string) => onChange({ ...form, dataScopeType: toDataScopeType(value) }),
    [form, onChange],
  );
  const changeDeptIds = useCallback(
    (values: string[]) => onChange({ ...form, deptIds: values.join(', ') }),
    [form, onChange],
  );
  const changePermissionCodes = useCallback(
    (values: string[]) => onChange({ ...form, permissionCodes: values.join(', ') }),
    [form, onChange],
  );
  const changeDescription = useCallback((value: string) => onChange({ ...form, description: value }), [form, onChange]);
  const togglePermission = useCallback(
    (permissionCode: string, checked: boolean | 'indeterminate') => {
      const nextCodes =
        checked === true
          ? uniqueStrings([...selectedPermissionCodes, permissionCode])
          : selectedPermissionCodes.filter(code => code !== permissionCode);

      onChange({ ...form, permissionCodes: nextCodes.join(', ') });
    },
    [form, onChange, selectedPermissionCodes],
  );

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
          <TextField label={t('webAdmin.iam.fields.name')} onChange={changeName} value={form.name} />
          <TextField label={t('webAdmin.iam.fields.code')} onChange={changeCode} value={form.code} />
          <EnumSelectField
            label={t('webAdmin.iam.fields.dataScope')}
            onChange={changeDataScopeType}
            options={translatedDataScopeOptions}
            value={toDataScopeType(form.dataScopeType)}
          />
          <MultiSearchSelectField
            label={t('webAdmin.iam.roleManager.fields.deptIds')}
            onChange={changeDeptIds}
            options={departmentOptions}
            values={parseCsv(form.deptIds)}
          />
          <MultiSearchSelectField
            label={t('webAdmin.iam.fields.permissionCodes')}
            onChange={changePermissionCodes}
            options={permissionOptions}
            values={selectedPermissionCodes}
          />
          <TextField
            label={t('webAdmin.iam.roleManager.fields.description')}
            onChange={changeDescription}
            value={form.description}
          />
        </FieldGroup>
        <PermissionChecklist
          onToggle={togglePermission}
          permissions={permissions}
          selectedPermissionCodes={selectedPermissionCodes}
        />
        <DialogFooter>
          <Button disabled={isMutating} onClick={onSubmit} type="button">
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

type PermissionGrantDialogProps = {
  draft: string[];
  isMutating: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onToggle: (permissionCode: string, checked: boolean | 'indeterminate') => void;
  open: boolean;
  permissions: PermissionItem[];
  role: RoleItem | null;
};

const PermissionGrantDialog = memo(function PermissionGrantDialog({
  draft,
  isMutating,
  onOpenChange,
  onSubmit,
  onToggle,
  open,
  permissions,
  role,
}: PermissionGrantDialogProps) {
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
          <Button disabled={isMutating || !role} onClick={onSubmit} type="button">
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

type DataScopeDialogProps = {
  departmentOptions: PickerOption[];
  form: { dataScopeType: string; deptIds: string };
  isMutating: boolean;
  onChange: (form: { dataScopeType: string; deptIds: string }) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  role: RoleItem | null;
};

const DataScopeDialog = memo(function DataScopeDialog({
  departmentOptions,
  form,
  isMutating,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  role,
}: DataScopeDialogProps) {
  const t = useAdminT();
  const translatedDataScopeOptions = useMemo(
    () =>
      dataScopeOptions.map(option => ({
        label: t(option.label as Parameters<typeof t>[0]),
        value: option.value,
      })),
    [t],
  );
  const changeDataScopeType = useCallback(
    (value: string) => onChange({ ...form, dataScopeType: value }),
    [form, onChange],
  );
  const changeDeptIds = useCallback(
    (values: string[]) => onChange({ ...form, deptIds: values.join(', ') }),
    [form, onChange],
  );

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
            onChange={changeDataScopeType}
            options={translatedDataScopeOptions}
            value={toDataScopeType(form.dataScopeType)}
          />
          <MultiSearchSelectField
            label={t('webAdmin.iam.roleManager.fields.deptIds')}
            onChange={changeDeptIds}
            options={departmentOptions}
            values={parseCsv(form.deptIds)}
          />
        </FieldGroup>
        <DialogFooter>
          <Button disabled={isMutating || !role} onClick={onSubmit} type="button">
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
