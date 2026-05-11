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

All IAM APIs are protected by the admin auth hook and route permission metadata. Routes stay registration-only; request parsing, response validation, policy checks, and audit decisions live in `src/services/iam.ts`.

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
GET    /iam/audit-logs
```

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
