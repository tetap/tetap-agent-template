# Enterprise IAM Roadmap Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Plan the enterprise IAM permission system, scoped i18n split, backend security audit, architecture docs refresh, code review pass, and backend-admin permission UI rollout.

## Execution Plan

- [x] Create this roadmap before starting implementation.
- [x] Phase 0: Inventory current backend, backend-admin, schema, Prisma, i18n, config, and test automation boundaries.
- [x] Phase 1: Design backend IAM architecture and module ownership before writing runtime code.
- [x] Phase 2: Implement IAM persistence and contracts through `@tetap/prisma` and `@tetap/schema`.
- [x] Phase 3: Implement JWT auth, refresh token, Redis-backed sessions, token id checks, and forced logout support.
- [x] Phase 4: Implement RBAC permissions, API route permission metadata, dynamic menu contracts, and capability responses.
- [x] Phase 5: Implement field-level permissions, masking, readonly/edit control contracts, and serializer policy.
- [x] Phase 6: Implement data permissions with department, self, custom, and future tenant-aware query constraints.
- [x] Phase 7: Implement ABAC/PBAC policy engine integration and dynamic policy evaluation.
- [x] Phase 8: Implement online user management, multi-device controls, session blacklist, and admin forced-offline APIs.
- [x] Phase 9: Implement audit logging for login, logout, permission changes, risky actions, and policy decisions.
- [x] Phase 10: Split i18n modules so public web, admin web, public backend, and backend-admin can only import allowed locale scopes.
- [x] Phase 11: Audit and harden `apps/backend` and `apps/backend-admin` security baselines.
- [x] Phase 12: Run a code review and optimization pass after IAM, i18n, and security changes are in place.
- [x] Phase 13: Refresh `README.md`, `AGENTS.md`, workspace docs, frontend component rules, and backend API rules.
- [x] Phase 14: Design and implement backend-admin IAM UI and wire it to backend-admin APIs.
- [x] Phase 15: Run final lint, format, type, architecture, unit, smoke, and browser validation.
- [x] Phase 16: Close this roadmap with validation results and any intentionally deferred scope.

## Phase Details

### Phase 0: Baseline Inventory

Goal: establish the implementation baseline before changing architecture.

Scope:

- Inspect existing route/service boundaries in `apps/backend` and `apps/backend-admin`.
- Inspect `@tetap/schema`, `@tetap/prisma`, `@tetap/i18n`, `@tetap/config`, and `test/automation` impact maps.
- Reconcile this roadmap with the existing open admin web plan at `docs/todolists/2026-05-11-admin-web-layout-auth-migration.md` before starting admin UI work.

Validation:

- `pnpm backend:architecture:check`
- `pnpm test:affected`

### Phase 1: Backend IAM Architecture Design

Goal: design the backend permission infrastructure first, with business modules depending on policy decisions rather than embedding permission logic.

Required decisions:

- Decide whether reusable IAM core belongs in a new `packages/iam` or `packages/authz` workspace.
- Keep Fastify apps responsible for runtime plugin registration and route composition only.
- Keep request/response/form schemas in `@tetap/schema`.
- Keep Prisma models and client access in `@tetap/prisma`.
- Keep all user-visible messages in scoped `@tetap/i18n` modules after the i18n split.

Target backend flow:

```text
Fastify
  -> JWT Auth
  -> Session Manager
  -> Permission Engine
  -> Policy Engine
  -> Field Engine
  -> Serializer Engine
  -> Service
  -> Prisma
```

Deliverables:

- IAM architecture document under `docs/Logical Architecture Diagram`.
- Workspace boundary update for IAM ownership.
- Route metadata standard for required permissions and public route allowlists.
- Error-code and response-code standard for expired login, forced offline, forbidden, and policy denial.

### Phase 2: Persistence And Contracts

Goal: implement the storage and Zod contracts needed by later phases.

Prisma models to design:

- `User`, `Role`, `Permission`, `UserRole`, `RolePermission`.
- `Policy`, `FieldPermission`, `Menu`, `MenuPermission`.
- `Department` or `Organization`, department hierarchy support, and tenant id reservation.
- `UserSession`, token blacklist or invalid token registry.
- `AuditLog`.

Schema contracts to design:

- Login, refresh, logout, current user, capabilities.
- Role, permission, menu, field permission, data scope, policy, session, audit APIs.
- Unified admin list/query request patterns and response pagination.

Validation:

- `pnpm db:schema:check`
- `pnpm db:validate`
- `pnpm --filter @tetap/schema type-check`
- `pnpm test:unit`

### Phase 3: Auth And Session Foundation

Goal: implement stateful JWT authentication that supports token invalidation.

Backend requirements:

- JWT contains `sub`, `tokenId`, role summary, issued-at, expiration, and tenant id reservation.
- Redis session keys follow a documented naming convention such as `session:user:{userId}:{tokenId}`.
- Auth plugin verifies JWT, checks token id state, loads user context, and rejects invalidated sessions.
- Refresh token flow rotates tokens and invalidates old session state.
- Forced logout deletes session state, blacklists token id with TTL, and updates `user_sessions`.

