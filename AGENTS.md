# Agent Operating Guide

本文件是代理在本仓库工作的**规则入口**。它不重复所有细节，只提供必须遵守的高优先级约束、执行顺序和深入文档链接。修改代码或文档前，先按任务类型打开对应链接。

## 1. 工作入口

| 需要了解                       | 入口                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 项目定位、启动、脚本、全局规则 | [README.md](README.md)                                                                                                           |
| 逻辑架构总览和模块设计         | [docs/Logical Architecture Diagram/README.md](docs/Logical%20Architecture%20Diagram/README.md)                                   |
| 工作区边界和依赖方向           | [docs/Logical Architecture Diagram/01-workspace-boundaries.md](docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md) |
| 质量门禁、测试、构建规则       | [docs/Logical Architecture Diagram/02-quality-gates.md](docs/Logical%20Architecture%20Diagram/02-quality-gates.md)               |
| 多步骤计划与 todolist 记忆     | [docs/memory/plan-workflow.md](docs/memory/plan-workflow.md)                                                                     |
| 测试策略与定向测试记忆         | [docs/memory/testing-workflow.md](docs/memory/testing-workflow.md)                                                               |

## 2. 标准执行流程

1. **读取上下文**：先查看本文件、根 README、相关架构文档和目标 workspace README。
2. **同步计划**：凡是多步骤任务，必须在 `docs/todolists` 创建或更新 checkbox 执行计划。
3. **最小变更**：只改与任务直接相关的文件，不顺手重构无关模块。
4. **遵守边界**：apps 只做 runtime/feature composition，跨切面能力放入 `packages/*`。
5. **先定向验证**：开发中优先跑 `pnpm test:affected` 或 `pnpm test:*:target`。
6. **最终收口**：修改文件后执行 `pnpm lint:fix`、`pnpm format:fix`，再跑相关校验。
7. **关闭计划**：任务完成后关闭对应 todolist，记录验证命令和结果。

## 3. 约束索引

