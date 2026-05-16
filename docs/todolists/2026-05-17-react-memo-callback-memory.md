# React Memo Callback Memory Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Record and apply the frontend rule that React components should use `memo` and component-local functions should use `useCallback`.

## Execution Plan

- [x] Inspect current frontend modules touched by recent route-splitting and web landing work.
- [x] Add the `memo`/`useCallback` rule to frontend workflow memory.
- [x] Apply `memo` and `useCallback` to the frontend components touched in this cleanup.
- [x] Run frontend and repository validation gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Recorded the component composition rule in `docs/memory/frontend-react-doctor-workflow.md`: React components should export
through `memo(...)` by default, and component-local functions should use `useCallback` or move outside the component.
Applied the rule to the touched frontend components and Browser Mode test component. Also updated scoped i18n hooks to React
19 `use(...)` and cached user date-time formatters after React Doctor reported low-risk hooks optimizations.

React Doctor results:

- Root diff scan: 100/100.
- `@tetap/hooks` changed-file scan: 100/100 after fixes.
- `@tetap/i18n` changed-file scan: 100/100.
- `@tetap/ui` full scan remains 92/100 due existing shadcn/Radix `forwardRef`, unused generated component files/exports,
  and chart/carousel diagnostics outside this task.

Validation used the same passing commands listed in `2026-05-17-remove-site-promote-web.md`.
