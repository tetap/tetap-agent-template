# UI React Doctor Accessibility Cleanup Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Resolve small, actionable React Doctor accessibility and render diagnostics in shared `@tetap/ui` components.

## Execution Plan

- [x] Inspect shadcn component guidance and current `@tetap/ui` diagnostics.
- [x] Fix `InputGroupAddon` keyboard/focus behavior without changing existing layout API.
- [x] Fix `FieldError` rendering so it avoids memo-before-bailout and index keys.
- [x] Fix carousel event subscription cleanup for stable re-init/select listeners.
- [x] Update Browser Mode coverage and nearest UI/test documentation.
- [x] Run targeted UI validation, React Doctor, and repository gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed after memoizing the touched shared UI components, preserving `InputGroupAddon` focus handoff, rendering
`FieldError` alerts without index keys, and keeping Carousel event subscriptions stable across `reInit` and `select`.

Validation passed:

- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter @tetap/ui lint`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm --filter @tetap/test-automation lint`
- `pnpm test:browser:target -- ui-components` (2 tests)
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check` (26 unit tests)
- `npx -y react-doctor@latest . --verbose --diff` (changed root files 100/100; `@tetap/ui` 100/100; existing
  `@tetap/i18n` barrel-import warnings remain outside this task)
- `pnpm test:affected` (3 browser files, 24 tests)
- `pnpm test:browser` (3 browser files, 24 tests)
- `pnpm test:smoke` (3 smoke files, 3 tests)
- `pnpm --filter @tetap/test-automation build` (3 smoke files, 3 tests)
- `pnpm --filter web build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
