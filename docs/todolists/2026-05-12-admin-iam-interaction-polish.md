# Admin IAM Interaction Polish Todolist

Status: Closed
Created: 2026-05-12
Closed: 2026-05-12
Task: Improve admin IAM destructive confirmations, field/policy editing, form helper descriptions, and operation-log search UX.

## Execution Plan

- [x] Replace operation-log inline search markup with `InputGroup` plus an explicit search submit button.
- [x] Add reusable destructive confirmation dialog for all delete and revoke actions.
- [x] Add edit dialogs for field permissions and dynamic policies.
- [x] Add helper descriptions to IAM form inputs, selects, and searchable pickers.
- [x] Update i18n keys and relevant README/docs.
- [x] Run targeted type, UI, and browser validation.

## Closure Notes

- `pnpm --filter web-admin type-check` passed.
- `pnpm --filter @tetap/ui type-check` passed.
- Operation-log search was tightened to use `InputGroup` for the icon/input pair and a separate submit `Button`; typing does not send a search request.
- `pnpm --filter @tetap/test-automation type-check` passed.
- `pnpm test:browser:target -- web-admin-dashboard` passed.
