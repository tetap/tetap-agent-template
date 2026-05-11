# packages/iam Architecture

## 定位

`@tetap/iam` 是权限基础设施核心包。它只包含可复用、可单元测试的纯 TypeScript IAM 逻辑，不注册 HTTP route，不读取 env，不访问数据库。

## 拥有能力

- JWT HMAC sign/verify helper。
- Stateful session manager、token id、token version、forced-offline invalidation。
- RBAC capability resolution and route permission checks。
- Dynamic menu filtering。
- Field permission filtering and masking。
- Data-scope query constraint builder。
- ABAC/PBAC policy condition evaluation。
- Audit event creation and sensitive-field redaction。

## 边界

| Layer                | Responsibility                                                |
| -------------------- | ------------------------------------------------------------- |
| `@tetap/iam`         | Pure IAM engines and demo/in-memory service for local smoke.  |
| `@tetap/schema`      | IAM HTTP request/response Zod contracts.                      |
| `@tetap/prisma`      | IAM persistence models.                                       |
| `apps/backend-admin` | Admin IAM routes, services, auth plugin, and API enforcement. |
| `apps/web-admin`     | Admin IAM UI composition and backend-admin API client.        |

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
