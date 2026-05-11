<p align="center">
  <img src="docs/assets/tetap-logo.svg" width="112" height="112" alt="TETAP logo" />
</p>

# TETAP Agent Template

<p align="center">
  Open-source enterprise full-stack monorepo for AI-assisted development with React, Fastify, TypeScript, IAM, scoped i18n, Prisma, and automated quality gates.
</p>

<p align="center">
  <a href="#简体中文">简体中文</a> ·
  <a href="#english">English</a> ·
  <a href="#한국어">한국어</a> ·
  <a href="#日本語">日本語</a>
</p>

## 简体中文

TETAP Agent Template 是一个面向 AI-assisted / Vibe Coding 的开源全栈 monorepo 模板。它把前端、后台管理端、Fastify API、IAM 权限基础设施、配置、UI、i18n、schema、Prisma 和自动化测试拆成清晰的 workspace，让团队在快速迭代时仍然保留强约束、可测试和可演进的架构边界。

### 核心能力

- **企业级 IAM 基础设施**：JWT、RBAC、PBAC、字段权限、动态菜单、会话失效、强制下线和审计基础能力。
- **前后端契约优先**：request、response、form schema 统一进入 `@tetap/schema`，基于 Zod 复用。
- **多端 i18n 隔离**：public web、admin web、backend、backend-admin 使用不同 i18n scope，避免前端读取后端文案 key。
- **共享 UI 系统**：前端应用只消费 `@tetap/ui` 中的 shadcn/ui 组件和品牌资产。
- **安全默认值**：Fastify 安全插件、CORS 白名单、body limit、rate limit、统一错误响应和 route 架构检查。
- **自动化质量门禁**：TypeScript、ESLint、Prettier、架构检查、单元测试、Browser Mode 测试和 smoke 测试。
- **代理友好工作流**：`AGENTS.md`、架构文档、todolist 记忆和测试影响映射共同约束多步骤协作。

### 快速开始

```sh
pnpm install
pnpm dev
```

常用命令：

```sh
pnpm check
pnpm lint
pnpm format
pnpm test:affected
pnpm test:browser
pnpm test:smoke
```

生产构建：

```sh
pnpm build
```

> `pnpm build` 会先运行 `pnpm check`，再执行版本 bump，最后通过 Turbo 构建所有 workspace。生产构建前应先提交功能代码，避免把版本 bump 混入功能提交。

### Workspace 总览

