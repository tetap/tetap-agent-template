# UI React 19 Data Navigation Primitives Todolist

Status: Closed
Created: 2026-05-17
Task: Migrate a focused data/navigation `@tetap/ui` primitive batch from generated `forwardRef` wrappers to React 19 ref-as-prop components while preserving shadcn/ui APIs.

## Execution Plan

- [x] Inspect current React Doctor warnings, shadcn docs, and existing Breadcrumb, Pagination, and Table implementations.
- [x] Convert Breadcrumb, Pagination, and Table exported wrappers to memoized ref-as-prop components.
- [x] Preserve public exports, `asChild`, button variants, aria attributes, icon composition, table scroll wrapper, and current styling.
- [x] Run targeted UI validation, React Doctor diff scan, affected tests, and final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

- `pnpm --filter @tetap/ui type-check` passed.
- `pnpm --filter @tetap/ui lint` passed.
- `npx -y react-doctor@latest . --verbose --diff` passed with root changed files `100/100` and `@tetap/ui` changed files `100/100`.
- `pnpm test:browser:target -- ui-components` passed with 1 file and 2 tests.
- `pnpm test:affected` passed with 3 files and 24 tests.
- `pnpm --filter @tetap/ui build` passed.
- `pnpm lint:fix` passed.
- `pnpm format:fix` passed.
- `pnpm check` passed, including full workspace type-check and 26 unit tests.
- `pnpm test:browser` passed with 3 files and 24 tests.
- `pnpm test:smoke` passed with 3 files and 3 tests.
- `pnpm --filter @tetap/test-automation build` passed.
- `pnpm lint` passed.
- `pnpm format` passed.
- `git diff --check` passed.
- Full `npx -y react-doctor@latest . --verbose` passed with root `90/100` and `@tetap/ui` `96/100`; remaining React Doctor debt is outside this focused primitive batch.
