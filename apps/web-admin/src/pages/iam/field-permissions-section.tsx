import { memo, useCallback } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
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
import type { FieldPermission } from '@tetap/schema/iam';
import { ConfirmActionButton } from './confirm-action-button.js';

type FieldPermissionsSectionProps = {
  canManageIam: boolean;
  fieldPermissions: FieldPermission[];
  isMutating: boolean;
  onCreate: () => void;
  onDelete: (fieldPermission: FieldPermission) => void;
  onEdit: (fieldPermission: FieldPermission) => void;
};

export const FieldPermissionsSection = memo(function FieldPermissionsSection({
  canManageIam,
  fieldPermissions,
  isMutating,
  onCreate,
  onDelete,
  onEdit,
}: FieldPermissionsSectionProps) {
  const t = useAdminT();

  return (
    <section className="grid min-w-0 gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t('webAdmin.iam.tables.fieldPermissionsTitle')}</CardTitle>
              <CardDescription>{t('webAdmin.iam.policy.fieldDescription')}</CardDescription>
            </div>
            <Button disabled={isMutating || !canManageIam} onClick={onCreate} type="button">
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
                  <FieldPermissionRow
                    canManageIam={canManageIam}
                    fieldPermission={fieldPermission}
                    isMutating={isMutating}
                    key={fieldPermission.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
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
    </section>
  );
});

type FieldPermissionRowProps = {
  canManageIam: boolean;
  fieldPermission: FieldPermission;
  isMutating: boolean;
  onDelete: (fieldPermission: FieldPermission) => void;
  onEdit: (fieldPermission: FieldPermission) => void;
};

const FieldPermissionRow = memo(function FieldPermissionRow({
  canManageIam,
  fieldPermission,
  isMutating,
  onDelete,
  onEdit,
}: FieldPermissionRowProps) {
  const t = useAdminT();
  const editFieldPermission = useCallback(() => {
    onEdit(fieldPermission);
  }, [fieldPermission, onEdit]);
  const deleteFieldPermission = useCallback(() => {
    onDelete(fieldPermission);
  }, [fieldPermission, onDelete]);

  return (
    <TableRow>
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
            onClick={editFieldPermission}
            size="sm"
            type="button"
            variant="outline">
            <Edit data-icon="inline-start" />
            {t('webAdmin.iam.actions.edit')}
          </Button>
          <ConfirmActionButton
            description={t('webAdmin.iam.confirm.deleteDescription', {
              item: `${fieldPermission.roleCode}:${fieldPermission.resource}.${fieldPermission.fieldName}`,
            })}
            disabled={isMutating || !canManageIam}
            onConfirm={deleteFieldPermission}
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
