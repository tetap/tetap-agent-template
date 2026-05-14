# @tetap/test-automation

Vitest automation package for repository-level unit, Browser Mode UI functional, targeted affected, and smoke tests.

## Architecture Design

- Test memory: [docs/memory/testing-workflow.md](../../docs/memory/testing-workflow.md)
- Smoke design: [SMOKE_TEST_DESIGN.md](SMOKE_TEST_DESIGN.md)
- Quality gates: [docs/Logical Architecture Diagram/02-quality-gates.md](../../docs/Logical%20Architecture%20Diagram/02-quality-gates.md)

## Test Types

| Type                   | Location                            | Full Command                                                  | Target Command                                                                                                                    |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests             | `src/unit/**/*.unit.test.ts`        | `pnpm test:unit`                                              | `pnpm test:unit:target -- config-env`                                                                                             |
| UI browser tests       | `src/browser/**/*.browser.test.tsx` | `pnpm test:browser`                                           | `pnpm test:browser:target -- web-admin-dashboard`                                                                                 |
| Smoke tests            | `src/smoke/**/*.smoke.test.ts`      | `pnpm test:smoke`                                             | `pnpm test:smoke:target -- backend-health`                                                                                        |
| Affected tests         | Git changed files from repo root    | `pnpm test:affected`                                          | `pnpm test:affected -- packages/ui/src/index.ts`                                                                                  |
| Admin responsive audit | `scripts/admin-responsive-audit.ts` | `pnpm --filter @tetap/test-automation audit:admin-responsive` | `ADMIN_AUDIT_BASE_URL=http://127.0.0.1:5174 ADMIN_AUDIT_PASSWORD=... pnpm --filter @tetap/test-automation audit:admin-responsive` |

## Current Targets

| Target                 | Type    | Scope                                                                      |
| ---------------------- | ------- | -------------------------------------------------------------------------- |
| `config-env`           | Unit    | Shared env parsing and config defaults.                                    |
| `schema-response`      | Unit    | Unified responses, admin auth schemas, IAM response schemas.               |
| `iam-engine`           | Unit    | IAM auth, RBAC, menu, field, data-scope, policy, sessions, operation logs. |
| `backend-security`     | Unit    | SSRF/upload helpers, canonical paths, HMAC/body hash helpers.              |
| `test-selection`       | Unit    | Target and affected-test selection logic.                                  |
| `i18n-site`            | Unit    | VitePress site i18n scope.                                                 |
| `ui-components`        | Browser | Shared UI primitives.                                                      |
| `web-admin-dashboard`  | Browser | Real admin shell/dashboard/sign-in/settings/IAM UI behavior.               |
| `backend-health`       | Smoke   | Public Fastify health runtime.                                             |
| `backend-admin-health` | Smoke   | Admin Fastify health runtime.                                              |
| `backend-admin-iam`    | Smoke   | Admin auth, IAM CRUD, protected deletion, and frontend-session separation. |

## Targeted Commands

Use targeted commands during development so each change runs only the module tests it can affect.

```sh
pnpm test:target -- unit schema-response
pnpm test:target -- unit schema-response --name healthResponseSchema
pnpm test:unit:target -- config-env
pnpm test:unit:target -- i18n-site
pnpm test:browser:target -- ui-components
pnpm test:browser:target -- web-admin-dashboard
pnpm test:smoke:target -- backend-health
pnpm test:affected
pnpm test:affected --base main
pnpm test:affected -- packages/config/src/env.ts packages/ui/src/components/ui/button.tsx
pnpm test:target -- --list
ADMIN_AUDIT_BASE_URL=http://127.0.0.1:5174 ADMIN_AUDIT_PASSWORD=... pnpm --filter @tetap/test-automation audit:admin-responsive
```

## Coverage Notes

- `browser:web-admin-dashboard` covers the shadcn-admin adapted shell, sidebar/search rendering, dashboard interaction, sign-in form session storage, admin IAM search controls, loading feedback, super-admin frontend gates, and active-viewport content containment.
- `audit:admin-responsive` signs in to a running `apps/web-admin` instance and checks dashboard, system management pages, and 404/500 pages at desktop, tablet, and mobile viewport sizes.
- `smoke:backend-admin-iam` covers real backend-admin auth and IAM management APIs, including frontend-session separation from admin sessions.
- `unit:iam-engine` covers protected-resource guards, policy default-deny behavior, field masking, session separation, and operation logs.
- `unit:backend-security` covers shared backend SSRF/upload/HMAC utility behavior.
- `unit:i18n-site` covers the VitePress promotional site copy scope.
- `unit:schema-response` also covers admin auth form schemas from `@tetap/schema/admin-auth`.

## Impact Map

The affected runner resolves the Git repository root before reading unstaged, staged, and untracked files, then uses `src/support/test-selection.ts` as the single source of truth.

| Changed Area                          | Tests Selected                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `packages/config/**`                  | `unit:config-env`                                                                            |
| `packages/schema/**`                  | `unit:schema-response`, `unit:iam-engine`, `smoke:backend-health`, `smoke:backend-admin-iam` |
| `packages/iam/**`                     | `unit:iam-engine`, `smoke:backend-admin-iam`                                                 |
| `apps/backend/**`                     | `unit:backend-security`, `smoke:backend-health`                                              |
| `apps/backend-admin/**`               | `unit:backend-security`, `smoke:backend-admin-health`, `smoke:backend-admin-iam`             |
| `packages/prisma/**`                  | `smoke:backend-health`, `smoke:backend-admin-health`, `smoke:backend-admin-iam`              |
| `apps/web/**`                         | `browser:ui-components`                                                                      |
| `apps/web-admin/**`                   | `browser:web-admin-dashboard`                                                                |
| `apps/site/**`                        | `unit:i18n-site`                                                                             |
| `packages/hooks/**`, `packages/ui/**` | `browser:ui-components`, `browser:web-admin-dashboard`                                       |
| `packages/i18n/**`                    | `unit:i18n-site`, browser targets, backend smoke targets                                     |
| `test/automation/src/**` test files   | The changed test file only.                                                                  |

## Rules

- Use Vitest for automated tests.
- Unit tests cover isolated package behavior and contracts.
- UI browser tests use Vitest Browser Mode with Playwright to cover real browser interaction.
- Smoke tests cover critical runtime boot paths and validate responses with `@tetap/schema`.
- Targeted tests must run against source aliases, not stale workspace `dist` outputs.
- When adding a new module or test file, update `src/support/test-selection.ts` so `pnpm test:affected` can select the right tests.
- Root `pnpm build` must require smoke tests to pass through this package's `build` script.
