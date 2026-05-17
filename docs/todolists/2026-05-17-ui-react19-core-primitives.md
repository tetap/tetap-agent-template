# UI React 19 Core Primitives Todolist

Status: Closed
Created: 2026-05-17
Task: Migrate a focused set of high-use `@tetap/ui` primitives from `forwardRef` to React 19 ref-as-prop components while preserving shadcn/ui APIs.

## Execution Plan

- [x] Inspect current React Doctor warnings, shadcn docs, and existing core primitive implementations.
- [x] Convert Button, Input, Textarea, Card, Label, and Separator to memoized ref-as-prop components.
- [x] Preserve public exports, variants, styling, `asChild`, Radix primitive behavior, and current tests.
- [x] Update nearby UI documentation for the React 19 primitive migration rule.
- [x] Run targeted UI validation, React Doctor, affected tests, and final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed: 2026-05-17

Validation passed:

- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter @tetap/ui lint`
- `pnpm test:browser:target -- ui-components`
- `npx -y react-doctor@latest . --verbose --diff`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:affected`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm --filter @tetap/test-automation build`
- `pnpm --filter @tetap/ui build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
