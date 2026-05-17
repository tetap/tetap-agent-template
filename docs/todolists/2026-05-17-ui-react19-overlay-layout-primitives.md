# UI React 19 Overlay Layout Primitives Todolist

Status: Closed
Created: 2026-05-17
Task: Migrate a focused overlay/layout `@tetap/ui` primitive batch from generated `forwardRef` wrappers to React 19 ref-as-prop components while preserving shadcn/ui APIs.

## Execution Plan

- [x] Inspect current React Doctor warnings, shadcn docs, and existing implementations for the selected overlay/layout primitive batch.
- [x] Convert Accordion, Tooltip, Popover, HoverCard, ScrollArea, and Slider wrappers to memoized ref-as-prop components.
- [x] Preserve public exports, Radix primitive behavior, portals, default offsets/orientations, animation classes, and current styling.
- [x] Run targeted UI validation, React Doctor diff scan, affected tests, and final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed: 2026-05-17

Validation passed:

- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter @tetap/ui lint`
- `npx -y react-doctor@latest . --verbose --diff` (`100/100` for root changed files and `@tetap/ui` changed files)
- `pnpm test:browser:target -- ui-components`
- `pnpm test:affected`
- `pnpm --filter @tetap/ui build`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm --filter @tetap/test-automation build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
- `npx -y react-doctor@latest . --verbose` (root `90/100`, `@tetap/ui` `96/100`)

Remaining React Doctor follow-up is outside this batch: generated/Radix `forwardRef` wrappers in larger navigation,
menu, table, sidebar, select, command, dialog, sheet, alert-dialog, toast, input-otp, and chart components; unused generated
UI files/exports; and chart bundle/sanitization diagnostics.
