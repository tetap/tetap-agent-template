# IAM Token Session Hardening Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Harden IAM token and session expiry handling with service-clock verification, explicit expired sessions, and token blacklist cleanup.

## Execution Plan

- [x] Confirm current token verification, session expiry, blacklist, and unit test coverage.
- [x] Make IAM token verification use the service clock and prune expired token blacklist entries.
- [x] Mark expired sessions explicitly when access tokens outlive the backing session.
- [x] Add focused unit coverage for clock-aware token verification and session expiry behavior.
- [x] Run focused validation, format/lint, full quality gates, then close this todolist.

## Closure Notes

Implemented IAM token/session hardening:

- Access and refresh token verification now uses the `IamService` injected clock.
- Revoked-token blacklist entries are pruned after expiry to avoid unbounded growth.
- Expired backing sessions are explicitly marked as `EXPIRED` when an access token is still cryptographically valid.
- Unit test runtime aliases now resolve `@tetap/iam` and admin auth schema imports to source files, so targeted tests do not read stale build output.

Validation completed:

```sh
pnpm --filter @tetap/iam type-check
pnpm --filter @tetap/test-automation type-check
pnpm test:unit:target -- iam-engine
pnpm test:unit:target -- schema-response
pnpm test:smoke:target -- backend-admin-iam
pnpm lint:fix
pnpm format:fix
pnpm check
```
