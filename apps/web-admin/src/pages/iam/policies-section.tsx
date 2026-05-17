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
import type { IamPolicy } from '@tetap/schema/iam';
import { ConfirmActionButton } from './confirm-action-button.js';
import { stringifyPolicyConditions } from './utils.js';

type PoliciesSectionProps = {
  canUpdatePolicy: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onDelete: (policy: IamPolicy) => void;
  onEdit: (policy: IamPolicy) => void;
  policies: IamPolicy[];
};

export const PoliciesSection = memo(function PoliciesSection({
  canUpdatePolicy,
  isMutating,
  onCreate,
  onDelete,
  onEdit,
  policies,
}: PoliciesSectionProps) {
  const t = useAdminT();

  return (
    <section className="grid min-w-0 gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t('webAdmin.iam.tables.policiesTitle')}</CardTitle>
              <CardDescription>{t('webAdmin.iam.policy.policyDescription')}</CardDescription>
            </div>
            <Button disabled={isMutating || !canUpdatePolicy} onClick={onCreate} type="button">
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
                {policies.map(policy => (
                  <PolicyRow
                    canUpdatePolicy={canUpdatePolicy}
                    isMutating={isMutating}
                    key={policy.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    policy={policy}
                  />
                ))}
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
    </section>
  );
});

type PolicyRowProps = {
  canUpdatePolicy: boolean;
  isMutating: boolean;
  onDelete: (policy: IamPolicy) => void;
  onEdit: (policy: IamPolicy) => void;
  policy: IamPolicy;
};

const PolicyRow = memo(function PolicyRow({ canUpdatePolicy, isMutating, onDelete, onEdit, policy }: PolicyRowProps) {
  const t = useAdminT();
  const conditions = stringifyPolicyConditions(policy.conditions);
  const editPolicy = useCallback(() => {
    onEdit(policy);
  }, [onEdit, policy]);
  const deletePolicy = useCallback(() => {
    onDelete(policy);
  }, [onDelete, policy]);

  return (
    <TableRow>
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
            onClick={editPolicy}
            size="sm"
            type="button"
            variant="outline">
            <Edit data-icon="inline-start" />
            {t('webAdmin.iam.actions.edit')}
          </Button>
          <ConfirmActionButton
            description={t('webAdmin.iam.confirm.deleteDescription', {
              item: `${policy.effect}:${policy.resource}:${policy.action}`,
            })}
            disabled={isMutating || !canUpdatePolicy}
            onConfirm={deletePolicy}
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
