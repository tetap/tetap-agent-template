# Real IAM Persistence Todolist

Status: Closed
Created: 2026-05-12
Closed: 2026-05-12
Task: Remove demo/mock IAM runtime mode and require backend/backend-admin plus tests to use real persisted IAM data.

## Execution Plan

- [x] Inspect current `ENABLE_DEMO_SEED`, `createDemoIamData`, in-memory IAM service creation, Prisma schema, and smoke tests.
- [x] Add a Prisma-backed IAM persistence adapter and load backend IAM state from the database.
- [x] Remove demo seed runtime configuration and rename test seed data to real test fixtures.
- [x] Add an explicit backend-admin IAM bootstrap command for real database setup.
- [x] Update backend/admin code, schemas, tests, README files, and architecture docs.
- [x] Run Prisma, type, unit, smoke, browser, lint, format, and final checks.
- [x] Commit and push to `origin/master`.

## Closure Notes

Validation passed:

- `pnpm db:generate`
- `pnpm db:validate`
- `pnpm --filter @tetap/iam type-check`
- `pnpm --filter backend-admin type-check`
- `pnpm --filter backend type-check`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm test:unit:target -- iam-engine`
- `pnpm test:unit:target -- config-env`
- `pnpm test:smoke:target -- backend-health backend-admin-health backend-admin-iam`
- `pnpm test:browser`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `npx -y react-doctor@latest . --verbose --diff`

React Doctor:

- Root project and `@tetap/ui`: `96 / 100`.
- `@tetap/hooks`: `100 / 100`.
- `@tetap/i18n`: `99 / 100`.
- Low-risk Tailwind size shorthand and command wrapper attribute issues were fixed.
- Remaining items are shadcn/Radix React 19 `forwardRef` migration suggestions, `Chart` internals, and existing barrel-import/performance guidance.
