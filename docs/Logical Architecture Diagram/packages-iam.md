# packages/iam Architecture

## 定位

`@tetap/iam` 是权限基础设施核心包。它只包含可复用、可单元测试的纯 TypeScript IAM 逻辑，不注册 HTTP route，不读取 env，不访问数据库。

## 拥有能力

- JWT HMAC sign/verify helper。
- Stateful session manager、token id、token version、clock-aware expiry、forced-offline invalidation、token blacklist cleanup。
- Admin user sessions and frontend user online sessions are separate; online-user management only exposes real frontend sessions。
- RBAC capability resolution and route permission checks。
- Dynamic menu filtering。
- Field permission filtering and masking。
- Data-scope query constraint builder。
- ABAC/PBAC policy condition evaluation。
- Operation-log creation and sensitive-field redaction。
- Optional persistence adapter contract for backend runtimes to store mutations, sessions, token blacklist entries, and operation logs without coupling this package to Prisma。

## 主要公开方法

| Method Group                                                                                          | Capability                                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `login` / `refresh` / `logout` / `verifyAccessToken`                                                  | JWT + stateful session lifecycle with token id and token version checks.             |
| `createUser` / `updateUser` / `deleteUser`                                                            | Admin-user management, uniqueness, protected super-admin checks, token invalidation. |
| `createRole` / `updateRole` / `deleteRole`                                                            | Role management, permission-code validation, dependent relationship updates.         |
| `createPermission` / `updatePermission` / `deletePermission`                                          | Permission-code lifecycle and dependent role/menu rewrites.                          |
| `createMenu` / `updateMenu` / `deleteMenu` / `getMenuTree`                                            | Dynamic menu management and capability filtering.                                    |
| `createFieldPermission` / `updateFieldPermission` / `deleteFieldPermission` / `applyFieldPermissions` | Field policy management and backend response masking/hiding.                         |
| `createPolicy` / `updatePolicy` / `deletePolicy` / `evaluatePolicy`                                   | ABAC/PBAC management and default-deny policy evaluation.                             |
| `listSessions` / `revokeSession` / `revokeUserSessions`                                               | Frontend online-session listing and forced-offline behavior.                         |
| `recordOperation` / `redactSensitive` / `maskField`                                                   | Operation logging, sensitive-data redaction, and field masking.                      |

## 边界

| Layer                | Responsibility                                                                |
| -------------------- | ----------------------------------------------------------------------------- |
| `@tetap/iam`         | Pure IAM engines and optional persistence adapter contract.                   |
| `@tetap/schema`      | IAM HTTP request/response Zod contracts.                                      |
| `@tetap/prisma`      | IAM persistence models.                                                       |
| `apps/backend-admin` | Admin IAM routes, services, Prisma adapter, auth plugin, and API enforcement. |
| `apps/web-admin`     | Admin IAM UI composition and backend-admin API client.                        |

## 规则

- 业务 service 不直接实现权限算法；调用 `@tetap/iam` 或 app auth/policy helpers。
- Route 权限必须通过 Fastify route config metadata 声明。
- 前端 capability 只用于 UI 提示，后端必须再次校验。
- 字段权限必须后端裁剪或脱敏，不依赖前端隐藏。
- Token 失效必须基于 session/token id/token version，而不是纯无状态 JWT。

## 验证

```sh
pnpm --filter @tetap/iam type-check
pnpm test:unit:target -- iam-engine
pnpm test:smoke:target -- backend-admin-iam
```
