# Admin IAM Tables And Sessions Todolist

Status: Closed
Created: 2026-05-12
Closed: 2026-05-12
Task: Convert field permission and policy management lists into proper tables and remove seeded online-user demo sessions.

## Execution Plan

- [x] Replace field-permission card list with a shadcn `Table` that has explicit headers and row actions.
- [x] Replace policy card list with a shadcn `Table` that has explicit headers, condition preview, and row actions.
- [x] Remove demo-seeded frontend online sessions so `/iam/sessions` is empty until real frontend sessions exist.
- [x] Surface backend-admin mutation/revoke error messages in IAM toasts instead of only generic failure text.
- [x] Update README/docs and test expectations for table behavior and real online-session data.
- [x] Run targeted type and browser/smoke validation.

## Closure Notes

- Field permissions and policies now render as headed management tables with edit/delete row actions.
- Local IAM seed no longer creates frontend users or frontend online sessions; `/iam/sessions` returns an empty list until real frontend sessions exist.
- IAM mutation and revoke toasts now surface backend-admin error messages when the API returns one.
- `pnpm --filter web-admin type-check` passed.
- `pnpm --filter @tetap/iam type-check` passed.
- `pnpm --filter backend-admin type-check` passed.
- `pnpm --filter @tetap/test-automation type-check` passed.
- `pnpm test:unit:target -- iam-engine` passed.
- `pnpm test:smoke:target -- backend-admin-iam` passed.
- `pnpm test:browser:target -- web-admin-dashboard` passed.
