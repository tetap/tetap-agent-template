# UI React 19 Sidebar Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Migrate the shared `@tetap/ui` sidebar primitive away from React 19 deprecated `forwardRef` and `useContext` APIs while preserving the public sidebar export contract.

## Execution Plan

- [x] Inspect project UI rules, `@tetap/ui` docs, shadcn sidebar docs, current exports, and sidebar consumers.
- [x] Convert `packages/ui/src/components/ui/sidebar.tsx` to regular `ref` props, `React.memo`, and React 19 `use`.
- [x] Run targeted type-check, lint, React Doctor diff, UI/admin browser tests, affected tests, and required final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Migrated `packages/ui/src/components/ui/sidebar.tsx` from generated `React.forwardRef` wrappers to regular `ref` props wrapped with `React.memo`, changed sidebar context reads from `React.useContext` to React 19 `React.use`, and kept sidebar public exports, class names, data attributes, mobile Sheet behavior, cookie persistence, and keyboard shortcut behavior intact. The shortcut listener now keeps one subscription and reads the latest toggle callback through a ref. The trigger click callback is memoized with an action-oriented name.

Documentation was inspected (`packages/ui/README.md`, `docs/Logical Architecture Diagram/packages-ui.md`, shadcn sidebar docs) and did not require content changes because the public API and documented export list stayed the same.

Validation passed:

- `pnpm dlx shadcn@latest info -c packages/ui --json`.
- `pnpm dlx shadcn@latest docs sidebar`.
- `rg -n "forwardRef|React\\.forwardRef|useContext|React\\.useContext" packages/ui/src/components/ui/sidebar.tsx` found no matches.
- `pnpm --filter @tetap/ui type-check`.
- `pnpm --filter @tetap/ui lint`.
- `npx -y react-doctor@latest . --verbose --diff` reported `100/100` for the changed sidebar file and no issues.
- `pnpm test:browser:target -- ui-components` passed, 2 tests.
- `pnpm test:browser:target -- web-admin-dashboard` passed, 21 tests.
- `pnpm test:affected` passed, 24 browser tests.
- `pnpm --filter @tetap/ui build`.
- `pnpm lint:fix`.
- `pnpm format:fix`.
- `pnpm check` passed, including 26 unit tests.
- `pnpm test:browser` passed, 24 browser tests.
- `pnpm test:smoke` passed, 3 smoke tests.
- `pnpm --filter @tetap/test-automation build` passed, 3 smoke tests.
- `pnpm lint`.
- `pnpm format`.
- `git diff --check`.

Full React Doctor snapshot after migration: repository score `92/100` with 97 remaining issues; `@tetap/ui` score `99/100` with 26 remaining issues. The previous `@tetap/ui` React 19 deprecated API warnings in `sidebar.tsx` are gone; remaining UI findings are unused shadcn primitives/exports.
