# UI React 19 Modal Primitives Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Migrate the shared `@tetap/ui` modal primitive batch from generated `forwardRef` wrappers to React 19 ref-as-prop components while preserving shadcn/Radix APIs.

## Execution Plan

- [x] Inspect remaining `forwardRef` debt, shadcn docs, and existing Dialog, AlertDialog, Sheet, and Drawer implementations.
- [x] Convert Dialog, AlertDialog, Sheet, and Drawer exported wrappers to memoized ref-as-prop components.
- [x] Preserve public exports, portals, overlays, close controls, side variants, animation classes, and existing styling.
- [x] Run targeted UI validation, React Doctor diff scan, affected tests, and required final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Converted Dialog, AlertDialog, Sheet, and Drawer wrappers from generated `forwardRef` components to memoized React 19
ref-as-prop components. Public exports, Radix/Vaul primitive aliases, portals, overlays, close controls, sheet side
variants, animation classes, and existing styling were preserved.

Validation passed:

- `pnpm dlx shadcn@latest docs dialog alert-dialog sheet drawer`
- `rg -n "forwardRef|React\\.forwardRef" packages/ui/src/components/ui/dialog.tsx packages/ui/src/components/ui/alert-dialog.tsx packages/ui/src/components/ui/sheet.tsx packages/ui/src/components/ui/drawer.tsx` returned no matches.
- `pnpm --filter @tetap/ui type-check`
- `pnpm --filter @tetap/ui lint`
- `npx -y react-doctor@latest . --verbose --diff` reported `100/100` for root changed files and `@tetap/ui` changed files.
- `pnpm test:browser:target -- ui-components` passed with 1 file and 2 tests.
- `pnpm test:affected` passed with 3 files and 24 tests.
- `pnpm --filter @tetap/ui build`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check` passed, including workspace type-check and 26 unit tests.
- `pnpm test:browser` passed with 3 files and 24 tests.
- `pnpm test:smoke` passed with 3 files and 3 tests.
- `pnpm --filter @tetap/test-automation build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
- Full `npx -y react-doctor@latest . --verbose` passed with root `90/100` and `@tetap/ui` `96/100`; remaining React
  Doctor debt is outside this focused modal primitive batch.
