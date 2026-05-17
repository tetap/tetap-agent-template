import type { IamCreatePolicyRequest, IamCreateRoleRequest, IamMenuNode, IamPolicy } from '@tetap/schema/iam';
import type {
  DataScopeTypeInput,
  FieldPermissionTypeInput,
  PermissionTypeInput,
  PolicyEffectInput,
  RoleEditorState,
  RoleItem,
} from './types.js';

export const parseCsv = (value: string) =>
  value.split(',').flatMap(item => {
    const trimmed = item.trim();

    return trimmed ? [trimmed] : [];
  });

export const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export const flattenIamMenus = (menu: IamMenuNode): IamMenuNode[] => [menu, ...menu.children.flatMap(flattenIamMenus)];

export const parsePolicyConditions = (value: string) => JSON.parse(value) as IamCreatePolicyRequest['conditions'];

export const stringifyPolicyConditions = (conditions: IamPolicy['conditions']) => JSON.stringify(conditions);

export const toPermissionType = (value: string): PermissionTypeInput =>
  ['MENU', 'API', 'BUTTON', 'FIELD', 'DATA'].includes(value) ? (value as PermissionTypeInput) : 'API';

export const toPolicyEffect = (value: string): PolicyEffectInput => (value === 'DENY' ? 'DENY' : 'ALLOW');

export const toFieldPermissionType = (value: string): FieldPermissionTypeInput =>
  ['HIDE', 'MASK', 'READONLY', 'READWRITE'].includes(value) ? (value as FieldPermissionTypeInput) : 'MASK';

export const toDataScopeType = (value: string): DataScopeTypeInput =>
  ['ALL', 'DEPT', 'DEPT_AND_CHILD', 'SELF', 'CUSTOM'].includes(value) ? (value as DataScopeTypeInput) : 'SELF';

export const emptyRoleEditorState = (): RoleEditorState => ({
  code: '',
  dataScopeType: 'DEPT_AND_CHILD',
  deptIds: '',
  description: '',
  name: '',
  permissionCodes: '',
});

export const roleToEditorState = (role: RoleItem): RoleEditorState => ({
  code: role.code,
  dataScopeType: role.dataScope.type,
  deptIds: role.dataScope.deptIds?.join(', ') ?? '',
  description: role.description ?? '',
  name: role.name,
  permissionCodes: role.permissionCodes.join(', '),
});

export const roleEditorToPayload = (form: RoleEditorState): IamCreateRoleRequest => {
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

export const dataScopeLabels = {
  ALL: 'webAdmin.iam.dataScopes.all',
  CUSTOM: 'webAdmin.iam.dataScopes.custom',
  DEPT: 'webAdmin.iam.dataScopes.dept',
  DEPT_AND_CHILD: 'webAdmin.iam.dataScopes.deptAndChild',
  SELF: 'webAdmin.iam.dataScopes.self',
} as const;

export const permissionTypeOptions: { label: PermissionTypeInput; value: PermissionTypeInput }[] = [
  { label: 'API', value: 'API' },
  { label: 'MENU', value: 'MENU' },
  { label: 'BUTTON', value: 'BUTTON' },
  { label: 'FIELD', value: 'FIELD' },
  { label: 'DATA', value: 'DATA' },
];

export const fieldPermissionTypeOptions: { label: FieldPermissionTypeInput; value: FieldPermissionTypeInput }[] = [
  { label: 'HIDE', value: 'HIDE' },
  { label: 'MASK', value: 'MASK' },
  { label: 'READONLY', value: 'READONLY' },
  { label: 'READWRITE', value: 'READWRITE' },
];

export const policyEffectOptions: { label: PolicyEffectInput; value: PolicyEffectInput }[] = [
  { label: 'ALLOW', value: 'ALLOW' },
  { label: 'DENY', value: 'DENY' },
];

export const dataScopeOptions: { label: string; value: DataScopeTypeInput }[] = [
  { label: dataScopeLabels.ALL, value: 'ALL' },
  { label: dataScopeLabels.CUSTOM, value: 'CUSTOM' },
  { label: dataScopeLabels.DEPT, value: 'DEPT' },
  { label: dataScopeLabels.DEPT_AND_CHILD, value: 'DEPT_AND_CHILD' },
  { label: dataScopeLabels.SELF, value: 'SELF' },
];
