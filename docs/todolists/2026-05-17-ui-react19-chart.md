# UI React 19 Chart Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Resolve the unused shared `@tetap/ui` chart helper and its direct React Doctor warnings without changing public `@tetap/ui` entrypoints.

## Execution Plan

- [x] Inspect `chart.tsx`, shadcn chart docs, and current React Doctor residual warnings.
- [x] Confirm `chart.tsx` has no public package export and no repository imports.
- [x] Remove the unused `chart.tsx` source and the unused `@tetap/ui` `recharts` dependency.
- [x] Run targeted UI validation, React Doctor diff scan, affected tests, and required final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Removed the unused, non-exported `packages/ui/src/components/ui/chart.tsx` helper and the direct `@tetap/ui` `recharts` dependency. Repository import search found no remaining chart or Recharts usage outside this todolist.

Validation completed:

- `pnpm --filter @tetap/ui type-check` passed.
- `pnpm --filter @tetap/ui lint` passed.
- `npx -y react-doctor@latest . --verbose --diff` passed with no changed source files requiring a React scan.
- `pnpm test:browser:target -- ui-components` passed, 2 tests.
- `pnpm test:affected` passed, 24 tests.
- `pnpm --filter @tetap/ui build` passed.
- `pnpm lint:fix` passed.
- `pnpm format:fix` passed.
- `pnpm check` passed.
- `pnpm test:browser` passed, 24 tests.
- `pnpm test:smoke` passed, 3 tests.
- `pnpm --filter @tetap/test-automation build` passed.
- `pnpm lint` passed.
- `pnpm format` passed.
- `git diff --check` passed.

Full React Doctor snapshot after removal: repository score `91/100`; `@tetap/ui` score `98/100`. The removed chart helper warnings are gone; remaining `@tetap/ui` React 19 deprecated API warnings are concentrated in `packages/ui/src/components/ui/sidebar.tsx`.
