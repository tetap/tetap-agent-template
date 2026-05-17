# I18n React Doctor Barrel Cleanup Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Remove the remaining React Doctor barrel-import warnings from `@tetap/i18n` without changing public entrypoints.

## Execution Plan

- [x] Inspect current React Doctor warnings, package exports, i18n README, and architecture docs.
- [x] Split internal full-app translator and locale registry imports away from `index.ts` barrels.
- [x] Preserve `@tetap/i18n`, `@tetap/i18n/react`, `@tetap/i18n/node`, and `@tetap/i18n/locales` public APIs.
- [x] Run i18n-focused validation, React Doctor, and repository gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed after moving full-app i18n creation to `src/app.ts`, moving the full locale registry to
`src/locales/registry.ts`, and keeping public root and `@tetap/i18n/locales` exports as forwarding entrypoints.
Internal modules now import from non-barrel files, while public package APIs remain unchanged.

Validation passed:

- `pnpm --filter @tetap/i18n type-check`
- `pnpm --filter @tetap/i18n lint`
- `pnpm --filter @tetap/i18n build`
- `pnpm i18n:boundaries:check`
- `pnpm test:unit:target -- i18n-node` (1 file, 3 tests)
- `npx -y react-doctor@latest . --verbose --diff` (root changed files 100/100; `@tetap/i18n` changed files 100/100)
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check` (26 unit tests)
- `pnpm test:affected` (`i18n-node` unit tests, 24 Browser Mode tests, 2 smoke tests)
- `pnpm lint`
- `pnpm format`
- `git diff --check`
- `pnpm test:smoke` (3 smoke tests)

React Doctor still reports existing package-wide `@tetap/ui` React 19 `forwardRef`, unused component, and chart warnings
when it scans that workspace outside the i18n diff; those remain a separate UI migration task.
