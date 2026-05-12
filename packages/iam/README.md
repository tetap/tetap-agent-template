# @tetap/iam

`@tetap/iam` owns reusable IAM engines for authentication, admin session state, frontend online-session state, RBAC, ABAC/PBAC policy decisions, field policies, data scopes, and operation-log redaction.

## Production Behavior

- Admin users and frontend users are separate data domains; online-user APIs only expose frontend user sessions.
- User, role, permission, menu, field-permission, and policy mutation APIs enforce uniqueness and protected-resource checks.
- Role and permission code changes update dependent relationships so route capabilities and menu filtering stay consistent.
- Admin user security changes increment token version and revoke admin sessions without exposing them as online users.
- PBAC decisions default to deny when no allow policy matches.
- IAM mutations, auth events, permission denials, and backend lifecycle hooks emit redacted operation logs.
- Runtime data is supplied by the backend Prisma adapter. Tests may inject explicit fixtures from `test/automation`; the package does not export runtime demo data.

## Public Tools And Methods

| Export / Method                                                                    | Purpose                                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `IamService`                                                                       | Pure IAM engine for auth, RBAC, menus, field policy, data policy, PBAC, sessions, and operation logs.                                |
| `IamPersistenceAdapter`                                                            | Optional adapter contract used by backend runtimes to persist IAM mutations, sessions, token blacklists, and operation logs.         |
| `users` / `roles` / `permissions` / `policies` / `fieldPermissions` / `operations` | Read-only sorted/sanitized collections for admin services.                                                                           |
| `createUser` / `updateUser` / `deleteUser`                                         | Admin-user management with uniqueness, role validation, protected super-admin guard, token-version invalidation, and operation logs. |
| `createRole` / `updateRole` / `deleteRole`                                         | Role management with permission validation, dependent user/menu updates, and protected resource checks.                              |
| `createPermission` / `updatePermission` / `deletePermission`                       | Permission-code management with dependent role/menu updates.                                                                         |
| `createMenu` / `updateMenu` / `deleteMenu`                                         | Dynamic menu management with parent validation and tree cleanup.                                                                     |
| `createFieldPermission` / `updateFieldPermission` / `deleteFieldPermission`        | Field permission management for hide/mask/readonly/readwrite rules.                                                                  |
| `createPolicy` / `updatePolicy` / `deletePolicy`                                   | ABAC/PBAC policy management with enabled flag and condition validation.                                                              |
| `login` / `refresh` / `logout`                                                     | Issue and rotate JWT token pairs with token id and session checks.                                                                   |
| `verifyAccessToken`                                                                | Resolve admin auth context, session state, roles, and capabilities.                                                                  |
| `findUserByUsername` / `getUserById` / `verifyPassword`                            | Admin-user lookup and password validation helpers for auth services.                                                                 |
| `getRolesForUser` / `getCapabilitiesForUser` / `can`                               | RBAC resolution and permission checks.                                                                                               |
| `getMenuTree`                                                                      | Filter dynamic admin menus from backend capability decisions.                                                                        |
| `getFieldRulesForUser` / `applyFieldPermissions`                                   | Resolve field rules and hide/mask fields before returning data.                                                                      |
| `getDataConstraint` / `buildDataConstraint`                                        | Convert data-scope policy into Prisma-compatible `where` fragments.                                                                  |
| `evaluatePolicy`                                                                   | Evaluate ABAC/PBAC conditions with default-deny behavior.                                                                            |
| `listSessions`                                                                     | Return real frontend online sessions only; admin sessions remain private auth infrastructure.                                        |
| `revokeSession` / `revokeUserSessions`                                             | Force frontend users offline and blacklist token ids.                                                                                |
| `recordOperation`                                                                  | Record redacted operation logs with operator, item, detail, time, IP.                                                                |
| `hashPassword`                                                                     | Deterministic password hashing helper used by controlled bootstrap and tests.                                                        |
| `normalizeBearerToken`                                                             | Parse HTTP `Authorization: Bearer ...` headers.                                                                                      |
| `redactSensitive`                                                                  | Recursively redact password/token/secret/id-card/phone-like fields.                                                                  |
| `maskField`                                                                        | Built-in field masking for phone, identity/id-card, email, and generic values.                                                       |
| `signJwt` / `verifyJwt`                                                            | HMAC JWT helpers used by the IAM engine.                                                                                             |

## Current Types

The package exports IAM entity and contract types for users, frontend users, roles, permissions, menus, menu nodes, field permissions, data scopes, policies, sessions, operation logs, JWT payloads, login/token results, and create/update mutation inputs.

## Boundaries

- Fastify apps register plugins and routes.
- `@tetap/schema` owns HTTP request/response contracts.
- `@tetap/prisma` owns persistence models.
- `@tetap/iam` owns pure authorization, session, operation-log, field-policy, data-policy, and policy-engine behavior that can be unit tested without HTTP or a database.

## Scripts

```sh
pnpm --filter @tetap/iam type-check
pnpm --filter @tetap/iam lint
pnpm --filter @tetap/iam build
```