| Workspace            | 类型    | 职责                                                          | 设计文档                                                                             |
| -------------------- | ------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/web`           | App     | React + Vite 浏览器 runtime、React Router、页面组合。         | [apps-web.md](docs/Logical%20Architecture%20Diagram/apps-web.md)                     |
| `apps/web-admin`     | App     | 后台管理专用 React + Vite runtime 和 admin pages。            | [apps-web-admin.md](docs/Logical%20Architecture%20Diagram/apps-web-admin.md)         |
| `apps/backend`       | App     | 公共 Fastify runtime、plugins、route registration、services。 | [apps-backend.md](docs/Logical%20Architecture%20Diagram/apps-backend.md)             |
| `apps/backend-admin` | App     | 后台管理专用 Fastify runtime 和 admin APIs。                  | [apps-backend-admin.md](docs/Logical%20Architecture%20Diagram/apps-backend-admin.md) |
| `packages/config`    | Package | env 文件位置、typed env、Node/Vite 配置入口。                 | [packages-config.md](docs/Logical%20Architecture%20Diagram/packages-config.md)       |
| `packages/hooks`     | Package | React hooks 和表单 helper 集中仓库。                          | [packages-hooks.md](docs/Logical%20Architecture%20Diagram/packages-hooks.md)         |
| `packages/i18n`      | Package | locale 资源、翻译核心、React/Node helper。                    | [packages-i18n.md](docs/Logical%20Architecture%20Diagram/packages-i18n.md)           |
| `packages/iam`       | Package | IAM 权限、会话、策略、字段、数据和审计核心。                  | [packages-iam.md](docs/Logical%20Architecture%20Diagram/packages-iam.md)             |
| `packages/prisma`    | Package | Prisma schema 拆分、校验、生成和 DB 命令。                    | [packages-prisma.md](docs/Logical%20Architecture%20Diagram/packages-prisma.md)       |
| `packages/schema`    | Package | Zod request/response/entity/form 契约。                       | [packages-schema.md](docs/Logical%20Architecture%20Diagram/packages-schema.md)       |
| `packages/ui`        | Package | shadcn/ui 组件库、设计系统样式和品牌 SVG。                    | [packages-ui.md](docs/Logical%20Architecture%20Diagram/packages-ui.md)               |
| `test/automation`    | Test    | Vitest 单元、Browser Mode UI、冒烟、定向测试。                | [test-automation.md](docs/Logical%20Architecture%20Diagram/test-automation.md)       |

### 逻辑架构

```mermaid
flowchart LR
  User[User / Browser] --> Web[apps/web]
  AdminUser[Admin / Browser] --> WebAdmin[apps/web-admin]
  Web --> UI[packages/ui]
  Web --> Hooks[packages/hooks]
  Web --> I18n[packages/i18n]
  Web --> Schema[packages/schema]
  Web --> Config[packages/config]
  Web --> Backend[apps/backend]
  WebAdmin --> UI
  WebAdmin --> Hooks
  WebAdmin --> I18n
  WebAdmin --> Schema
  WebAdmin --> Config
  WebAdmin --> BackendAdmin[apps/backend-admin]
  Backend --> IAM[packages/iam]
  BackendAdmin --> IAM
  Backend --> Config
  Backend --> I18n
  Backend --> Schema
  Backend --> Prisma[packages/prisma]
  BackendAdmin --> Config
  BackendAdmin --> I18n
  BackendAdmin --> Schema
  BackendAdmin --> Prisma
  Prisma --> DB[(Database)]
  Tests[test/automation] --> Web
  Tests --> WebAdmin
  Tests --> Backend
  Tests --> BackendAdmin
  Tests --> Config
  Tests --> Schema
  Tests --> UI
