<p align="center">
  <img src="docs/assets/tetap-logo.svg" width="112" height="112" alt="TETAP logo" />
</p>

# TETAP Agent Template

<p align="center">
  React, Fastify, TypeScript, IAM, scoped i18n, Prisma, 자동화 품질 게이트를 포함한 AI 보조 개발용 오픈소스 엔터프라이즈 full-stack monorepo입니다.
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja-JP.md">日本語</a>
</p>

## 개요

TETAP Agent Template은 AI 보조 개발을 위한 오픈소스 full-stack monorepo 템플릿입니다. public web, admin web, Fastify API, IAM, 설정, UI, i18n, schema, Prisma, 자동화 테스트를 명확한 workspace로 분리하여 빠른 개발과 엄격한 아키텍처 경계를 함께 유지합니다.

## 주요 기능

- **엔터프라이즈 IAM 기반**: JWT, RBAC, PBAC, 필드 권한, 동적 메뉴, 세션 무효화, 강제 로그아웃, 감사 로그.
- **Contract-first 개발**: request, response, form schema를 `@tetap/schema`에 두고 Zod로 재사용합니다.
- **Scoped i18n**: public web, admin web, backend, backend-admin이 서로 다른 i18n entrypoint를 사용합니다.
- **공유 UI 시스템**: 앱은 `@tetap/ui`의 shadcn/ui 컴포넌트와 브랜드 자산만 조합합니다.
- **보안 기본값**: Fastify 보안 플러그인, CORS allowlist, body limit, rate limit, 통일된 오류 응답, route 아키텍처 검사.
- **자동화 품질 게이트**: TypeScript, ESLint, Prettier, 아키텍처 검사, unit test, Browser Mode test, smoke test.
- **Agent 친화 워크플로**: `AGENTS.md`, 아키텍처 문서, todolist memory, 테스트 영향 맵이 다단계 작업을 안내합니다.

## 빠른 시작

```sh
pnpm install
pnpm dev
```

자주 사용하는 명령:

```sh
pnpm check
pnpm lint
pnpm format
pnpm test:affected
pnpm test:browser
pnpm test:smoke
```

프로덕션 빌드:

```sh
pnpm build
```

`pnpm build`는 `pnpm check`를 실행하고 버전을 bump한 뒤 Turbo로 모든 workspace를 빌드합니다. 릴리스 버전 bump가 기능 커밋과 섞이지 않도록 프로덕션 빌드 전에 기능 코드를 먼저 커밋하세요.

## Workspace

| Workspace            | 역할                                                           |
| -------------------- | -------------------------------------------------------------- |
| `apps/web`           | Public React + Vite runtime, routing, page composition.        |
| `apps/web-admin`     | Admin React + Vite runtime과 admin pages.                      |
| `apps/backend`       | Public Fastify runtime, plugins, routes, services.             |
| `apps/backend-admin` | Admin Fastify runtime과 admin APIs.                            |
| `packages/config`    | typed env와 Node/Vite config entrypoint.                       |
| `packages/hooks`     | 공유 React hooks와 form helpers.                               |
| `packages/i18n`      | locale resources, translation core, React/Node helpers.        |
| `packages/iam`       | IAM permissions, sessions, policies, fields, data, audit core. |
| `packages/prisma`    | Prisma schema, validation, generation, DB scripts.             |
| `packages/schema`    | Zod request/response/entity/form contracts.                    |
| `packages/ui`        | shadcn/ui components, design-system styles, brand SVG.         |
| `test/automation`    | Vitest unit, Browser Mode UI, smoke, targeted tests.           |

## 기여

- Issue는 bug, 개선 제안, 보안 위험, 문서 문제에 사용합니다.
- Pull Request는 변경 범위를 작게 유지하고 실행한 검증 명령을 설명에 남겨 주세요.
- 공개 issue에 secret, token, database connection string, exploit detail을 올리지 마세요.
- 큰 변경 전에는 [AGENTS.md](AGENTS.md)와 [architecture docs](docs/Logical%20Architecture%20Diagram/README.md)를 읽어 주세요.

## License

이 프로젝트는 [MIT License](LICENSE)로 배포됩니다.
