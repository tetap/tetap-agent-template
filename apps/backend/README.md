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
