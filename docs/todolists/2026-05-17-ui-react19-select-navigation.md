# UI React 19 Select And Navigation Todolist

Status: Closed
Created: 2026-05-17
Task: Migrate the shared `@tetap/ui` Select and NavigationMenu primitive wrappers from generated `forwardRef` components to React 19 ref-as-prop components while preserving shadcn/Radix APIs.

## Execution Plan

- [x] Inspect `select`, `navigation-menu`, shadcn docs, and current React Doctor residual warnings.
- [x] Convert Select and NavigationMenu exported wrappers to memoized ref-as-prop components.
- [x] Preserve public exports, Radix primitive aliases, portals, scroll buttons, trigger styles, indicators, viewport behavior, animation classes, and existing styling.
- [x] Run targeted UI validation, React Doctor diff scan, affected tests, and required final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed: 2026-05-17

Validation:

- `rg -n "forwardRef|React\.forwardRef" packages/ui/src/components/ui/select.tsx packages/ui/src/components/ui/navigation-menu.tsx` -> no matches.
- `pnpm --filter @tetap/ui type-check` -> passed.
- `pnpm --filter @tetap/ui lint` -> passed.
- `npx -y react-doctor@latest . --verbose --diff` -> changed React sources 100/100 with no issues.
- `pnpm test:browser:target -- ui-components` -> 1 file, 2 tests passed.
- `pnpm test:affected` -> 3 files, 24 tests passed.
- `pnpm --filter @tetap/ui build` -> passed.
- `pnpm lint:fix` -> passed.
- `pnpm format:fix` -> passed.
- `pnpm check` -> passed, including dependency, hooks, i18n boundary, backend architecture, type-check, and unit gates.
- `pnpm test:browser` -> 3 files, 24 tests passed.
- `pnpm test:smoke` -> 3 files, 3 tests passed.
- `pnpm --filter @tetap/test-automation build` -> passed.
- `pnpm lint` -> passed.
- `pnpm format` -> passed.
- `git diff --check` -> passed.

Full React Doctor residual snapshot after this batch:

- Root project: 90/100, 130 issues across 53/216 files.
- `@tetap/ui`: 96/100, 59 issues across 27/57 files.
- Remaining `@tetap/ui` React 19 deprecated API warnings are now concentrated in `chart.tsx` and `sidebar.tsx`; this batch removed `select.tsx` and `navigation-menu.tsx` from that warning list.
