# @tetap/iam

`@tetap/iam` owns reusable IAM engines for authentication, session state, RBAC, ABAC/PBAC policy decisions, field policies, data scopes, and audit redaction.

## Production Behavior

- User, role, permission, menu, field-permission, and policy mutation APIs enforce uniqueness and protected-resource checks.
- Role and permission code changes update dependent in-memory relationships so route capabilities and menu filtering stay consistent.
- User security changes increment token version and revoke active sessions.
- PBAC decisions default to deny when no allow policy matches.
- IAM mutations emit redacted audit events through the same audit pipeline as auth/session events.

## Boundaries

- Fastify apps register plugins and routes.
- `@tetap/schema` owns HTTP request/response contracts.
- `@tetap/prisma` owns persistence models.
- `@tetap/iam` owns pure authorization/session/audit behavior that can be unit tested without HTTP or a database.

## Scripts

```sh
pnpm --filter @tetap/iam type-check
pnpm --filter @tetap/iam lint
pnpm --filter @tetap/iam build
```
