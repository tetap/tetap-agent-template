# Open Source README And Logo Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Convert the root README into a multilingual open-source entrypoint and replace the admin brand icon with a project SVG logo.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Phase 1: Inventory current README, package metadata, and admin brand icon usage.
- [x] Phase 2: Add reusable SVG logo asset and UI logo component.
- [x] Phase 3: Replace web-admin brand/team icon usage with the new project logo.
- [x] Phase 4: Rewrite the root README with Chinese, English, Korean, and Japanese open-source sections.
- [x] Phase 5: Add missing open-source license file if needed.
- [x] Phase 6: Run formatting/type/i18n boundary checks and close this todolist.

## Validation

```sh
pnpm format:fix
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm --filter @tetap/ui lint
pnpm --filter web-admin lint
pnpm test:browser:target -- web-admin-dashboard
pnpm format
```

## Closure Notes

Implemented a multilingual open-source README with Chinese, English, Korean, and Japanese sections, added a root MIT `LICENSE`, rewrote the root package `description` and README tagline for open-source distribution, created SVG logo assets, exported a reusable `TetapLogo` component from `@tetap/ui`, and replaced the admin team brand icon with the new SVG logo component.

Validation completed:

```sh
pnpm format:fix
pnpm --filter @tetap/ui type-check
pnpm --filter web-admin type-check
pnpm i18n:boundaries:check
pnpm --filter @tetap/ui lint
pnpm --filter web-admin lint
pnpm test:browser:target -- web-admin-dashboard
pnpm format
```