```

### 文档地图

| 文档                                                                                                                             | 用途                                            |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                                                                                           | 代理执行规则索引、约束入口和常用验证流程。      |
| [docs/Logical Architecture Diagram/README.md](docs/Logical%20Architecture%20Diagram/README.md)                                   | 逻辑架构总览、模块设计文档入口。                |
| [docs/Logical Architecture Diagram/00-system-overview.md](docs/Logical%20Architecture%20Diagram/00-system-overview.md)           | 系统运行流、设计原则和主要场景。                |
| [docs/Logical Architecture Diagram/01-workspace-boundaries.md](docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md) | workspace 边界、依赖方向和禁止事项。            |
| [docs/Logical Architecture Diagram/02-quality-gates.md](docs/Logical%20Architecture%20Diagram/02-quality-gates.md)               | 质量门禁、测试策略、构建和交付规则。            |
| [docs/memory/plan-workflow.md](docs/memory/plan-workflow.md)                                                                     | 多步骤计划必须同步 todolist 的长期记忆。        |
| [docs/memory/testing-workflow.md](docs/memory/testing-workflow.md)                                                               | 功能实现后的单元、Browser、冒烟和定向测试记忆。 |
| [docs/todolists](docs/todolists)                                                                                                 | 每个计划任务的 checkbox 执行记录。              |

### 脚本索引

| 命令                                    | 说明                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`                              | 通过 Turbo 启动开发任务。                                                     |
| `pnpm check`                            | 版本约束、hooks 位置、i18n 边界、后端架构检查、Turbo type-check、unit tests。 |
| `pnpm build`                            | 先 `pnpm check`，再版本 bump，最后 `turbo build`。                            |
| `pnpm type-check`                       | 运行所有 workspace 的 TypeScript 检查。                                       |
| `pnpm lint` / `pnpm lint:fix`           | 运行或自动修复 ESLint，并包含版本/hooks/backend 架构检查。                    |
| `pnpm format` / `pnpm format:fix`       | 检查或格式化全仓库文件。                                                      |
| `pnpm test`                             | 运行测试包的 unit、browser、smoke。                                           |
| `pnpm test:unit`                        | 运行 Vitest 单元测试。                                                        |
| `pnpm test:browser`                     | 运行 Vitest Browser Mode UI 功能测试。                                        |
| `pnpm test:smoke`                       | 运行 runtime 冒烟测试。                                                       |
| `pnpm test:affected`                    | 按 git 变更文件推断并运行受影响测试。                                         |
| `pnpm test:target -- <type> <target>`   | 按测试类型和模块运行定向测试。                                                |
| `pnpm versions:check`                   | 检查 React、TypeScript、Zod 等根版本约束。                                    |
| `pnpm hooks:check`                      | 检查 custom hooks 是否只在 `packages/hooks/src/store`。                       |
| `pnpm i18n:boundaries:check`            | 检查 web/admin/backend 只能导入允许的 i18n scope。                            |
| `pnpm backend:architecture:check`       | 检查 Fastify routes 是否保持 registration-only。                              |
| `pnpm db:generate` / `pnpm db:validate` | 生成或校验 Prisma Client 与 schema。                                          |
| `pnpm db:push` / `pnpm db:studio`       | 推送数据库 schema 或打开 Prisma Studio。                                      |
| `pnpm clean`                            | 清理构建缓存和产物。                                                          |

### 开源协作

- Issue：用于 bug、改进建议、安全风险和文档问题。
- Pull Request：请保持变更聚焦，并在 PR 描述中说明验证命令。
- 安全问题：不要在公开 issue 中贴出密钥、token、数据库连接串或漏洞利用细节。
- License：本项目使用 [MIT License](LICENSE)。

### 规则

#### UI 规则

- 前端应用必须通过 `@tetap/ui` 使用共享 shadcn/ui 组件和品牌资产。
- 新增或更新 UI 组件必须放在 `packages/ui`，优先从 shadcn/ui MCP、shadcn CLI 或 shadcn skill 获取。
- 业务页面不要手写硬编码 `className`、业务 CSS 文件或自定义样式系统。
- 允许的 CSS 仅限框架或 shadcn/ui 生成的基础主题/运行时 CSS。

#### I18n 规则

- 前后端所有用户可见文案必须通过 `@tetap/i18n` 获取。
- `apps/web` 只能使用 `@tetap/i18n/public`。
- `apps/web-admin` 只能使用 `@tetap/i18n/admin`。
- `apps/backend` 只能使用 `@tetap/i18n/backend` 输出文案。
- `apps/backend-admin` 只能使用 `@tetap/i18n/backend-admin` 输出文案。
- 新增文案先维护 `zh-CN.ts`，再保持其他 locale 文件同 key 结构。
- 使用完整句子插值，例如 `t('validation.required', { field })`，不要拼接翻译片段。
- 修改导入边界后运行 `pnpm i18n:boundaries:check`。

#### Config 规则

- 所有 env 配置必须经过 `@tetap/config`。
- Vite apps 使用 `configEnvDir` from `@tetap/config/vite`。
- Node.js services 在读取 env 前调用 `loadConfigEnv` from `@tetap/config/node`。
- 不要在 `apps/*` 或其他 `packages/*` 新增本地 `.env`。

#### Backend 规则

