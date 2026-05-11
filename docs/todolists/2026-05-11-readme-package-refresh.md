# README Package Refresh Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Refresh README files and persistent agent memory after the IAM/admin implementation so package exports, methods, scripts, and behavior descriptions stay accurate.

## Execution Plan

- [x] Inspect current workspace changes, README coverage, package exports, routes, Prisma models, and test-selection targets.
- [x] Strengthen README sync memory so future agents update the nearest README and package method lists after code changes.
- [x] Update stale app/package/test README files and affected architecture docs.
- [x] Run formatting and final validation.

## Closure Notes

Closed after refreshing README sync memory, root/localized README files, app/package READMEs, architecture docs, test documentation, and historical IAM todolist terminology now that audit logs have been renamed to operation logs.

Validation completed:

```sh
pnpm format:fix
pnpm lint:fix
pnpm format
pnpm check
pnpm test:smoke
pnpm test:browser
pnpm db:schema:check
pnpm db:validate
```

Commit and push are tracked by the active handoff rather than this docs-only closure.
