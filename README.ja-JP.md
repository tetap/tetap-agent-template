<p align="center">
  <img src="docs/assets/tetap-logo.svg" width="112" height="112" alt="TETAP logo" />
</p>

# TETAP Agent Template

<p align="center">
  React、Fastify、TypeScript、IAM、scoped i18n、Prisma、自動品質ゲートを備えた AI 支援開発向けのオープンソース enterprise full-stack monorepo です。
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ko-KR.md">한국어</a>
</p>

## 概要

TETAP Agent Template は、AI 支援開発向けのオープンソース full-stack monorepo テンプレートです。Public web、admin web、Fastify API、IAM、設定、UI、i18n、schema、Prisma、自動テストを明確な workspace に分割し、高速な開発と強いアーキテクチャ境界を両立します。

## 主な特徴

- **エンタープライズ IAM 基盤**: JWT、RBAC、PBAC、フィールド権限、動的メニュー、永続化セッション、トークン blacklist、強制ログアウト、操作ログ。
- **Contract-first 開発**: request、response、form schema を `@tetap/schema` に集約し、Zod で再利用します。
- **Scoped i18n**: public web、admin web、backend、backend-admin が別々の i18n entrypoint を使用します。
- **Public promotional web**: `apps/web` がシンプルな promotional landing page と将来の user-facing pages の React runtime を担当します。
- **共有 UI システム**: app は `@tetap/ui` の shadcn/ui components と brand assets を組み合わせます。
- **安全なデフォルト**: Fastify security plugins、CORS allowlist、body limit、rate limit、統一エラー応答、route architecture checks。
- **自動品質ゲート**: TypeScript、ESLint、Prettier、architecture checks、unit test、Browser Mode test、smoke test。
- **Agent-friendly workflow**: `AGENTS.md`、architecture docs、todolist memory、test impact map が多段階作業を支援します。

## クイックスタート

```sh
pnpm install
pnpm db:push
IAM_BOOTSTRAP_ADMIN_PASSWORD='replace-with-a-strong-password' pnpm backend-admin:bootstrap
pnpm dev
```

`backend-admin:bootstrap` は、基本 IAM permissions、system menu tree、roles、policies、field rules、ACTIVE super administrator を設定済み database に書き込みます。これは runtime seed や fallback ではなく、明示的な setup command です。デフォルトの login identifier は `admin` / `admin@tetap.local` で、password は `IAM_BOOTSTRAP_ADMIN_PASSWORD` の値です。

よく使うコマンド:

```sh
pnpm check
pnpm lint
pnpm format
pnpm test:affected
pnpm test:browser
pnpm test:smoke
```

Production build:

```sh
pnpm build
```

`pnpm build` は `pnpm check` を実行し、version bump の後に Turbo で全 workspace を build します。release version bump を機能変更と混ぜないように、production build の前に機能コードを先に commit してください。

## Workspace

| Workspace            | 役割                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `apps/web`           | Public React + Vite runtime、promotional landing、routing、pages。  |
| `apps/web-admin`     | Admin React + Vite runtime と admin pages。                         |
| `apps/backend`       | Public Fastify runtime、plugins、routes、services。                 |
| `apps/backend-admin` | Admin Fastify runtime と admin APIs。                               |
| `packages/config`    | typed env と Node/Vite config entrypoints。                         |
| `packages/hooks`     | shared React hooks と form helpers。                                |
| `packages/i18n`      | locale resources、translation core、React/Node helpers。            |
| `packages/iam`       | IAM permissions、sessions、policies、fields、data、operation logs。 |
| `packages/prisma`    | Prisma schema、validation、generation、DB scripts。                 |
| `packages/schema`    | Zod request/response/entity/form contracts。                        |
| `packages/ui`        | shadcn/ui components、design-system styles、brand SVG。             |
| `test/automation`    | Vitest unit、Browser Mode UI、smoke、targeted tests。               |

## コントリビューション

- Issue は bug、改善提案、security risk、documentation problem に使用してください。
- Pull Request は変更範囲を小さく保ち、実行した validation commands を説明に記載してください。
- Code、exports、APIs、Prisma models、scripts、UI primitives を変更した場合は、最寄りの README と関連 architecture docs も同じ変更で更新してください。
- Package README は現在の entrypoints、tools、helper methods、scripts、validation commands と一致させてください。
- Frontend-facing な変更後は `npx -y react-doctor@latest . --verbose --diff` を 1 回実行し、score/report を確認して実行可能な問題を修正してください。
- public issue に secrets、tokens、database connection strings、exploit details を投稿しないでください。
- 大きな変更の前に [AGENTS.md](AGENTS.md) と [architecture docs](docs/Logical%20Architecture%20Diagram/README.md) を確認してください。

## License

このプロジェクトは [MIT License](LICENSE) で公開されています。
