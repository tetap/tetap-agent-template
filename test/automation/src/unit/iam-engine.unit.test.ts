import { IamService, redactSensitive } from '@tetap/iam';
import { describe, expect, it } from 'vitest';
import { createIamTestFixtureData } from '../fixtures/iam.js';

const createService = () =>
  new IamService(createIamTestFixtureData('unit-salt'), {
    accessTokenSecret: 'unit-access-secret',
    refreshTokenSecret: 'unit-refresh-secret',
    passwordSalt: 'unit-salt',
  });

const createClockedService = (nowRef: { current: Date }, ttl: { access: number; refresh: number }) =>
  new IamService(createIamTestFixtureData('unit-salt'), {
    accessTokenSecret: 'unit-access-secret',
    refreshTokenSecret: 'unit-refresh-secret',
    passwordSalt: 'unit-salt',
    accessTokenTtlSeconds: ttl.access,
    refreshTokenTtlSeconds: ttl.refresh,
    now: () => nowRef.current,
  });

describe('IAM engines', () => {
  it('signs in, resolves capabilities, and keeps admin sessions out of online users', async () => {
    const iam = createService();
    const login = await iam.login({
      username: 'admin',
      password: 'password1',
      deviceType: 'WEB',
      ip: '127.0.0.1',
      userAgent: 'vitest',
    });

    expect(login.capabilities).toContain('session:revoke');
    await expect(iam.verifyAccessToken(login.accessToken)).resolves.toMatchObject({
      user: { username: 'admin' },
    });

    expect(iam.listSessions()).toEqual([]);

    await iam.logout(login.accessToken);
    await expect(iam.verifyAccessToken(login.accessToken)).rejects.toThrow();
  });

  it('uses the service clock for token and session expiry checks', async () => {
    const nowRef = { current: new Date('2026-01-01T00:00:00.000Z') };
    const iam = createClockedService(nowRef, { access: 120, refresh: 60 });
    const login = await iam.login({
      username: 'admin',
      password: 'password1',
      deviceType: 'WEB',
    });

    await expect(iam.verifyAccessToken(login.accessToken)).resolves.toMatchObject({
      session: { status: 'ONLINE' },
    });

    nowRef.current = new Date('2026-01-01T00:01:01.000Z');

    await expect(iam.verifyAccessToken(login.accessToken)).rejects.toThrow('Session expired.');
    await expect(iam.refresh(login.refreshToken)).rejects.toThrow('Token expired.');
  });

  it('applies field policies and data constraints for scoped roles', async () => {
    const iam = createService();
    const login = await iam.login({
      username: 'auditor',
      password: 'password1',
    });
    const actor = iam.getUserById(login.user.id);

    expect(actor).toBeDefined();

    const filteredUser = iam.applyFieldPermissions(actor!, 'user', {
      id: '99',
      email: 'sensitive@example.com',
      phone: '13800008888',
      idCard: '440100199001011234',
    });

    expect(filteredUser.email).toBe('se***@example.com');
    expect(filteredUser.phone).toBe('138****8888');
    expect(filteredUser).not.toHaveProperty('idCard');
    expect(iam.getDataConstraint(actor!, 'user')).toEqual({
      scope: 'DEPT_AND_CHILD',
      where: { deptId: { in: ['200', '201'] } },
    });
  });

  it('defaults policy decisions to deny unless an allow policy matches', async () => {
    const iam = createService();
    const login = await iam.login({
      username: 'auditor',
      password: 'password1',
    });
    const actor = iam.getUserById(login.user.id);

    expect(actor).toBeDefined();
    expect(iam.evaluatePolicy(actor!, 'session', 'revoke').allowed).toBe(true);
    expect(iam.evaluatePolicy(actor!, 'policy', 'update', {}, { riskLevel: 'high' }).allowed).toBe(false);
    expect(iam.evaluatePolicy(actor!, 'unknown', 'write').allowed).toBe(false);
  });

  it('mutates users, roles, permissions, field permissions, and policies with operation trails', async () => {
    const iam = createService();
    const permission = await iam.createPermission({
      code: 'report:read',
      name: 'Read reports',
      type: 'API',
      resource: 'report',
      action: 'read',
    });
    const role = await iam.createRole({
      name: 'Report Auditor',
      code: 'report-auditor',
      permissionCodes: [permission.code],
      dataScope: { type: 'SELF' },
    });
    const user = await iam.createUser({
      username: 'reporter',
      email: 'reporter@example.com',
      password: 'password1',
      roleCodes: [role.code],
    });
    const storedUser = iam.getUserById(user.id);

    expect(storedUser).toBeDefined();
    expect(iam.getCapabilitiesForUser(storedUser!)).toContain('report:read');

    const fieldPermission = await iam.createFieldPermission({
      roleCode: role.code,
      resource: 'user',
      fieldName: 'email',
      permissionType: 'MASK',
    });
    const policy = await iam.createPolicy({
      resource: 'report',
      action: 'read',
      effect: 'ALLOW',
      conditions: {
        any: [{ source: 'user', path: 'roleCodes', operator: 'contains', value: role.code }],
      },
    });

    expect(iam.evaluatePolicy(storedUser!, 'report', 'read').allowed).toBe(true);
    await expect(iam.deleteRole(role.id)).rejects.toThrow();

    await iam.deleteUser(user.id);
    await iam.deleteFieldPermission(fieldPermission.id);
    await iam.deletePolicy(policy.id);
    expect(iam.operations.some(event => event.operation === 'IAM_MUTATION' && event.resource === 'user')).toBe(true);
  });

  it('redacts sensitive operation detail recursively', () => {
    expect(
      redactSensitive({
        password: 'secret',
        profile: {
          phone: '13800008888',
          safe: 'visible',
        },
      }),
    ).toEqual({
      password: '[REDACTED]',
      profile: {
        phone: '[REDACTED]',
        safe: 'visible',
      },
    });
  });
});
