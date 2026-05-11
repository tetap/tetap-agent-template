# Dialog Overflow Scroll Todolist

Status: Closed
Created: 2026-05-11
Task: Ensure shared dialogs remain inside the viewport and scroll when their content exceeds the body height.

## Execution Plan

- [x] Update shared `DialogContent` to cap height against the viewport and enable vertical scrolling.
- [x] Run targeted UI/admin checks and full quality gates.
- [x] Close this todolist with validation notes.

## Closure Notes

Completed shared Dialog viewport overflow handling. `DialogContent` now caps height to the visible viewport, enables vertical scrolling, and contains scroll chaining.

Validation:

- `pnpm dlx shadcn@latest docs dialog`
- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter web-admin type-check`
- `pnpm test:browser:target -- web-admin-dashboard`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
