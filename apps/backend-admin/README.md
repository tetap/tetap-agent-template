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

`GET /iam/overview` is intentionally lightweight. It only returns dashboard count metrics; users, roles, permissions, menus, sessions, policies, fields, and operation logs are loaded by their own feature APIs. Operation logs are fetched through the paged `GET /iam/operation-logs?page=&pageSize=&search=&sort=` endpoint.

`POST /auth/login` maps credential failures to explicit unified responses instead of falling through to a generic server error: `40102` for an invalid username or password, `40302` for disabled admin accounts, and `40303` for locked admin accounts.

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

Online-session routes only manage real frontend user sessions. Admin sessions are private auth infrastructure and are not returned by online-user APIs.

## IAM Persistence

`src/shared/iam-service.ts` loads users, roles, permissions, menus, field permissions, policies, sessions, token blacklist entries, and operation logs from `@tetap/prisma`. Runtime startup does not create demo administrators or fallback IAM rows. If the database has no active super administrator, the service fails fast so setup problems are visible before exposing admin APIs.

Initial administrators must be created through an explicit bootstrap or controlled database setup process. Use:

```sh
IAM_BOOTSTRAP_ADMIN_PASSWORD='replace-with-a-strong-password' pnpm backend-admin:bootstrap
```

The command writes baseline IAM permissions, the system menu tree, roles, policies, field rules, and one ACTIVE super administrator into the configured database. Default login identifier is `admin` / `admin@tetap.local`; the password is the environment value above. Test-only IAM fixtures live under `test/automation/src/fixtures` and are injected by tests only.

## Route Permission Metadata

IAM routes declare backend-enforced permissions through Fastify route config:

| Resource                 | Required Permission              |
| ------------------------ | -------------------------------- |
| Overview                 | `iam:read`                       |
| Users                    | `user:read`, `user:update`       |
| Roles                    | `role:read`, `role:update`       |
| Permissions              | `iam:read`, `iam:manage`         |
| Menus                    | `menu:read`, `iam:manage`        |
| Field permissions        | `field:read`, `iam:manage`       |
| Policies                 | `policy:read`, `policy:update`   |
| Frontend online sessions | `session:read`, `session:revoke` |
| Operation logs           | `operation-log:read`             |

## Operation Logs

`src/plugins/operation-log.ts` records every non-health, non-OPTIONS backend-admin operation through `@tetap/iam.recordOperation`. Each record includes operator, operation item, operation detail, operation time, operation IP, resource, and result. IAM services add domain-specific operation logs for overview reads, mutations, policy denials, and forced-offline actions.

## Security Baseline

- `@fastify/helmet`, `@fastify/cors`, and `@fastify/rate-limit` are registered globally.
- `BODY_LIMIT_BYTES`, rate limit, CORS origins, auth secrets, and token TTLs come from `@tetap/config`.
- Request logs redact authorization, cookie, password, token, access-token, and refresh-token fields.
- Auth middleware validates bearer tokens with session state, token id, token version, route permission metadata, and super-admin bypass.
- SSRF/upload utility helpers live in `src/shared/security.ts` and share the backend security unit coverage.

## Scripts

```sh
pnpm --filter backend-admin dev
IAM_BOOTSTRAP_ADMIN_PASSWORD='replace-with-a-strong-password' pnpm backend-admin:bootstrap
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
