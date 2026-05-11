# packages/schema Architecture

## 定位

`@tetap/schema` 是 schema-first contract package，使用 Zod 管理前后端 request、response、entity 和 form contract。

## 公开入口

| Export                     | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `@tetap/schema`            | common schema helpers、统一响应 helper。                       |
| `@tetap/schema/backend`    | backend endpoint response schemas。                            |
| `@tetap/schema/form`       | form schema/helper exports。                                   |
| `@tetap/schema/user`       | user entity/mutation schemas。                                 |
| `@tetap/schema/admin-auth` | admin auth/session form schemas。                              |
| `@tetap/schema/iam`        | IAM auth、capability、policy、session、operation-log schemas。 |

## 统一响应契约

所有 backend response 使用：

```ts
{
  code: number;
  message: string;
  data: unknown;
}
```

使用 `createApiResponseSchema(dataSchema)` 为每个 endpoint 构造 response schema。Services 层在发送前校验 response body。

## Contract Flow

```mermaid
flowchart LR
  Schema[Define Zod schema\n@tetap/schema] --> Backend[Backend service parse/validate]
  Schema --> Web[Frontend form/API validation]
  Backend --> Response[Validate {code,message,data}]
  Web --> Submit[Submit safe request]
```

## 规则

- 新 endpoint 先定义 request/response schema，再写 service。
- 表单提交前必须使用 schema 校验。
- 不在 apps 中写临时 Zod schema。
- 跨 package 的 schema 同时 export schema 和 `z.input` / `z.output` 类型。
- 后台登录、OTP 和 session-user 表单使用 `admin-auth` schemas；后台账号通过管理员创建，不提供公开注册或找回密码入口。
- IAM API、权限码、字段权限、策略、前台在线会话和操作日志响应使用 `iam` schemas。
- schema 错误文案不要硬编码到业务逻辑；需要用户展示时通过 i18n 处理。

## 影响测试

- 修改 `packages/schema/**` 后运行 `pnpm test:unit:target -- schema-response`。
- response contract 影响 backend runtime 时运行 `pnpm test:smoke:target -- backend-health`。