- `apps/backend/src/routes` 和 `apps/backend-admin/src/routes` 只能做路由注册。
- 所有后台管理接口必须通过 `apps/backend-admin` 实现，不放入公共 `apps/backend`。
- `pnpm backend:architecture:check` 会阻止公共 `apps/backend` 出现 admin API 文件或 `/admin` 路由。
- Route 文件禁止业务逻辑、分支判断、入参解析、响应体拼装、错误码选择、数据库访问、env 读取或 i18n 调用。
- 所有逻辑、编排、校验、错误处理决策和响应体构造必须在 services 层。
- 后端统一返回 `{ code, message, data }`。
- 新增 route 必须声明 schema、auth/public policy 和必要 permission metadata。

#### IAM 规则

- 权限、会话、策略、字段权限、数据权限和审计核心算法统一进入 `@tetap/iam`。
- HTTP request/response contract 仍然先定义在 `@tetap/schema`。
- 持久化模型只能通过 `@tetap/prisma` 维护。
- 前端 capability 只能决定 UI 显示，后端 auth hook/policy engine 必须做最终校验。
- 字段级权限必须在后端裁剪或脱敏后再返回。
- Token 必须可失效：JWT 需要 token id、session 状态和 token version 共同校验。

#### Schema 规则

- 前后端交互 schema 必须统一放在 `@tetap/schema`，并基于 Zod。
- 前端表单提交前必须使用 Zod schema 校验。
- 后端 services 必须使用 `@tetap/schema` parse/validate request，并校验 response body。
- 不要在页面、组件、route 或 service 中重复写临时 schema。

#### Database 规则

- 数据库 schema 和 client 访问必须通过 `@tetap/prisma`。
- `packages/prisma/schema/schema.prisma` 只能包含 datasource/generator，不放 model。
- 每个 Prisma model 独立一个 `.prisma` 文件。
- 数据库命令使用根脚本：`pnpm db:generate`、`pnpm db:validate`、`pnpm db:push`、`pnpm db:studio`。

#### Hooks 规则

- 所有 custom React hooks 必须放在 `packages/hooks/src/store`。
- 不要在 app/package 内创建本地 `hooks` 目录或本地 `use*.ts(x)`。
- 使用 hooks 时从 `@tetap/hooks`、`@tetap/hooks/store` 或 `@tetap/hooks/*` 导入。
- 新增或移动 hooks 后运行 `pnpm hooks:check`。

#### Dependency 规则

- `react`、`react-dom`、`typescript` 只能由根 `package.json` 安装和控制。
- `zod`、`react-hook-form`、`@hookform/resolvers` 也由根版本和 `pnpm.overrides` 锁定。
- Workspace 如需声明 peer dependency，版本必须与根版本完全一致。
- 修改依赖后运行 `pnpm versions:check`。

#### Testing 规则

- 自动化测试统一放在 `test/automation`，使用 Vitest。
- 单元测试放在 `test/automation/src/unit`。
- UI 功能测试必须使用 Vitest Browser Mode，放在 `test/automation/src/browser`。
- 冒烟测试放在 `test/automation/src/smoke`，设计记录在 `test/automation/SMOKE_TEST_DESIGN.md`。
- 开发中优先运行 `pnpm test:affected` 或相关 `pnpm test:*:target`。
- 新增模块、测试或影响关系时，必须更新 `test/automation/src/support/test-selection.ts`。
- 根 `pnpm build` 必须包含 smoke gate；冒烟不通过，build 不算成功。

#### Planning 规则

- 多步骤计划必须同步 `docs/todolists` 下的 checkbox 执行计划。
- 执行前先搜索是否已有相关 todolist，避免重复。
- 计划状态变化时同步更新 todolist。
- 完成后设置 `Status: Closed`，添加关闭日期和 closure notes。

#### TypeScript 门禁

- TypeScript 错误不得交付。
- 最终至少通过 `pnpm check`，或在明确范围内通过相关 workspace 的 `type-check` 并说明原因。
- 不要使用 `any` 或类型断言绕过契约问题；应修正 schema、类型或调用边界。

#### Release 规则

