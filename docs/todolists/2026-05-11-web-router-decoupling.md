# Web Router Decoupling Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Decouple the public web router from App.tsx.

## Execution Plan

- [x] Move apps/web route definitions and browser router creation out of App.tsx.
- [x] Wire the extracted router through the public web entrypoint.
- [x] Run targeted and required validation commands.
- [x] Close this todolist with validation notes.

## Closure Notes

Closed after moving public web route definitions into `apps/web/src/routes.tsx`, browser router creation into
`apps/web/src/router.tsx`, and injecting the router from `apps/web/src/main.tsx` into `App`.

Validation passed:

- `pnpm --filter web type-check`
- `pnpm test:affected`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm --filter web build`
