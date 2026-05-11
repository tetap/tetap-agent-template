import { useEffect, useState } from 'react';
import { LogOut, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
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
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tetap/ui';
import {
  createIamFieldPermission,
  createIamPermission,
  createIamPolicy,
  createIamRole,
  createIamUser,
  deleteIamPolicy,
  deleteIamRole,
  deleteIamUser,
  fetchIamOverview,
  revokeIamSession,
  updateIamRole,
} from '../api/backend-admin.js';
import type { IamCreatePolicyRequest, IamOverviewData } from '@tetap/schema/iam';

type PermissionTypeInput = 'MENU' | 'API' | 'BUTTON' | 'FIELD' | 'DATA';
type PolicyEffectInput = 'ALLOW' | 'DENY';
type FieldPermissionTypeInput = 'HIDE' | 'MASK' | 'READONLY' | 'READWRITE';
type DataScopeTypeInput = 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM';

const parseCsv = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const parsePolicyConditions = (value: string) => JSON.parse(value) as IamCreatePolicyRequest['conditions'];

const toPermissionType = (value: string): PermissionTypeInput =>
  ['MENU', 'API', 'BUTTON', 'FIELD', 'DATA'].includes(value) ? (value as PermissionTypeInput) : 'API';

const toPolicyEffect = (value: string): PolicyEffectInput => (value === 'DENY' ? 'DENY' : 'ALLOW');

const toFieldPermissionType = (value: string): FieldPermissionTypeInput =>
  ['HIDE', 'MASK', 'READONLY', 'READWRITE'].includes(value) ? (value as FieldPermissionTypeInput) : 'MASK';

const toDataScopeType = (value: string): DataScopeTypeInput =>
  ['ALL', 'DEPT', 'DEPT_AND_CHILD', 'SELF', 'CUSTOM'].includes(value) ? (value as DataScopeTypeInput) : 'SELF';

export const AdminIamPage = () => {
  const t = useAdminT();
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const [overview, setOverview] = useState<IamOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    username: 'operator',
    email: 'operator@tetap.local',
    password: 'password1',
    roleCodes: 'security-auditor',
    deptId: '200',
  });
  const [roleForm, setRoleForm] = useState({
    name: 'Report Auditor',
    code: 'report-auditor',
    permissionCodes: 'iam:read,user:read,audit:read',
    dataScopeType: 'DEPT_AND_CHILD',
  });
  const [permissionForm, setPermissionForm] = useState({
    code: 'report:read',
    name: 'Read reports',
    type: 'API',
    resource: 'report',
    action: 'read',
  });
  const [fieldForm, setFieldForm] = useState({
    roleCode: 'security-auditor',
    resource: 'user',
    fieldName: 'email',
    permissionType: 'MASK',
  });
  const [policyForm, setPolicyForm] = useState({
    resource: 'report',
    action: 'read',
    effect: 'ALLOW',
    conditions: '{"any":[{"source":"user","path":"roleCodes","operator":"contains","value":"security-auditor"}]}',
  });

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

  const submitRole = () =>
    runMutation(token =>
      createIamRole(token, {
        name: roleForm.name,
        code: roleForm.code,
        permissionCodes: parseCsv(roleForm.permissionCodes),
        dataScope: { type: toDataScopeType(roleForm.dataScopeType) },
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
      <main className="flex flex-col gap-4" aria-labelledby="admin-iam-title">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4" aria-labelledby="admin-iam-title">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <Badge>{t('webAdmin.iam.badge')}</Badge>
            <h1 id="admin-iam-title" className="text-2xl font-semibold">
              {t('webAdmin.iam.title')}
            </h1>
            <p className="text-muted-foreground">{t('webAdmin.iam.description')}</p>
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
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t('webAdmin.iam.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="users">{t('webAdmin.iam.tabs.users')}</TabsTrigger>
            <TabsTrigger value="roles">{t('webAdmin.iam.tabs.roles')}</TabsTrigger>
            <TabsTrigger value="permissions">{t('webAdmin.iam.tabs.permissions')}</TabsTrigger>
            <TabsTrigger value="sessions">{t('webAdmin.iam.tabs.sessions')}</TabsTrigger>
            <TabsTrigger value="policy">{t('webAdmin.iam.tabs.policy')}</TabsTrigger>
          </TabsList>
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
                  <Button disabled={isMutating} onClick={() => void submitUser()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createUser')}
                  </Button>
                </CardFooter>
              </Card>
              <section className="grid gap-4">
                {overview.users.map(user => (
                  <Card key={user.id}>
                    <CardHeader>
                      <CardTitle>{user.username}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge>
                      {user.roleCodes.map(role => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button
                        disabled={isMutating || user.isSuperAdmin}
                        onClick={() => void runMutation(token => deleteIamUser(token, user.id))}
                        variant="outline">
                        <Trash2 data-icon="inline-start" />
                        {t('webAdmin.iam.actions.delete')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </section>
            </section>
          </TabsContent>
          <TabsContent value="roles">
            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('webAdmin.iam.forms.roleTitle')}</CardTitle>
                  <CardDescription>{t('webAdmin.iam.forms.roleDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <TextField
                      label={t('webAdmin.iam.fields.name')}
                      onChange={value => setRoleForm(current => ({ ...current, name: value }))}
                      value={roleForm.name}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.code')}
                      onChange={value => setRoleForm(current => ({ ...current, code: value }))}
                      value={roleForm.code}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.permissionCodes')}
                      onChange={value => setRoleForm(current => ({ ...current, permissionCodes: value }))}
                      value={roleForm.permissionCodes}
                    />
                    <TextField
                      label={t('webAdmin.iam.fields.dataScope')}
                      onChange={value => setRoleForm(current => ({ ...current, dataScopeType: value }))}
                      value={roleForm.dataScopeType}
                    />
                  </FieldGroup>
                </CardContent>
                <CardFooter>
                  <Button disabled={isMutating} onClick={() => void submitRole()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createRole')}
                  </Button>
                </CardFooter>
              </Card>
              {overview.roles.map(role => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="outline">{role.dataScope.type}</Badge>
                    {role.permissionCodes.map(permission => (
                      <Badge key={permission} variant="secondary">
                        {permission}
                      </Badge>
                    ))}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      disabled={isMutating}
                      onClick={() =>
                        void runMutation(token =>
                          updateIamRole(token, role.id, {
                            permissionCodes: uniqueStrings([...role.permissionCodes, permissionForm.code]),
                          }),
                        )
                      }
                      variant="outline">
                      <Plus data-icon="inline-start" />
                      {t('webAdmin.iam.actions.grantPermission')}
                    </Button>
                    <Button
                      disabled={isMutating || role.code === 'super-admin'}
                      onClick={() => void runMutation(token => deleteIamRole(token, role.id))}
                      variant="outline">
                      <Trash2 data-icon="inline-start" />
                      {t('webAdmin.iam.actions.delete')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </section>
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
                  <Button disabled={isMutating} onClick={() => void submitPermission()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createPermission')}
                  </Button>
                </CardFooter>
              </Card>
              <section className="grid gap-4">
                {overview.permissions.map(permission => (
                  <Card key={permission.id}>
                    <CardHeader>
                      <CardTitle>{permission.code}</CardTitle>
                      <CardDescription>{permission.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Badge>{permission.type}</Badge>
                      <Badge variant="secondary">{permission.resource}</Badge>
                      <Badge variant="outline">{permission.action}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </section>
            </section>
          </TabsContent>
          <TabsContent value="sessions">
            <section className="grid gap-4">
              {overview.sessions.length > 0 ? (
                overview.sessions.map(session => (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle>{session.userAgent}</CardTitle>
                      <CardDescription>{session.ip}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Badge>{session.status}</Badge>
                      <Badge variant="secondary">{session.deviceType}</Badge>
                      <Badge variant="outline">{session.lastActiveTime}</Badge>
                    </CardContent>
                    <CardFooter>
                      <Button
                        disabled={session.status !== 'ONLINE'}
                        onClick={() => void revokeSession(session.id)}
                        variant="outline">
                        <LogOut data-icon="inline-start" />
                        {t('webAdmin.iam.actions.revoke')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
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
          <TabsContent value="policy">
            <section className="grid gap-4 lg:grid-cols-2">
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
                  <Button disabled={isMutating} onClick={() => void submitFieldPermission()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createFieldPermission')}
                  </Button>
                </CardFooter>
              </Card>
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
                  <Button disabled={isMutating} onClick={() => void submitPolicy()}>
                    <Plus data-icon="inline-start" />
                    {t('webAdmin.iam.actions.createPolicy')}
                  </Button>
                </CardFooter>
              </Card>
              <PolicyCard
                description={t('webAdmin.iam.policy.fieldDescription')}
                items={overview.fieldPermissions.map(
                  item => `${item.roleCode}:${item.resource}.${item.fieldName}:${item.permissionType}`,
                )}
                title={t('webAdmin.iam.tabs.fields')}
              />
              <PolicyCard
                description={t('webAdmin.iam.policy.policyDescription')}
                items={overview.policies.map(item => `${item.effect}:${item.resource}:${item.action}`)}
                deleteLabel={t('webAdmin.iam.actions.delete')}
                onDelete={policyId => void runMutation(token => deleteIamPolicy(token, policyId))}
                rawItems={overview.policies.map(item => ({
                  id: item.id,
                  label: `${item.effect}:${item.resource}:${item.action}`,
                }))}
                title={t('webAdmin.iam.tabs.policies')}
              />
              <PolicyCard
                description={t('webAdmin.iam.policy.auditDescription')}
                items={overview.auditLogs.map(item => `${item.action}:${item.result}:${item.createdAt}`)}
                title={t('webAdmin.iam.tabs.audit')}
              />
            </section>
          </TabsContent>
        </Tabs>
      ) : null}
    </main>
  );
};

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardHeader>
      <CardTitle>{label}</CardTitle>
    </CardHeader>
    <CardContent className="text-2xl font-semibold">{value}</CardContent>
  </Card>
);

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
      <ul className="flex flex-col gap-2">
        {(rawItems ?? items.map(item => ({ id: item, label: item }))).map(item => (
          <li className="flex items-center justify-between gap-2" key={item.id}>
            <span className="truncate">{item.label}</span>
            {onDelete ? (
              <Button onClick={() => onDelete(item.id)} size="sm" variant="outline">
                <Trash2 data-icon="inline-start" />
                {deleteLabel}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
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
