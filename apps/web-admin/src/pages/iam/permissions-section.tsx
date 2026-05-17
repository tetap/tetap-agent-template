import { memo, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import type { IamPermission } from '@tetap/schema/iam';
import { ConfirmActionButton } from './confirm-action-button.js';

type PermissionsSectionProps = {
  canManageIam: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onDelete: (permission: IamPermission) => void;
  permissions: IamPermission[];
};

export const PermissionsSection = memo(function PermissionsSection({
  canManageIam,
  isMutating,
  onCreate,
  onDelete,
  permissions,
}: PermissionsSectionProps) {
  const t = useAdminT();

  return (
    <section className="grid min-w-0 gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t('webAdmin.iam.tables.permissionsTitle')}</CardTitle>
              <CardDescription>{t('webAdmin.iam.tables.permissionsDescription')}</CardDescription>
            </div>
            <Button disabled={isMutating || !canManageIam} onClick={onCreate} type="button">
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
              {permissions.map(permission => (
                <PermissionRow
                  canManageIam={canManageIam}
                  isMutating={isMutating}
                  key={permission.id}
                  onDelete={onDelete}
                  permission={permission}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
});

type PermissionRowProps = {
  canManageIam: boolean;
  isMutating: boolean;
  onDelete: (permission: IamPermission) => void;
  permission: IamPermission;
};

const PermissionRow = memo(function PermissionRow({
  canManageIam,
  isMutating,
  onDelete,
  permission,
}: PermissionRowProps) {
  const t = useAdminT();
  const deletePermission = useCallback(() => {
    onDelete(permission);
  }, [onDelete, permission]);

  return (
    <TableRow>
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
          onConfirm={deletePermission}
          pending={isMutating}
          size="sm"
          title={t('webAdmin.iam.confirm.deleteTitle')}
          variant="outline">
          <Trash2 data-icon="inline-start" />
          {t('webAdmin.iam.actions.delete')}
        </ConfirmActionButton>
      </TableCell>
    </TableRow>
  );
});
