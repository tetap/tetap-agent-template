# apps/backend Architecture

## 定位

`apps/backend` 是 Fastify HTTP runtime。它负责插件注册、安全中间件、统一错误处理、路由注册和 services 层业务编排。项目只需要 Fastify，不引入 tRPC。

## 分层

```mermaid
flowchart TD
  Main[src/main.ts\nload env + start] --> App[src/app.ts\nbuild Fastify]
  App --> Plugins[src/plugins/*\ni18n / security / error handler]
  App --> Routes[src/routes/*\nregistration only]
  Routes --> Services[src/services/*\nlogic + schema + response]
  Services --> Schema[@tetap/schema]
  Services --> I18n[@tetap/i18n/backend]
  Services --> IAM[@tetap/iam]
  Services --> Shared[src/shared/*\nerror code / response / security]
```

## 内部结构

| Path                           | Responsibility                                              |
| ------------------------------ | ----------------------------------------------------------- |
| `src/main.ts`                  | 调用 `loadConfigEnv`，读取 typed env，启动 server。         |
| `src/app.ts`                   | 创建 Fastify instance，注册 CORS、helmet、plugins、routes。 |
| `src/plugins/i18n.ts`          | 基于 request 解析 locale，写入 request context。            |
| `src/plugins/security.ts`      | 安全请求验证中间件。                                        |
| `src/plugins/error-handler.ts` | 统一错误转换为 `{ code, message, data }`。                  |
| `src/routes/*`                 | 只注册路由，禁止任何业务逻辑。                              |
| `src/services/*`               | 业务逻辑、schema parse/validate、响应体构造。               |
| `src/shared/*`                 | ErrorCode、AppError、API response helper、安全工具。        |

## Route 规则

Route 文件只能包含：

- Fastify route registration。
- method、url/path、options。
- 从 services 导入的 handler。

Route 文件禁止：

- 读取 request body/query/params 并做逻辑处理。
- 调用 `@tetap/schema` parse/validate。
- 拼装 `{ code, message, data }`。
- 选择错误码或抛出业务错误。
- 调用 i18n、读取 env、访问数据库、计算签名或时间窗口。
- 写 if/switch/map/filter/reduce 等业务分支。

## Services 规则

Services 层负责：

- 解析和验证 request input。
- 调用业务/domain/helper。
- 决定错误码和 `AppError`。
- 组装并校验统一响应体。
- 必要时通过 `@tetap/prisma` 访问数据库。

## 统一响应体

所有 API response 使用：

```ts
{
  code: number;
  message: string;
  data: unknown;
}
```

错误信息必须通过 `@tetap/i18n/backend` 或统一 response helper 返回本地化文案；`@tetap/i18n/node` 只用于解析 request locale。

## 安全中间件

安全中间件负责 request-level 安全验证。新增安全策略时：

1. 在 `src/shared/security.ts` 或 plugin 中实现可测试逻辑。
2. 错误码进入 `src/shared/error-code.ts`。
3. 错误文案进入 `@tetap/i18n`。
4. routes 不感知安全细节。
5. 增加 unit/smoke 测试。

当前基座包含 helmet、CORS allowlist、rate-limit、body limit、HMAC request signature、auth hook、日志脱敏、SSRF helper 和上传 allowlist helper。

## 常用命令

```sh
pnpm --filter backend dev
pnpm --filter backend type-check
pnpm --filter backend build
pnpm backend:architecture:check
pnpm test:smoke:target -- backend-health
```
