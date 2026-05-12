# @tetap/prisma

`@tetap/prisma` 是 Prisma schema 和数据库脚本包，集中管理 schema 拆分规则、client generation、schema validation 和 DB 操作。

## Architecture Links

- [packages/prisma Architecture](../../docs/Logical%20Architecture%20Diagram/packages-prisma.md)
- [Database Rules](../../README.md#database-rules)

## Rules

- `schema/schema.prisma` contains datasource/generator only。
- One Prisma model per dedicated `.prisma` file。
- Do not introduce alternate ORMs or app-local SQL schema files。
- DB commands must be called through root scripts。
- IAM/admin identifiers use string IDs so backend tokens, menu trees, relation APIs, and Prisma records share one ID shape.

## Current Model Files

| File                                                          | Domain                                                           |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `admin_user.prisma`                                           | Backend-admin accounts, token version, roles.                    |
| `admin_user_session.prisma`                                   | Private admin login sessions.                                    |
| `user.prisma`                                                 | Frontend/public user accounts only.                              |
| `user_session.prisma`                                         | Frontend online sessions shown in admin UI.                      |
| `role.prisma` / `user_role.prisma` / `role_permission.prisma` | Admin RBAC roles and joins.                                      |
| `permission.prisma`                                           | Permission codes for API, menu, button, field, and data control. |
| `menu.prisma` / `menu_permission.prisma`                      | Dynamic admin menu tree and permission mapping.                  |
| `field_permission.prisma`                                     | Field hide/mask/readonly/readwrite rules.                        |
| `policy.prisma`                                               | ABAC/PBAC condition policies.                                    |
| `operation_log.prisma`                                        | Operator, operation item/detail/time/IP records.                 |
| `department.prisma`                                           | Department hierarchy for data scopes.                            |
| `token_blacklist.prisma`                                      | Revoked token ids with expiry.                                   |

Admin users and frontend users must not share tables. Online-user management refers to frontend sessions only; admin sessions remain in `admin_user_session.prisma`. Runtime IAM data is loaded from these models by backend Prisma adapters; no schema-level demo seed toggle exists.

Initial admin/IAM records are created only by explicit setup. After `pnpm db:push`, run `IAM_BOOTSTRAP_ADMIN_PASSWORD='replace-with-a-strong-password' pnpm backend-admin:bootstrap` to create/update baseline permissions, system menus, roles, policies, field rules, and the first ACTIVE super administrator in the configured database.

## Current Persistence Domains

| Domain                  | Models                                             | Notes                                                                  |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| Admin identity          | `AdminUser`, `AdminUserSession`                    | Admin auth/session infrastructure; not exposed by online-user APIs.    |
| Frontend identity       | `User`, `UserSession`                              | Public/frontend user records and sessions visible to online-user UI.   |
| RBAC                    | `Role`, `UserRole`, `Permission`, `RolePermission` | Permission types cover menu, API, button, field, and data permissions. |
| Dynamic menus           | `Menu`, `MenuPermission`                           | Tree menu and permission mapping for admin navigation.                 |
| Field/data/policy       | `FieldPermission`, `Policy`, `Department`          | Field masking/hiding, ABAC/PBAC, and department hierarchy.             |
| Session invalidation    | `TokenBlacklist`                                   | Revoked token ids with expiry for forced-offline behavior.             |
| Operation observability | `OperationLog`                                     | Operator, operation item/detail/time/IP, resource, result.             |

## Scripts

| Command                                  | Purpose                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm db:schema:check`                   | Verify one-model-per-file schema structure.                                |
| `pnpm db:generate`                       | Run schema check and generate Prisma Client from `packages/prisma/schema`. |
| `pnpm db:validate`                       | Run schema check and `prisma validate`.                                    |
| `pnpm db:push`                           | Push schema to the configured database.                                    |
| `pnpm db:studio`                         | Open Prisma Studio with shared env files.                                  |
| `pnpm backend-admin:bootstrap`           | Create/update baseline IAM data and the first super administrator.         |
| `pnpm --filter @tetap/prisma type-check` | Type-check package-level TypeScript wrappers.                              |
| `pnpm --filter @tetap/prisma lint`       | Lint Prisma package scripts and helpers.                                   |
