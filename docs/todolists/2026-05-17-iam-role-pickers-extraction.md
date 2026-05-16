# IAM Role Pickers Extraction Todolist

Status: Closed
Created: 2026-05-17
Task: Split IAM role assignment and permission checklist controls out of the monolithic web-admin IAM page while removing React Doctor state-reset effects.

## Execution Plan

- [x] Inspect current role assignment and permission checklist dependencies.
- [x] Extract assigned-user dialog and permission checklist into a focused IAM module.
- [x] Memoize extracted components and stabilize component-local callbacks.
- [x] Replace reset effects with query/page state updates that do not require `useEffect`.
- [x] Rewire `iam.tsx` imports and remove unused local code.
- [x] Sync web-admin README and architecture docs.
- [x] Run targeted format, lint, type-check, Browser Mode, React Doctor, affected/check validation.
- [x] Close this todolist with validation commands and results.

## Closure Notes

- `pnpm format:fix` passed.
- `pnpm --filter web-admin type-check` passed.
- `pnpm --filter web-admin lint` passed after removing an unused `useMemo` import from `iam.tsx`.
- `pnpm test:browser:target -- web-admin-dashboard` passed: 1 file, 21 tests.
- `npx -y react-doctor@latest . --verbose --diff` passed with main project score `98/100`; this removed the prior changed-file state-reset warnings. Residual changed-file warnings are the existing `AdminIamPage` giant-component/useReducer items and the `isLoading` early-return false-positive style warning.
- `pnpm lint:fix` passed.
- `pnpm format:fix` passed after lint fixes.
- `pnpm test:affected` passed: targeted web-admin dashboard Browser Mode suite, 21 tests.
- `pnpm check` passed, including dependency, hooks, i18n, backend architecture, type-check, build, and unit gates.
- `pnpm test:browser` passed: 3 files, 23 tests.
- `git diff --check` passed.
