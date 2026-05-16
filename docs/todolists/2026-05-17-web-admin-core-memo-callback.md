# Web Admin Core Memo Callback Todolist

Status: Closed
Created: 2026-05-17
Task: Apply the recorded React `memo` and component-local `useCallback` rule to the web-admin core shell and lightweight page entry components.

## Execution Plan

- [x] Audit current frontend component declarations against the memo/useCallback memory.
- [x] Update web-admin core shell, route guards, fallbacks, and lightweight pages to export memoized components.
- [x] Stabilize component-local event handlers with `useCallback` where needed.
- [x] Run targeted Browser Mode, React Doctor, formatting, lint, type-check, and affected validation.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed on 2026-05-17 after memoizing the web-admin core shell, route guards, route fallbacks, auth layout/pages, dashboard, settings, and layout helper components. Component-local event handlers introduced or touched in this scope now use `useCallback`; derived arrays and submit handlers use memoized values where needed.

Validation:

- `pnpm lint:fix` passed.
- `pnpm format:fix` passed.
- `pnpm --filter web-admin type-check` passed.
- `pnpm --filter web-admin lint` passed.
- `pnpm test:browser:target -- web-admin-dashboard` passed, 1 file and 21 tests.
- `npx -y react-doctor@latest . --verbose --diff` passed for the changed root diff with `100/100` and no issues.
- `pnpm test:affected` passed, 1 browser file and 21 tests.
- `pnpm format` passed.
- `pnpm check` passed, including full type-check and 5 unit files with 19 tests.
- `pnpm test:browser` passed, 3 browser files and 23 tests.
- `pnpm test:smoke` passed, 3 smoke files and 3 tests.
- `git diff --check` passed.

React Doctor residual full-package scan notes, not introduced by this change:

- `@tetap/hooks`: `src/store/time-zone.ts` dynamic `Intl.DateTimeFormat` cache warning.
- `@tetap/i18n`: existing barrel-import and `map().filter()` warnings.
- `@tetap/ui`: existing shadcn/Radix generated component warnings, including React 19 `forwardRef`, unused exported component files, and several chart/carousel/input-group diagnostics.
