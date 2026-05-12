# apps/backend

`apps/backend` 是 Fastify 后端应用，负责 HTTP runtime、plugins、安全中间件、统一错误处理、route registration 和 services 层业务编排。

## Architecture Links

- [Root README](../../README.md)
- [Agent Operating Guide](../../AGENTS.md)
- [apps/backend Architecture](../../docs/Logical%20Architecture%20Diagram/apps-backend.md)
- [Quality Gates](../../docs/Logical%20Architecture%20Diagram/02-quality-gates.md)

## Owns

- Fastify app creation and startup。
- Plugins for i18n, security, and error handling。
- Public auth and permission-denial operation logging through `@tetap/iam` backed by `@tetap/prisma` persistence。
- Registration-only routes。
- Services for business logic, validation orchestration, response building。
- Backend-local shared helpers such as `ErrorCode` and `AppError`。

## Must Not Own

- Zod contract definitions outside `@tetap/schema`。
- Prisma schema outside `@tetap/prisma`。
- Route-level business logic。
- App-local env loading outside `@tetap/config/node`。

## Internal Structure

| Path             | Responsibility                                             |
| ---------------- | ---------------------------------------------------------- |
| `src/main.ts`    | Load env and start Fastify.                                |
| `src/app.ts`     | Build and compose Fastify instance.                        |
| `src/plugins/*`  | Cross-cutting request lifecycle logic.                     |
| `src/routes/*`   | Route registration only.                                   |
| `src/services/*` | Input/output schema validation and business orchestration. |
| `src/shared/*`   | Backend shared errors, responses, security helpers.        |

## Current Public APIs

```text
GET /health
```

The public backend currently exposes only the health route. Non-public routes added later must declare Fastify `schema`, auth/public policy metadata, and required permission metadata where applicable. The auth plugin already supports `Authorization: Bearer ...`, session/token-version validation, and permission-denial operation logging through `@tetap/iam`. IAM state is loaded from the real Prisma persistence layer; tests may inject explicit fixtures from `test/automation`.

## Security Baseline

- `@fastify/helmet`, `@fastify/cors`, and `@fastify/rate-limit` are registered globally.
- `BODY_LIMIT_BYTES`, rate limit, and CORS origins come from `@tetap/config`.
- Request logs redact authorization, cookie, password, token, access-token, and refresh-token fields.
- SSRF and upload safety helpers live in `src/shared/security.ts` and are covered by `backend-security` unit tests.

## Scripts

```sh
pnpm --filter backend dev
pnpm --filter backend type-check
pnpm --filter backend lint
pnpm --filter backend build
pnpm --filter backend start
pnpm backend:architecture:check
```

## Validation

- Route boundary: `pnpm backend:architecture:check`。
- Runtime smoke: `pnpm test:smoke` or `pnpm test:smoke:target -- backend-health`。
- Full handoff: `pnpm check`。