- 生产 build 会统一 bump 版本。
- 版本 bump 必须独立提交和 tag，不要和功能修改混在同一个提交中。
- 发布前必须确认 `pnpm check`、`pnpm test:smoke` 和必要的 Browser Mode 测试通过。

---

## English

TETAP Agent Template is an open-source full-stack monorepo template for AI-assisted development. It separates public web, admin web, Fastify APIs, IAM, configuration, UI, i18n, schemas, Prisma, and automation tests into explicit workspaces so teams can move quickly without losing architectural control.

### Highlights

- Enterprise IAM foundation: JWT, RBAC, PBAC, field permissions, dynamic menus, session invalidation, forced logout, and audit primitives.
- Contract-first development with shared Zod schemas in `@tetap/schema`.
- Scoped i18n for public web, admin web, public backend, and backend-admin.
- Shared shadcn/ui component system and SVG brand assets in `@tetap/ui`.
- Fastify security baseline with CORS, body limits, rate limits, typed config, and consistent error responses.
- Built-in quality gates: TypeScript, ESLint, Prettier, architecture checks, unit tests, Browser Mode tests, and smoke tests.

### Quick Start

```sh
pnpm install
pnpm dev
```

Useful commands:

```sh
pnpm check
pnpm test:affected
pnpm test:browser
pnpm test:smoke
pnpm build
```

### Project Layout

| Workspace            | Responsibility                                           |
| -------------------- | -------------------------------------------------------- |
| `apps/web`           | Public React + Vite application runtime.                 |
| `apps/web-admin`     | Admin React + Vite application runtime.                  |
| `apps/backend`       | Public Fastify API runtime.                              |
| `apps/backend-admin` | Admin Fastify API runtime.                               |
| `packages/config`    | Typed env and framework config entrypoints.              |
| `packages/i18n`      | Locale resources, translators, and scoped providers.     |
| `packages/iam`       | IAM engines for auth, permissions, policies, and audit.  |
| `packages/schema`    | Shared Zod contracts.                                    |
| `packages/prisma`    | Prisma schema and database scripts.                      |
| `packages/ui`        | Shared shadcn/ui components, runtime CSS, and brand SVG. |
| `packages/hooks`     | Shared React hooks and form helpers.                     |
| `test/automation`    | Unit, Browser Mode, smoke, and targeted test automation. |

### Contributing

Read [AGENTS.md](AGENTS.md) and the [architecture docs](docs/Logical%20Architecture%20Diagram/README.md) before opening a pull request. Keep changes focused, update schemas and docs with code changes, and include the validation commands you ran. This project is released under the [MIT License](LICENSE).

---

## 한국어

TETAP Agent Template은 AI 보조 개발을 위한 오픈소스 풀스택 monorepo 템플릿입니다. public web, admin web, Fastify API, IAM, 설정, UI, i18n, schema, Prisma, 자동화 테스트를 명확한 workspace로 분리하여 빠른 개발과 엄격한 아키텍처 경계를 함께 유지합니다.

### 주요 기능

- 엔터프라이즈 IAM 기반: JWT, RBAC, PBAC, 필드 권한, 동적 메뉴, 세션 무효화, 강제 로그아웃, 감사 로그.
- `@tetap/schema` 기반의 Zod contract-first 개발.
- public web, admin web, backend, backend-admin을 위한 scope 분리 i18n.
- `@tetap/ui`에 포함된 공유 shadcn/ui 컴포넌트와 SVG 브랜드 자산.
- CORS, body limit, rate limit, typed config, 통일된 오류 응답을 포함한 Fastify 보안 기본값.
- TypeScript, ESLint, Prettier, 아키텍처 검사, unit test, Browser Mode test, smoke test 품질 게이트.

### 빠른 시작

```sh
pnpm install
pnpm dev
```

자주 사용하는 명령:

```sh
pnpm check
pnpm test:affected
pnpm test:browser
pnpm test:smoke
pnpm build
```

### Workspace

