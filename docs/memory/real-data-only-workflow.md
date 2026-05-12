# Real Data Only Workflow Memory

## Trigger

Use this memory for every backend, admin, IAM, auth, menu, operation-log, session, permission, policy, and UI/API integration task.

## Hard Rules

- Do not add mock, demo, fallback, fake, placeholder, or hardcoded business data to runtime code.
- Do not reintroduce `ENABLE_DEMO_SEED`, `createDemoIamData`, app-local mock auth, or local fake menu/session/permission data.
- Admin and frontend UI must call real APIs. Component-level sample data is not allowed in runtime pages.
- Tests may use isolated fixtures only inside `test/automation`; fixtures must be named as test fixtures, never product demo data.
- If real data does not exist, fail clearly with a setup/persistence error instead of silently creating hidden defaults.
- For IAM and admin features, data must come from the backend persistence layer, and mutations must write through the backend API.

## Required Workflow

1. Search for existing fake-data patterns before changing IAM/admin code:

   ```sh
   rg -n "mock|demo|fake|placeholder|ENABLE_DEMO_SEED|createDemoIamData" apps packages test docs
   ```

2. If a feature needs initial data, implement an explicit seed/migration/admin bootstrap command, not runtime demo fallback.
3. If a UI page lacks data, render an empty state from the API response rather than local static rows.
4. Update README and architecture docs whenever a mock/demo path is removed or replaced by persistence.
5. Add or update tests with real API flows or test fixtures under `test/automation`.

## Completion Criteria

- Runtime code has no mock/demo/fallback business data.
- Backend/admin startup does not depend on hidden sample users, roles, menus, sessions, or policies.
- UI feature pages fetch scoped backend APIs and do not create local data copies.
- Documentation describes the real setup path for initial admin users and IAM resources.
