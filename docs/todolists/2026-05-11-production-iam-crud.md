# Production IAM CRUD Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Move IAM beyond read-only demo surfaces by implementing production-grade user, role, permission, policy, field permission, menu, session, and audit management APIs plus admin UI integration.

## Execution Plan

- [x] Create this execution plan before editing code.
- [x] Phase 0: Inventory current IAM core, Prisma models, schema contracts, backend-admin APIs, admin UI, and tests.
- [x] Phase 1: Define production CRUD contracts in `@tetap/schema` for users, roles, permissions, menus, field permissions, policies, and session operations.
- [x] Phase 2: Extend `@tetap/iam` with mutation-safe management operations, uniqueness checks, protected super-admin guards, policy default-deny behavior, and audit event helpers.
- [x] Phase 3: Implement backend-admin management APIs with route metadata, schemas, service-layer validation, permission checks, policy checks, and response validation.
- [x] Phase 4: Wire admin UI and API client to real create/update/delete and assignment flows for users, roles, permissions, policies, and field permissions.
- [x] Phase 5: Add unit, smoke, Browser Mode, and affected-test mappings for the new production IAM paths.
- [x] Phase 6: Run lint, format, architecture, type, Prisma, unit, smoke, browser, and affected validation.
- [x] Phase 7: Close this todolist with validation results and explicitly deferred production adapter scope.

## Production Scope

In scope:

- Backend-admin APIs for real IAM management workflows.
- Shared Zod contracts for request/response payloads.
- IAM core mutation APIs that can later be backed by PostgreSQL/Redis repositories.
- Admin UI forms/actions that call backend-admin APIs instead of only reading overview data.
- Tests proving create/update/delete, assignment, policy denial, field masking, and forced offline flows.

Out of scope for this pass:

- Migrating the smoke runtime to a live PostgreSQL/Redis instance.
- Full Prisma repository adapter wiring, because current automated gates run without external services.
- OAuth2/OIDC/SSO and multi-tenant SaaS billing concerns.

## Required Validation

```sh
pnpm lint:fix
pnpm format:fix
pnpm backend:architecture:check
pnpm i18n:boundaries:check
pnpm db:schema:check
pnpm db:validate
pnpm check
pnpm test:affected
pnpm test:smoke
pnpm test:browser
```

## Closure Notes

Implemented production IAM management flows through `@tetap/schema`, `@tetap/iam`, `apps/backend-admin`, and `apps/web-admin`.

Implemented API/UI coverage:

- Backend-admin CRUD APIs for users, roles, permissions, menus, field permissions, and policies.
- Admin API client functions and page-level forms/actions for IAM create/delete/update-adjacent management flows.
- IAM mutation guards for uniqueness, protected resources, default-deny policy behavior, session invalidation, and audit records.
- Unit, smoke, and Browser Mode tests for mutation workflows, admin APIs, field permission/policy creation, protected delete rejection, session revoke, and UI tab rendering.

Validation completed:

```sh
pnpm test:unit:target -- iam-engine
pnpm test:smoke:target -- backend-admin-iam
pnpm test:browser:target -- web-admin-dashboard
pnpm backend:architecture:check
pnpm i18n:boundaries:check
pnpm db:schema:check
pnpm db:validate
pnpm lint:fix
pnpm format:fix
pnpm check
pnpm test:affected
pnpm test:smoke
pnpm test:browser
```

Deferred production adapter scope:

- Live PostgreSQL/Redis repository adapter wiring remains out of scope for this pass.
- The Prisma schema and shared contracts are the production persistence contract; current automated smoke/runtime paths still use the `@tetap/iam` service implementation to avoid external service requirements in local gates.