| 类别         | 硬性规则                                                                                                       | 深入文档                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| I18n         | 站点、前端和后端用户可见文案必须来自 scoped `@tetap/i18n/*`；先改 `zh-CN`，再保持其他 locale 同 key。          | [README.zh-CN.md#i18n-规则](README.zh-CN.md#i18n-规则)、[packages-i18n.md](docs/Logical%20Architecture%20Diagram/packages-i18n.md)                   |
| UI           | 前端 UI 只能复用 `@tetap/ui` 中的 shadcn/ui 组件；不要在 app 内创建本地 UI 系统或业务 CSS。                    | [README.zh-CN.md#ui-规则](README.zh-CN.md#ui-规则)、[packages-ui.md](docs/Logical%20Architecture%20Diagram/packages-ui.md)                           |
| Config       | env 和框架配置必须通过 `@tetap/config`；不要在 app/package 内新增本地 `.env`。                                 | [README.zh-CN.md#config-规则](README.zh-CN.md#config-规则)、[packages-config.md](docs/Logical%20Architecture%20Diagram/packages-config.md)           |
| Backend      | Fastify route 只能注册路由；所有逻辑、校验、响应体构造必须进入 services 层；后台管理接口只进 `backend-admin`。 | [README.zh-CN.md#backend-规则](README.zh-CN.md#backend-规则)、[apps-backend.md](docs/Logical%20Architecture%20Diagram/apps-backend.md)               |
| IAM          | 权限、会话、策略、字段和数据权限算法进入 `@tetap/iam`；后端通过 hook/policy engine 做最终校验。                | [README.zh-CN.md#iam-规则](README.zh-CN.md#iam-规则)、[packages-iam.md](docs/Logical%20Architecture%20Diagram/packages-iam.md)                       |
| Schema       | 前后端 request/response/form schema 必须放在 `@tetap/schema` 并使用 Zod。                                      | [README.zh-CN.md#schema-规则](README.zh-CN.md#schema-规则)、[packages-schema.md](docs/Logical%20Architecture%20Diagram/packages-schema.md)           |
| Database     | Prisma schema/client 只能通过 `@tetap/prisma` 管理；一个 model 一个 `.prisma` 文件。                           | [README.zh-CN.md#database-规则](README.zh-CN.md#database-规则)、[packages-prisma.md](docs/Logical%20Architecture%20Diagram/packages-prisma.md)       |
| Hooks        | 自定义 React hooks 只能放在 `packages/hooks/src/store`。                                                       | [README.zh-CN.md#hooks-规则](README.zh-CN.md#hooks-规则)、[packages-hooks.md](docs/Logical%20Architecture%20Diagram/packages-hooks.md)               |
| Dependencies | React、React DOM、TypeScript、Zod、RHF、resolver 版本由根目录统一控制。                                        | [README.zh-CN.md#dependency-规则](README.zh-CN.md#dependency-规则)                                                                                   |
| Testing      | 功能完成必须考虑单元、Browser Mode UI、冒烟和影响映射；自动化测试统一用 Vitest。                               | [README.zh-CN.md#testing-规则](README.zh-CN.md#testing-规则)、[testing-workflow.md](docs/memory/testing-workflow.md)                                 |
| Planning     | 每个多步骤计划都要同步 `docs/todolists`，完成后关闭。                                                          | [README.zh-CN.md#planning-规则](README.zh-CN.md#planning-规则)、[plan-workflow.md](docs/memory/plan-workflow.md)                                     |
| TypeScript   | TypeScript 错误不得交付；最终至少通过 `pnpm check`。                                                           | [README.zh-CN.md#typescript-门禁](README.zh-CN.md#typescript-门禁)、[02-quality-gates.md](docs/Logical%20Architecture%20Diagram/02-quality-gates.md) |
| Release      | 生产 build 会统一 bump 版本；版本 bump 必须独立提交和 tag。                                                    | [README.zh-CN.md#release-规则](README.zh-CN.md#release-规则)                                                                                         |

## 4. Workspace 设计文档

| Workspace            | 文档                                                                                 | 一句话职责                                                       |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `apps/site`          | [apps-site.md](docs/Logical%20Architecture%20Diagram/apps-site.md)                   | VitePress 宣传/文档站 runtime 和静态页面组合。                   |
| `apps/web`           | [apps-web.md](docs/Logical%20Architecture%20Diagram/apps-web.md)                     | React + Vite 浏览器 runtime、路由和页面组合。                    |
| `apps/web-admin`     | [apps-web-admin.md](docs/Logical%20Architecture%20Diagram/apps-web-admin.md)         | 后台管理专用 React + Vite runtime 和 admin pages。               |
| `apps/backend`       | [apps-backend.md](docs/Logical%20Architecture%20Diagram/apps-backend.md)             | 公共 Fastify runtime、plugins、routes registration 和 services。 |
| `apps/backend-admin` | [apps-backend-admin.md](docs/Logical%20Architecture%20Diagram/apps-backend-admin.md) | 后台管理专用 Fastify runtime 和 admin APIs。                     |
| `packages/config`    | [packages-config.md](docs/Logical%20Architecture%20Diagram/packages-config.md)       | 统一 env、typed runtime config、Vite/Node 配置入口。             |
| `packages/hooks`     | [packages-hooks.md](docs/Logical%20Architecture%20Diagram/packages-hooks.md)         | React hooks 与表单 helper 集中仓库。                             |
| `packages/i18n`      | [packages-i18n.md](docs/Logical%20Architecture%20Diagram/packages-i18n.md)           | locale 资源、翻译核心、site/React/Node helper。                  |
| `packages/iam`       | [packages-iam.md](docs/Logical%20Architecture%20Diagram/packages-iam.md)             | IAM 权限、会话、策略、字段、数据和审计核心。                     |
| `packages/prisma`    | [packages-prisma.md](docs/Logical%20Architecture%20Diagram/packages-prisma.md)       | Prisma schema 拆分规则、生成和 DB 脚本。                         |
| `packages/schema`    | [packages-schema.md](docs/Logical%20Architecture%20Diagram/packages-schema.md)       | 前后端共享 Zod 契约。                                            |
| `packages/ui`        | [packages-ui.md](docs/Logical%20Architecture%20Diagram/packages-ui.md)               | shadcn/ui 共享组件库、设计系统样式和品牌资产。                   |
| `test/automation`    | [test-automation.md](docs/Logical%20Architecture%20Diagram/test-automation.md)       | Vitest 单元、Browser Mode UI、冒烟和定向测试。                   |

## 5. 常用验证命令

```sh
pnpm lint:fix
pnpm format:fix
pnpm check
pnpm i18n:boundaries:check
pnpm test:affected
pnpm test:browser
pnpm test:smoke
pnpm --filter @tetap/test-automation build
```

## 6. 禁止事项

- 不要在 `apps/*` 中复制 UI、hooks、config、schema、i18n、database 逻辑。
- `apps/site` 只能作为 VitePress 宣传/文档站，文案走 `@tetap/i18n/site`，样式限制在 VitePress theme runtime。
- 不要在业务 service 或 route 中手写权限算法；复用 `@tetap/iam`、auth hook 和 policy helper。
- 不要在 Fastify route 中写业务逻辑、schema parse、响应体拼装或错误码选择。
- 不要在公共 `apps/backend` 中实现后台管理接口；admin APIs 必须进入 `apps/backend-admin`。
- 不要在公共 `apps/web` 中实现后台管理页面；admin pages 必须进入 `apps/web-admin`。
- `pnpm backend:architecture:check` 会阻止公共 `apps/backend` 出现 admin API 文件或 `/admin` 路由。
- 不要新增 app-local `.env` 或绕过 `@tetap/config` 读取环境变量。
- 不要在 app/package 中安装根目录统一控制的依赖版本。
- 不要绕过 `pnpm check`、`pnpm lint`、`pnpm backend:architecture:check` 或 smoke gate 交付。
- 不要把功能修改和 release version bump 混在同一个提交中。
