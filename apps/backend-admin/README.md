# apps/backend-admin

`apps/backend-admin` 是后台管理专用 Fastify 服务。所有后台管理接口、管理端聚合逻辑和后台安全策略都必须在这个服务端实现，不放入公共 `apps/backend`。

## Architecture Links

- [Root README](../../README.md)
- [Agent Operating Guide](../../AGENTS.md)
- [apps/backend-admin Architecture](../../docs/Logical%20Architecture%20Diagram/apps-backend-admin.md)
- [Quality Gates](../../docs/Logical%20Architecture%20Diagram/02-quality-gates.md)

## Owns

- Admin Fastify app creation and startup。
- Admin management API route registration。
- Admin services for management workflows。
- Admin security middleware and unified error handling。
- Admin health/runtime smoke coverage。

## Must Not Own

- Public user-facing API responsibilities that belong to `apps/backend`。
- Zod contract definitions outside `@tetap/schema`。
- Prisma schema outside `@tetap/prisma`。
- Route-level business logic。
- App-local env loading outside `@tetap/config/node`。

## Internal Structure

| Path             | Responsibility                                            |
| ---------------- | --------------------------------------------------------- |
| `src/main.ts`    | Load shared env and start the admin Fastify service.      |
| `src/app.ts`     | Build and compose the admin Fastify instance.             |
| `src/plugins/*`  | Admin request lifecycle middleware.                       |
| `src/routes/*`   | Admin route registration only.                            |
| `src/services/*` | Admin input/output schema validation and orchestration.   |
| `src/shared/*`   | Admin backend shared errors, responses, security helpers. |

## IAM Management APIs

All IAM APIs are protected by the admin auth hook and route permission metadata. Routes stay registration-only; request parsing, response validation, policy checks, and operation-log decisions live in `src/services/iam.ts` and `src/plugins/operation-log.ts`.

```text
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

GET    /iam/overview
GET    /iam/users
POST   /iam/users
PATCH  /iam/users/:userId
DELETE /iam/users/:userId
GET    /iam/roles
POST   /iam/roles
PATCH  /iam/roles/:roleId
DELETE /iam/roles/:roleId
GET    /iam/permissions
POST   /iam/permissions
PATCH  /iam/permissions/:permissionId
DELETE /iam/permissions/:permissionId
GET    /iam/menus
POST   /iam/menus
PATCH  /iam/menus/:menuId
DELETE /iam/menus/:menuId
GET    /iam/field-permissions
POST   /iam/field-permissions
PATCH  /iam/field-permissions/:fieldPermissionId
DELETE /iam/field-permissions/:fieldPermissionId
GET    /iam/policies
POST   /iam/policies
PATCH  /iam/policies/:policyId
DELETE /iam/policies/:policyId
GET    /iam/sessions
POST   /iam/sessions/:sessionId/revoke
POST   /iam/users/:userId/revoke-sessions
GET    /iam/operation-logs
```

Online-session routes only manage frontend user sessions. Admin sessions are private auth infrastructure and are not returned by online-user APIs.

## Local Demo Account

When `ENABLE_DEMO_SEED=true`, the in-memory IAM seed includes one local administrator:

```text
Email: admin@tetap.local
Username: admin
Password: password1
```

Production deployments must create admin users through controlled admin workflows and must replace all demo secrets in `packages/config/env`.

## Route Permission Metadata

IAM routes declare backend-enforced permissions through Fastify route config:

| Resource                    | Required Permission                    |
| --------------------------- | -------------------------------------- |
| Overview and operation logs | `iam:read`                             |
| Users                       | `user:read`, `user:update`             |
| Roles                       | `role:read`, `role:update`             |
| Permissions                 | `permission:read`, `permission:update` |
| Menus                       | `menu:read`, `menu:update`             |
| Field permissions           | `field:read`, `field:update`           |
| Policies                    | `policy:read`, `policy:update`         |
| Frontend online sessions    | `session:read`, `session:revoke`       |

## Operation Logs

`src/plugins/operation-log.ts` records every non-health, non-OPTIONS backend-admin operation through `@tetap/iam.recordOperation`. Each record includes operator, operation item, operation detail, operation time, operation IP, resource, and result. IAM services add domain-specific operation logs for overview reads, mutations, policy denials, and forced-offline actions.

## Security Baseline

- `@fastify/helmet`, `@fastify/cors`, and `@fastify/rate-limit` are registered globally.
- `BODY_LIMIT_BYTES`, rate limit, CORS origins, auth secrets, token TTLs, and demo seed toggles come from `@tetap/config`.
- Request logs redact authorization, cookie, password, token, access-token, and refresh-token fields.
- Auth middleware validates bearer tokens with session state, token id, token version, route permission metadata, and super-admin bypass.
- SSRF/upload utility helpers live in `src/shared/security.ts` and share the backend security unit coverage.

## Scripts

```sh
pnpm --filter backend-admin dev
pnpm --filter backend-admin type-check
pnpm --filter backend-admin lint
pnpm --filter backend-admin build
pnpm --filter backend-admin start
pnpm backend:architecture:check
```

## Validation

- Route boundary: `pnpm backend:architecture:check`。
- Admin runtime smoke: `pnpm test:smoke:target -- backend-admin-health`。
- Full handoff: `pnpm check`。
