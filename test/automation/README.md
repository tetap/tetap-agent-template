# @tetap/test-automation

Vitest automation package for repository-level unit, Browser Mode UI functional, targeted affected, and smoke tests.

## Architecture Design

- Test memory: [docs/memory/testing-workflow.md](../../docs/memory/testing-workflow.md)
- Smoke design: [SMOKE_TEST_DESIGN.md](SMOKE_TEST_DESIGN.md)
- Quality gates: [docs/Logical Architecture Diagram/02-quality-gates.md](../../docs/Logical%20Architecture%20Diagram/02-quality-gates.md)

## Test Types

| Type             | Location                            | Full Command         | Target Command                                    |
| ---------------- | ----------------------------------- | -------------------- | ------------------------------------------------- |
| Unit tests       | `src/unit/**/*.unit.test.ts`        | `pnpm test:unit`     | `pnpm test:unit:target -- config-env`             |
| UI browser tests | `src/browser/**/*.browser.test.tsx` | `pnpm test:browser`  | `pnpm test:browser:target -- web-admin-dashboard` |
| Smoke tests      | `src/smoke/**/*.smoke.test.ts`      | `pnpm test:smoke`    | `pnpm test:smoke:target -- backend-health`        |
| Affected tests   | Git changed files                   | `pnpm test:affected` | `pnpm test:affected -- packages/ui/src/index.ts`  |

## Targeted Commands

Use targeted commands during development so each change runs only the module tests it can affect.

```sh
pnpm test:target -- unit schema-response
pnpm test:target -- unit schema-response --name healthResponseSchema
pnpm test:unit:target -- config-env
pnpm test:browser:target -- ui-components
pnpm test:browser:target -- web-admin-dashboard
pnpm test:smoke:target -- backend-health
pnpm test:affected
pnpm test:affected --base main
pnpm test:affected -- packages/config/src/env.ts packages/ui/src/components/ui/button.tsx
pnpm test:target -- --list
```

## Coverage Notes

- `browser:web-admin-dashboard` covers the shadcn-admin adapted shell, sidebar/search rendering, dashboard tab interaction, and sign-in form session storage.
- `unit:schema-response` also covers admin auth form schemas from `@tetap/schema/admin-auth`.

## Impact Map

The affected runner uses `src/support/test-selection.ts` as the single source of truth.

| Changed Area                                  | Tests Selected                                         |
| --------------------------------------------- | ------------------------------------------------------ |
| `packages/config/**`                          | `unit:config-env`                                      |
| `packages/schema/**`                          | `unit:schema-response`, `smoke:backend-health`         |
| `apps/backend/**`                             | `smoke:backend-health`                                 |
| `apps/backend-admin/**`, `packages/prisma/**` | `smoke:backend-admin-health`                           |
| `apps/web/**`                                 | `browser:ui-components`                                |
| `apps/web-admin/**`                           | `browser:web-admin-dashboard`                          |
| `packages/hooks/**`, `packages/ui/**`         | `browser:ui-components`, `browser:web-admin-dashboard` |
| `packages/i18n/**`                            | browser targets plus backend smoke targets             |
| `test/automation/src/**` test files           | The changed test file only.                            |

## Rules

- Use Vitest for automated tests.
- Unit tests cover isolated package behavior and contracts.
- UI browser tests use Vitest Browser Mode with Playwright to cover real browser interaction.
- Smoke tests cover critical runtime boot paths and validate responses with `@tetap/schema`.
- Targeted tests must run against source aliases, not stale workspace `dist` outputs.
- When adding a new module or test file, update `src/support/test-selection.ts` so `pnpm test:affected` can select the right tests.
- Root `pnpm build` must require smoke tests to pass through this package's `build` script.
