import { memo, useCallback, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAdminT } from '@tetap/hooks';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tetap/ui';
import type { IamPermission, IamRole, IamUser } from '@tetap/schema/iam';
import { TextField, optionPageSize } from './form-fields.js';

type CheckedState = boolean | 'indeterminate';

type PickerState = {
  page: number;
  query: string;
};

type AssignedUsersDialogProps = {
  assignedUserIds: string[];
  isMutating: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onToggle: (userId: string, checked: CheckedState) => void;
  open: boolean;
  role: IamRole | null;
  users: IamUser[];
};

export const AssignedUsersDialog = memo(function AssignedUsersDialog({
  assignedUserIds,
  isMutating,
  onOpenChange,
  onSubmit,
  onToggle,
  open,
  role,
  users,
}: AssignedUsersDialogProps) {
  const t = useAdminT();
  const [pickerState, setPickerState] = useState<PickerState>({ page: 0, query: '' });
  const { query } = pickerState;
  const filteredUsers = useMemo(() => filterUsers(users, query), [users, query]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / optionPageSize)), [filteredUsers]);
  const page = Math.min(pickerState.page, pageCount - 1);
  const pageItems = useMemo(
    () => filteredUsers.slice(page * optionPageSize, (page + 1) * optionPageSize),
    [filteredUsers, page],
  );
  const assignedUserSet = useMemo(() => new Set(assignedUserIds), [assignedUserIds]);
  const changeQuery = useCallback((nextQuery: string) => {
    setPickerState({ page: 0, query: nextQuery });
  }, []);
  const goPrevious = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.max(0, current.page - 1) }));
  }, []);
  const goNext = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.min(pageCount - 1, current.page + 1) }));
  }, [pageCount]);

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
        <TextField label={t('webAdmin.iam.selection.search')} onChange={changeQuery} value={query} />
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
              <AssignedUserRow checked={assignedUserSet.has(user.id)} key={user.id} onToggle={onToggle} user={user} />
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button disabled={page === 0} onClick={goPrevious} type="button" variant="outline">
            {t('webAdmin.iam.selection.prev')}
          </Button>
          <Button disabled={page + 1 >= pageCount} onClick={goNext} type="button" variant="outline">
            {t('webAdmin.iam.selection.next')}
          </Button>
          <Button disabled={isMutating || !role} onClick={onSubmit} type="button">
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

type AssignedUserRowProps = {
  checked: boolean;
  onToggle: (userId: string, checked: CheckedState) => void;
  user: IamUser;
};

const AssignedUserRow = memo(function AssignedUserRow({ checked, onToggle, user }: AssignedUserRowProps) {
  const t = useAdminT();
  const toggleUser = useCallback(
    (nextChecked: CheckedState) => {
      onToggle(user.id, nextChecked);
    },
    [onToggle, user.id],
  );

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          aria-label={t('webAdmin.iam.roleManager.selection.selectUser')}
          checked={checked}
          onCheckedChange={toggleUser}
        />
      </TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge>
      </TableCell>
      <TableCell>{user.roleCodes.join(', ')}</TableCell>
    </TableRow>
  );
});

type PermissionChecklistProps = {
  onToggle: (permissionCode: string, checked: CheckedState) => void;
  permissions: IamPermission[];
  selectedPermissionCodes: string[];
};

export const PermissionChecklist = memo(function PermissionChecklist({
  onToggle,
  permissions,
  selectedPermissionCodes,
}: PermissionChecklistProps) {
  const t = useAdminT();
  const [pickerState, setPickerState] = useState<PickerState>({ page: 0, query: '' });
  const { query } = pickerState;
  const filteredPermissions = useMemo(() => filterPermissions(permissions, query), [permissions, query]);
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredPermissions.length / optionPageSize)),
    [filteredPermissions],
  );
  const page = Math.min(pickerState.page, pageCount - 1);
  const pageItems = useMemo(
    () => filteredPermissions.slice(page * optionPageSize, (page + 1) * optionPageSize),
    [filteredPermissions, page],
  );
  const selectedPermissionSet = useMemo(() => new Set(selectedPermissionCodes), [selectedPermissionCodes]);
  const changeQuery = useCallback((nextQuery: string) => {
    setPickerState({ page: 0, query: nextQuery });
  }, []);
  const goPrevious = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.max(0, current.page - 1) }));
  }, []);
  const goNext = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.min(pageCount - 1, current.page + 1) }));
  }, [pageCount]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">{t('webAdmin.iam.roleManager.permissionMatrix.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('webAdmin.iam.roleManager.permissionMatrix.description')}</p>
      </div>
      <TextField label={t('webAdmin.iam.selection.search')} onChange={changeQuery} value={query} />
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
            <PermissionRow
              checked={selectedPermissionSet.has(permission.code)}
              key={permission.id}
              onToggle={onToggle}
              permission={permission}
            />
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-2">
        <Button disabled={page === 0} onClick={goPrevious} type="button" variant="outline">
          {t('webAdmin.iam.selection.prev')}
        </Button>
        <Button disabled={page + 1 >= pageCount} onClick={goNext} type="button" variant="outline">
          {t('webAdmin.iam.selection.next')}
        </Button>
      </div>
    </div>
  );
});

type PermissionRowProps = {
  checked: boolean;
  onToggle: (permissionCode: string, checked: CheckedState) => void;
  permission: IamPermission;
};

const PermissionRow = memo(function PermissionRow({ checked, onToggle, permission }: PermissionRowProps) {
  const t = useAdminT();
  const togglePermission = useCallback(
    (nextChecked: CheckedState) => {
      onToggle(permission.code, nextChecked);
    },
    [onToggle, permission.code],
  );

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          aria-label={t('webAdmin.iam.roleManager.selection.selectPermission')}
          checked={checked}
          onCheckedChange={togglePermission}
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
  );
});

const filterUsers = (users: IamUser[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  return normalizedQuery
    ? users.filter(
        user =>
          user.username.toLowerCase().includes(normalizedQuery) || user.email.toLowerCase().includes(normalizedQuery),
      )
    : users;
};

const filterPermissions = (permissions: IamPermission[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  return normalizedQuery
    ? permissions.filter(
        permission =>
          permission.code.toLowerCase().includes(normalizedQuery) ||
          permission.name.toLowerCase().includes(normalizedQuery) ||
          permission.resource.toLowerCase().includes(normalizedQuery),
      )
    : permissions;
};
