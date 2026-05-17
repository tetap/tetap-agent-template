# UI React 19 Interaction Feedback Primitives Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Migrate the shared `@tetap/ui` command and input OTP primitive batch from generated `forwardRef` wrappers to React 19 ref-as-prop components, remove unused legacy Radix toast files, and memoize the public Sonner toaster.

## Execution Plan

- [x] Inspect remaining `forwardRef` debt, shadcn docs, and existing Command, InputOTP, and Toast implementations.
- [x] Convert Command and InputOTP exported wrappers to memoized ref-as-prop components.
- [x] Remove unused legacy Radix toast files and memoize the public Sonner toaster while preserving the current `Toaster`/`toast` export.
- [x] Preserve public exports, cmdk composition, OTP context behavior, Sonner behavior, and existing styling.
- [x] Run targeted UI validation, React Doctor diff scan, affected tests, and required final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Converted Command and InputOTP wrappers from generated `forwardRef` components to memoized React 19 ref-as-prop
components. InputOTP now reads its context through `React.use(...)`, the unused legacy Radix `toast.tsx` and `toaster.tsx`
files were removed, and the public Sonner `Toaster` now uses `React.memo` with stable toast options while preserving the
current `Toaster`/`toast` export path.

Validation passed:

- `pnpm dlx shadcn@latest docs command input-otp`
- `pnpm dlx shadcn@latest docs command input-otp toast` was attempted first; `toast` is not present in the current shadcn registry.
- `rg -n "forwardRef|React\\.forwardRef|useContext" packages/ui/src/components/ui/command.tsx packages/ui/src/components/ui/input-otp.tsx packages/ui/src/components/ui/sonner.tsx` returned no matches.
- `rg -n "components/ui/toast|components/ui/toaster|./toast|./toaster" .` returned no matches.
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
- Full `npx -y react-doctor@latest . --verbose` passed with root `90/100` and `@tetap/ui` `96/100`. Root warnings dropped to
  169 across 55 files, and `@tetap/ui` warnings dropped to 98 across 29 files; remaining React Doctor debt is outside this
  focused interaction/feedback primitive batch.
