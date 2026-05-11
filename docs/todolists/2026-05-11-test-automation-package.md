# Test Automation Package Todolist

Status: Closed
Closed: 2026-05-11
Created: 2026-05-11
Task: Create a `test` workspace package for Vitest unit, UI browser, and smoke tests; add testing memory constraints; ensure builds require smoke tests to pass.

## Execution Plan

- [x] Search existing todolists and create this execution plan.
- [x] Inspect current workspace scripts and package boundaries.
- [x] Add a Vitest-based automated testing package under `test`.
- [x] Add unit tests and smoke tests for current software behavior.
- [x] Wire smoke tests into the build path so build requires smoke success.
- [x] Document testing memory constraints in project docs.
- [x] Add Vitest Browser Mode UI functional tests.
- [x] Add targeted and affected test commands.
- [x] Remove deprecated TypeScript baseUrl configuration.
- [x] Run lint, format, unit, browser, smoke, and build validation.
- [x] Close this todolist with validation results.

## Closure Notes

Closed after adding the Vitest automation package, Browser Mode UI functional test, targeted affected-test runner, smoke build gate, TypeScript baseUrl cleanup, and testing workflow memory updates.

Validation passed:

- pnpm test:target -- --list
- pnpm test:unit:target -- schema-response
- pnpm test:affected -- packages/config/src/env.ts packages/ui/src/components/ui/button.tsx
- pnpm test:browser:target -- ui-components
- pnpm test:smoke:target -- backend-health
- pnpm test:target -- unit schema-response --name healthResponseSchema
- pnpm --filter @tetap/test-automation type-check
- pnpm lint:fix
- pnpm format:fix
- pnpm lint
- pnpm format
- pnpm check
- pnpm test:browser
- pnpm test:smoke
- pnpm --filter @tetap/test-automation build
