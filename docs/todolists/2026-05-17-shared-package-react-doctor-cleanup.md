# Shared Package React Doctor Cleanup Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Resolve actionable React Doctor findings in shared frontend-facing packages while preserving intended helper semantics.

## Execution Plan

- [x] Inspect current `packages/hooks` and `packages/i18n` React Doctor findings and existing test coverage.
- [x] Hoist or cache user time-zone `Intl.DateTimeFormat` usage in `packages/hooks`.
- [x] Refactor `Accept-Language` parsing in `packages/i18n` to avoid unnecessary array passes.
- [x] Add or update targeted tests for the changed shared helpers.
- [x] Sync nearest package documentation if behavior or helper details need documenting.
- [x] Run targeted validation, React Doctor, and final repository gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Closed after making the shared date/time and Node locale helpers more explicit and directly covered by targeted unit
tests. `@tetap/hooks` now reuses a module-level time-zone formatter and cached per-locale datetime formatters.
`@tetap/i18n/node` now parses `Accept-Language` candidates in one explicit pass before sorting by quality. The affected
test map now selects focused unit coverage for `packages/hooks/**` and `packages/i18n/**`.

Validation passed:

- `pnpm test:unit:target -- hooks-time-zone`
- `pnpm test:unit:target -- i18n-node`
- `pnpm test:unit:target -- test-selection`
- `pnpm --filter @tetap/hooks type-check`
- `pnpm --filter @tetap/hooks lint`
- `pnpm --filter @tetap/i18n type-check`
- `pnpm --filter @tetap/i18n lint`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm --filter @tetap/test-automation lint`
- `pnpm test:affected`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm --filter @tetap/test-automation build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
- `npx -y react-doctor@latest . --verbose --diff`

React Doctor reported `100 / 100` for the root diff, `@tetap/hooks`, and `@tetap/i18n`. The remaining `@tetap/ui`
package-wide warnings are existing shadcn/React 19 migration and unused component follow-ups outside this cleanup.
