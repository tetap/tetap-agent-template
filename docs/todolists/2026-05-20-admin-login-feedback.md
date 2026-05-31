# Admin Login Feedback Todolist

Status: Closed
Created: 2026-05-20
Closed: 2026-05-20
Task: Improve admin login failure messages and verify Sonner feedback behavior.

## Execution Plan

- [x] Review current web-admin sign-in, backend-admin auth errors, i18n keys, and toast wiring.
- [x] Return specific backend-admin login failure responses for invalid credentials and disabled or locked accounts.
- [x] Surface backend-admin login errors in web-admin with inline feedback and Sonner toast.
- [x] Update browser/smoke tests for admin login failure behavior.
- [x] Sync nearest README and architecture docs.
- [x] Run targeted formatting, type-check, tests, React Doctor, and final gates where feasible.

## Closure Notes

Implemented login-specific backend-admin error responses, shared frontend backend-admin error message extraction, sign-in Alert plus Sonner toast feedback, and Browser/Smoke coverage for invalid credentials.

Validation passed:

- `pnpm format:fix`
- `pnpm lint:fix`
- `pnpm --filter backend-admin type-check`
- `pnpm --filter web-admin type-check`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm test:browser:target -- web-admin-dashboard`
- `pnpm test:smoke:target -- backend-admin-iam`
- `pnpm test:affected`
- `npx -y react-doctor@latest . --verbose --diff` reported 100/100 for changed root sources; it also reported one existing unrelated 99/100 warning in `packages/ui/src/components/ui/sidebar.tsx`.
- `pnpm check`
