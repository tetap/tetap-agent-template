# apps/backend-admin Architecture

## 定位

`apps/backend-admin` 是后台管理专用 Fastify 服务。所有后台管理接口必须在此服务端实现，公共用户 API 留在 `apps/backend`。当前管理端 IAM API 包括登录、刷新、退出、当前用户、权限总览、用户/角色/权限码、菜单、字段权限、策略、前台在线会话、强制下线和操作日志。

## 服务边界

| Service              | Owns                                                                         | Must Not Own                 |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| `apps/backend`       | Public/user-facing API runtime and public service workflows.                 | Admin management APIs.       |
| `apps/backend-admin` | Admin management API runtime, admin service workflows, admin smoke coverage. | Public API responsibilities. |

## 分层

```mermaid
flowchart TD
  Main[src/main.ts\nload env + listen admin port] --> App[src/app.ts\nbuild Fastify]
  App --> Plugins[src/plugins/*\ni18n / security / error handler / operation log]
  App --> Routes[src/routes/*\nadmin registration only]
  Routes --> Services[src/services/*\nadmin logic + schema + response]
  Services --> Schema[@tetap/schema]
  Services --> I18n[@tetap/i18n/backend-admin]
  Services --> IAM[@tetap/iam]
  Services --> Prisma[@tetap/prisma]
```

## Runtime Config

`backend-admin` 使用 `@tetap/config` 中的专用监听配置：

| Env                  | Purpose                    | Default             |
| -------------------- | -------------------------- | ------------------- |
| `BACKEND_ADMIN_HOST` | Admin service listen host. | `HOST` or `0.0.0.0` |
| `BACKEND_ADMIN_PORT` | Admin service listen port. | `3001`              |

## Route 规则

Admin route 与 public backend route 使用同一套严格规则：

- Route 文件只注册 method、path、options 和 imported service handler。
- Route 文件不做业务逻辑、schema parse、响应体拼装、错误码选择、env 读取或 i18n 调用。
- 所有 request/response contract 先定义在 `@tetap/schema`。
- Services 层负责 admin 业务逻辑、schema validation 和 unified response。

## 统一响应

Admin API 同样返回：

```ts
{
  code: number;
  message: string;
  data: unknown;
}
```

Admin 文案使用 `@tetap/i18n/backend-admin` 中的 `backendAdmin.*` key。

登录失败也必须走统一响应和 i18n 文案：账号或密码错误返回 `40102`，禁用账号返回 `40302`，锁定账号返回 `40303`，不得把 IAM credential failure 泄漏成 `500`。

## IAM 与安全

- Auth plugin 默认保护非 public route。
- Protected route 通过 `config.auth.permission` 声明权限码。
- `/auth/login` 和 `/auth/refresh` 是显式 public route。
- 在线会话和 token id 由 `@tetap/iam` 管理，强制下线会让旧 token 返回 `40101`。
- IAM 数据从 `@tetap/prisma` 持久化层加载；运行时不创建 demo/fallback 管理员、菜单、权限或策略。
- 在线用户只包含真实前台用户会话；后台管理员 session 不进入在线用户表格或强制下线列表。
- Operation-log plugin 记录每个非 health、非 OPTIONS 后端操作的操作人、事项、详情、时间和 IP。
- Fastify runtime 启用 body limit、helmet、CORS allowlist、rate-limit 和日志脱敏。
- 如果数据库中没有 ACTIVE super admin，后台服务启动会失败；初始管理员必须通过 `IAM_BOOTSTRAP_ADMIN_PASSWORD='replace-with-a-strong-password' pnpm backend-admin:bootstrap` 显式写入数据库。

## 扩展流程

1. 在 `@tetap/schema` 定义 admin request/response schema。
2. 在 `apps/backend-admin/src/services` 实现管理端业务逻辑。
3. 在 `apps/backend-admin/src/routes` 注册 thin route。
4. 如涉及数据库，通过 `@tetap/prisma` 边界访问。
5. 增加或更新 `test/automation/src/smoke` 下的 admin smoke。
6. 更新 `test/automation/src/support/test-selection.ts` 的 affected mapping。

## 常用命令

```sh
pnpm --filter backend-admin dev
IAM_BOOTSTRAP_ADMIN_PASSWORD='replace-with-a-strong-password' pnpm backend-admin:bootstrap
pnpm --filter backend-admin type-check
pnpm --filter backend-admin build
pnpm backend:architecture:check
pnpm test:smoke:target -- backend-admin-health
pnpm test:smoke:target -- backend-admin-iam
```