Rules:

- Public routes must be explicit allowlists.
- Protected routes default to deny.
- Route files only register options and imported handlers.

Validation:

- Unit tests for session manager and token invalidation logic.
- Smoke tests for login, current user, expired token, forced offline, and refresh flow.

### Phase 4: RBAC, API Permissions, Menus, And Capabilities

Goal: implement base permissions for APIs, menus, and buttons.

Backend requirements:

- Permission code format such as `resource:action`.
- Route metadata declares permission requirements.
- Permission plugin loads user roles and permissions from cache or storage.
- Capability response returns only granted capability codes for the current user.
- Dynamic menu APIs return only authorized menu tree nodes.
- Super admin bypass is explicit, audited, and isolated.

Frontend contract:

- `Can` and route guard consume capabilities only as UI hints.
- Backend remains the final authority for every protected action.

Validation:

- Unit tests for role/permission resolution.
- Smoke tests for allowed and denied admin API calls.

### Phase 5: Field-Level Permissions

Goal: ensure sensitive fields are never leaked by relying on backend field policy enforcement.

Backend requirements:

- Field permissions support `HIDE`, `MASK`, `READONLY`, and `READWRITE`.
- Field engine filters response data and masks values such as phone and identity numbers.
- Update contracts expose editable-field constraints to admin UI where needed.
- Serializer policy is centralized and reusable across admin resources.

Rules:

- Do not rely on frontend hiding for sensitive data.
- Do not return raw sensitive fields and expect the UI to remove them.

Validation:

- Unit tests for field filtering and masking.
- Smoke tests for role-specific field output.

### Phase 6: Data Permissions

Goal: enforce row-level access through a shared query policy layer.

Data scopes:

- `ALL`
- `DEPT`
- `DEPT_AND_CHILD`
- `SELF`
- `CUSTOM`
- Future tenant-constrained scope.

Backend requirements:

- Data policy builds Prisma `where` constraints centrally.
- Services use the policy-aware query builder for protected resources.
- Direct Prisma access bypassing data policy is treated as a review failure for protected modules.

Validation:

- Unit tests for generated query constraints.
- Smoke tests for department/self/custom data visibility.

### Phase 7: ABAC And PBAC Policy Engine

Goal: support richer policy decisions through user attributes, resource attributes, environment attributes, and dynamic policies.

Backend requirements:

- Policy engine evaluates `allow` and `deny` effects with deny taking precedence.
- Conditions are typed and validated before persistence.
- CASL integration or equivalent ability factory is wrapped behind project-owned APIs.
- Request context exposes policy decisions without leaking implementation details into route files.

Validation:

- Unit tests for policy precedence and condition evaluation.
- Smoke tests for representative attribute-based and policy-based denials.

### Phase 8: Online Users And Forced Offline

Goal: make active sessions observable and controllable by administrators.

Backend-admin APIs:

- List online users and devices.
- Force one session offline.
- Force all sessions for one user offline.
- Optional single-device login policy.
- Session last-active heartbeat or request-touch mechanism.

Frontend behavior contract:

- Forced offline response uses a stable code such as `40101` and a localized `LOGIN_EXPIRED` message key.
- Admin web clears local auth state and redirects to login when the session is invalid.

Validation:

- Smoke tests for session list and forced-offline behavior.

### Phase 9: Audit Logging

Goal: make IAM and security actions traceable.

Audit events:

- Login, refresh, logout, failed login.
- Permission, role, policy, field permission, and menu changes.
- Forced logout and session revocation.
- Policy denials and risky admin actions.

Rules:

- Logs must redact password, token, phone, identity number, and other sensitive fields.
- Logs must not include raw request bodies in production.

Validation:

- Unit tests for redaction.
- Smoke tests for critical audit event creation.

### Phase 10: Scoped I18n Split

Goal: prevent frontend bundles from reading backend-only translation keys and prevent admin/public scopes from importing each other's message trees.

Target scopes:

- `@tetap/i18n/public` for `apps/web`.
- `@tetap/i18n/admin` for `apps/web-admin`.
- `@tetap/i18n/backend` for `apps/backend`.
- `@tetap/i18n/backend-admin` for `apps/backend-admin`.
- `@tetap/i18n/shared` only for intentionally shared validation or common shell messages.

Requirements:

- Locale resources split by module while preserving same-key parity per locale.
- TypeScript key types are scoped per export.
- React provider accepts only frontend-safe resources.
- Node helpers accept only backend-safe resources.
- Add a check that disallows forbidden import paths by workspace.

Validation:

- Unit tests for key parity and scoped key typing.
- Browser build check proving backend/backend-admin keys are not bundled into frontend apps.
- Smoke tests for localized backend and backend-admin responses.

### Phase 11: Backend Security Hardening

Goal: harden both Fastify services after IAM basics are available.

Checklist:

- Helmet, CORS allowlist, body limit, and rate limits are configured through `@tetap/config`.
- Every route has schema, authentication policy, and rate-limit policy unless explicitly public.
- Error handler does not leak stack traces in production.
- Logger redacts secrets and sensitive personal data.
- SSRF guard exists before any outbound URL fetch capability.
- Upload limits and file type allowlists exist before any upload endpoint ships.
- Public backend cannot contain admin APIs.
- Backend-admin APIs default to authenticated and authorized.

Validation:

- `pnpm backend:architecture:check`
- Security-focused unit tests.
- Backend and backend-admin smoke tests.

### Phase 12: Code Review And Optimization Pass

Goal: review implemented IAM, i18n, and security changes before adding more UI surface.

Review focus:

- Permission bypasses.
- Route-layer logic.
- Direct Prisma access that bypasses policy constraints.
- Missing schema validation.
- Inconsistent error codes.
- Secret or PII logging.
- Cache invalidation gaps.
- Over-broad super admin behavior.
- Tests missing for critical denial paths.

Deliverables:

- Review findings resolved or documented.
- Targeted refactors only where they reduce risk or duplication.

### Phase 13: Documentation And Coding Standards Refresh

Goal: make new rules discoverable before wider feature work continues.

Documents to update:

- `AGENTS.md`.
- Root `README.md`.
- `docs/Logical Architecture Diagram/README.md`.
- Backend, backend-admin, i18n, schema, Prisma, web-admin, and test automation docs.
- Workspace READMEs affected by new entrypoints or scripts.

Rules to document:

- Frontend components must use `@tetap/ui`, scoped frontend i18n, schema-first forms, and Browser Mode tests.
- Admin pages must call only backend-admin contracts.
- React code must avoid app-local hooks, app-local UI systems, hardcoded visible copy, unsafe HTML injection, and capability-only security assumptions.
- Backend APIs must avoid route logic, missing schema, raw secret logging, raw SQL interpolation, policy bypasses, and unscoped i18n imports.

Validation:

- `pnpm format:fix`
- `pnpm lint:fix`
- `pnpm check`

### Phase 14: Backend-Admin IAM UI

Goal: implement admin permission management UI after backend contracts and safeguards are in place.

UI surfaces:

- Users, roles, permissions, role assignment.
- Menus and menu-permission links.
- Field permissions and data scopes.
- Policies and condition editor.
- Online users and forced offline controls.
- Audit logs.

Rules:

- UI uses `@tetap/ui` shadcn components and does not create app-local UI primitives.
- UI uses `@tetap/i18n/admin` only.
- Forms use `@tetap/schema` contracts.
- Capabilities hide unavailable controls, but backend-admin still enforces every action.

Validation:

- Browser Mode tests for key admin workflows.
- Smoke tests for backend-admin API integration.
- `pnpm test:affected`

### Phase 15: Final Validation

Required commands before handoff:

```sh
pnpm lint:fix
pnpm format:fix
pnpm backend:architecture:check
pnpm check
pnpm test:affected
pnpm test:smoke
pnpm test:browser
```

Add more targeted commands when a phase changes Prisma, schema, i18n, or web-admin behavior.

## Closure Notes

Closed: 2026-05-11

Implemented:

- Added `@tetap/iam` as the reusable IAM core for JWT HMAC tokens, stateful sessions, token id/token version invalidation, forced offline, RBAC capabilities, dynamic menus, field masking, data-scope constraints, PBAC/ABAC policy evaluation, and audit redaction.
- Added IAM Prisma models under `@tetap/prisma` and IAM Zod HTTP contracts under `@tetap/schema`.
- Wired `apps/backend` and `apps/backend-admin` with hardened Fastify runtime defaults: body limits, Helmet, CORS allowlist, rate limits, auth hooks, route permission metadata, localized error handling, logger redaction, SSRF guard helpers, and upload guard helpers.
- Added backend-admin IAM auth/session/API routes for login, refresh, logout, current user, overview, users, roles, permissions, menus, field permissions, policies, online sessions, session revocation, user-session revocation, and audit logs.
- Split i18n into public, admin, backend, and backend-admin entrypoints and added `pnpm i18n:boundaries:check`.
- Added admin IAM UI and backend-admin API client in `apps/web-admin`, including overview, users, roles, sessions, policy/field/audit surfaces, and forced-offline action wiring.
- Refreshed README, AGENTS, workspace architecture docs, package docs, quality gates, and testing impact maps.
- Review follow-up fixed PBAC default behavior to deny when no allow policy matches and added denial audit records for policy-blocked revoke actions.

Validation passed:

- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm format`
- `pnpm backend:architecture:check`
- `pnpm i18n:boundaries:check`
- `pnpm db:schema:check`
- `pnpm db:validate`
- `pnpm check`
- `pnpm test:unit:target -- iam-engine`
- `pnpm test:affected`
- `pnpm test:smoke`
- `pnpm test:browser`

Notes:

- The local runtime uses the `@tetap/iam` demo/in-memory service so smoke tests can run without external infrastructure. Prisma IAM models, token/session contracts, and session invalidation rules are in place for the production PostgreSQL/Redis adapter layer.
- `web-admin` production build passes but Vite reports the existing chunk-size warning for the admin bundle.
