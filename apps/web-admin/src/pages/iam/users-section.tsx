import { memo, useCallback } from 'react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useAdminT } from '@tetap/hooks';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tetap/ui';
import type { IamUser } from '@tetap/schema/iam';
import { ConfirmActionButton } from './confirm-action-button.js';

type UsersSectionProps = {
  canManageUsers: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onDelete: (user: IamUser) => void;
  onToggleStatus: (user: IamUser) => void;
  users: IamUser[];
};

export const UsersSection = memo(function UsersSection({
  canManageUsers,
  isMutating,
  onCreate,
  onDelete,
  onToggleStatus,
  users,
}: UsersSectionProps) {
  const t = useAdminT();

  return (
    <section className="grid min-w-0 gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t('webAdmin.iam.tables.usersTitle')}</CardTitle>
              <CardDescription>{t('webAdmin.iam.tables.usersDescription')}</CardDescription>
            </div>
            <Button disabled={isMutating || !canManageUsers} onClick={onCreate} type="button">
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
              {users.map(user => (
                <UserRow
                  canManageUsers={canManageUsers}
                  isMutating={isMutating}
                  key={user.id}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  user={user}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
});

type UserRowProps = {
  canManageUsers: boolean;
  isMutating: boolean;
  onDelete: (user: IamUser) => void;
  onToggleStatus: (user: IamUser) => void;
  user: IamUser;
};

const UserRow = memo(function UserRow({ canManageUsers, isMutating, onDelete, onToggleStatus, user }: UserRowProps) {
  const t = useAdminT();
  const toggleStatus = useCallback(() => {
    onToggleStatus(user);
  }, [onToggleStatus, user]);
  const deleteUser = useCallback(() => {
    onDelete(user);
  }, [onDelete, user]);

  return (
    <TableRow>
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
            onClick={toggleStatus}
            size="sm"
            type="button"
            variant="outline">
            {isMutating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {user.status === 'ACTIVE' ? t('webAdmin.iam.actions.disableUser') : t('webAdmin.iam.actions.activateUser')}
          </Button>
          <ConfirmActionButton
            description={t('webAdmin.iam.confirm.deleteDescription', { item: user.username })}
            disabled={isMutating || user.isSuperAdmin || !canManageUsers}
            onConfirm={deleteUser}
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
});
