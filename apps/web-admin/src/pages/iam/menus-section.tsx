import { memo, useCallback, useMemo, type CSSProperties } from 'react';
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
import type { IamMenuNode } from '@tetap/schema/iam';
import { ConfirmActionButton } from './confirm-action-button.js';

type MenusSectionProps = {
  canManageIam: boolean;
  isMutating: boolean;
  menus: IamMenuNode[];
  onCreate: () => void;
  onDelete: (menu: IamMenuNode) => void;
};

export const MenusSection = memo(function MenusSection({
  canManageIam,
  isMutating,
  menus,
  onCreate,
  onDelete,
}: MenusSectionProps) {
  const t = useAdminT();
  const flattenedMenus = useMemo(() => flattenIamMenuTree(menus), [menus]);

  return (
    <section className="grid min-w-0 gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{t('webAdmin.iam.tables.menusTitle')}</CardTitle>
              <CardDescription>{t('webAdmin.iam.tables.menusDescription')}</CardDescription>
            </div>
            <Button disabled={isMutating || !canManageIam} onClick={onCreate} type="button">
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
              {flattenedMenus.map(menu => (
                <MenuRow
                  canManageIam={canManageIam}
                  isMutating={isMutating}
                  key={menu.id}
                  menu={menu}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
});

type MenuRowProps = {
  canManageIam: boolean;
  isMutating: boolean;
  menu: IamMenuNode & { depth: number };
  onDelete: (menu: IamMenuNode) => void;
};

const MenuRow = memo(function MenuRow({ canManageIam, isMutating, menu, onDelete }: MenuRowProps) {
  const t = useAdminT();
  const indentationStyle = useMemo<CSSProperties>(() => ({ paddingInlineStart: `${menu.depth * 16}px` }), [menu.depth]);
  const deleteMenu = useCallback(() => {
    onDelete(menu);
  }, [menu, onDelete]);

  return (
    <TableRow>
      <TableCell>
        <span style={indentationStyle}>{menu.name}</span>
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
          onConfirm={deleteMenu}
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

const flattenIamMenuTree = (menus: IamMenuNode[], depth = 0): (IamMenuNode & { depth: number })[] =>
  menus.flatMap(menu => [{ ...menu, depth }, ...flattenIamMenuTree(menu.children, depth + 1)]);
