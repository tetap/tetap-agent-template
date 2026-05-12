# IAM Overview Slimming Todolist

Status: Closed
Created: 2026-05-12
Task: Narrow `/iam/overview` to dashboard metrics only and move activity/list data to scoped APIs.

## Execution Plan

- [x] Inspect backend overview service, schema contracts, dashboard usage, IAM page usage, and tests.
- [x] Change `iamOverviewDataSchema` so `/iam/overview` returns count metrics only.
- [x] Move dashboard activity fetching to paged `/iam/operation-logs`.
- [x] Remove the stale admin IAM overview section that fetched multiple resource lists.
- [x] Update browser and smoke tests for the new contracts.
- [x] Update README notes for backend-admin, web-admin, and schema contracts.
- [x] Run targeted type, smoke, and browser validation.

## Closure Notes

- `pnpm --filter @tetap/schema build` passed.
- `pnpm --filter backend-admin type-check` passed.
- `pnpm --filter web-admin type-check` passed.
- `pnpm test:smoke:target -- backend-admin-iam` passed.
- `pnpm test:browser:target -- web-admin-dashboard` passed.