| Workspace            | 역할                                            |
| -------------------- | ----------------------------------------------- |
| `apps/web`           | Public React + Vite 애플리케이션 runtime.       |
| `apps/web-admin`     | Admin React + Vite 애플리케이션 runtime.        |
| `apps/backend`       | Public Fastify API runtime.                     |
| `apps/backend-admin` | Admin Fastify API runtime.                      |
| `packages/config`    | typed env와 framework config 진입점.            |
| `packages/i18n`      | locale resource, translator, scoped provider.   |
| `packages/iam`       | 인증, 권한, 정책, 감사 IAM engine.              |
| `packages/schema`    | 공유 Zod contract.                              |
| `packages/prisma`    | Prisma schema와 database script.                |
| `packages/ui`        | 공유 shadcn/ui 컴포넌트, runtime CSS, SVG 로고. |
| `packages/hooks`     | 공유 React hook과 form helper.                  |
| `test/automation`    | unit, Browser Mode, smoke, targeted test.       |

### 기여

PR을 만들기 전에 [AGENTS.md](AGENTS.md)와 [아키텍처 문서](docs/Logical%20Architecture%20Diagram/README.md)를 읽어 주세요. 변경 범위를 작게 유지하고, code/schema/docs를 함께 갱신하며, 실행한 검증 명령을 PR에 남겨 주세요. 라이선스는 [MIT License](LICENSE)입니다.

---

## 日本語

TETAP Agent Template は、AI 支援開発向けのオープンソース full-stack monorepo テンプレートです。public web、admin web、Fastify API、IAM、設定、UI、i18n、schema、Prisma、自動テストを明確な workspace に分割し、高速な開発と強いアーキテクチャ境界を両立します。

### 主な特徴

- エンタープライズ IAM 基盤: JWT、RBAC、PBAC、フィールド権限、動的メニュー、セッション失効、強制ログアウト、監査ログ。
- `@tetap/schema` による Zod contract-first 開発。
- public web、admin web、backend、backend-admin 向けの scoped i18n。
- `@tetap/ui` に集約された shadcn/ui コンポーネントと SVG ブランドアセット。
- CORS、body limit、rate limit、typed config、統一エラー応答を含む Fastify セキュリティ基盤。
- TypeScript、ESLint、Prettier、アーキテクチャ検査、unit test、Browser Mode test、smoke test の品質ゲート。

### クイックスタート

```sh
pnpm install
pnpm dev
```

よく使うコマンド:

```sh
pnpm check
pnpm test:affected
pnpm test:browser
pnpm test:smoke
pnpm build
```

### Workspace

| Workspace            | 役割                                                  |
| -------------------- | ----------------------------------------------------- |
| `apps/web`           | Public React + Vite application runtime.              |
| `apps/web-admin`     | Admin React + Vite application runtime.               |
| `apps/backend`       | Public Fastify API runtime.                           |
| `apps/backend-admin` | Admin Fastify API runtime.                            |
| `packages/config`    | typed env と framework config の入口。                |
| `packages/i18n`      | locale resources、translator、scoped provider。       |
| `packages/iam`       | auth、permission、policy、audit の IAM engine。       |
| `packages/schema`    | 共有 Zod contract。                                   |
| `packages/prisma`    | Prisma schema と database script。                    |
| `packages/ui`        | 共有 shadcn/ui components、runtime CSS、SVG logo。    |
| `packages/hooks`     | 共有 React hooks と form helpers。                    |
| `test/automation`    | unit、Browser Mode、smoke、targeted test automation。 |

### コントリビューション

Pull Request の前に [AGENTS.md](AGENTS.md) と [architecture docs](docs/Logical%20Architecture%20Diagram/README.md) を確認してください。変更範囲を小さく保ち、code/schema/docs を必要に応じて同時に更新し、実行した検証コマンドを PR に記載してください。このプロジェクトは [MIT License](LICENSE) で公開されています。
