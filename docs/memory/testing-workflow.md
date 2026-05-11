# Testing Workflow Memory

This persistent memory applies whenever a feature, package, app, or architecture rule is implemented or changed.

## Rule Summary

Feature implementation is not complete until unit tests, UI browser functional tests, smoke-test design, and targeted affected-test selection are considered. Automated tests must use Vitest. UI functional tests must use Vitest Browser Mode for browser-real interaction where applicable. Production build must require smoke tests to pass.

## Required Workflow

1. For each implemented feature, add or update unit tests under `test/automation/src/unit` when logic, contracts, helpers, or package behavior changes.
2. For each implemented UI feature or shared UI component behavior, add or update Browser Mode tests under `test/automation/src/browser`. Use a real browser provider rather than jsdom-style simulation.
3. For each implemented feature that affects app startup, routing, middleware, critical API flows, security, or build/runtime integration, add or update smoke tests under `test/automation/src/smoke`.
4. Keep smoke-test design documented in `test/automation/SMOKE_TEST_DESIGN.md`.
5. Use `@tetap/schema` to validate request/response bodies in tests when testing backend or frontend/backend contracts.
6. Use localized expected messages from `@tetap/i18n` resources or existing API outputs; do not invent hardcoded feature copy in tests that should live in locales.
7. During implementation, prefer `pnpm test:affected` or `pnpm test:target -- <type> <target>` to run only tests impacted by the changed module.
8. When adding a module, test file, package, or app area, update `test/automation/src/support/test-selection.ts` so targeted affected tests stay accurate.
9. Run `pnpm test:unit` after logic changes, `pnpm test:browser` after UI behavior changes, and `pnpm test:smoke` after runtime/build/API flow changes when finalizing.
10. Root `pnpm build` must include a smoke-test gate and must not be considered successful unless smoke tests pass.

## Commands

```sh
pnpm test
pnpm test:unit
pnpm test:browser
pnpm test:smoke
pnpm test:affected
pnpm test:target -- unit schema-response
pnpm test:browser:target -- ui-components
pnpm test:smoke:target -- backend-health
pnpm --filter @tetap/test-automation test
```

## Completion Criteria

A feature handoff should state whether unit tests, UI browser tests, smoke tests, and affected-test mappings were added or updated, and list the commands that passed.
