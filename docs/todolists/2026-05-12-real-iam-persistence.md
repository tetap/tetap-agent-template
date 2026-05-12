# Real IAM Persistence Todolist

Status: Open
Created: 2026-05-12
Task: Remove demo/mock IAM runtime mode and require backend/backend-admin plus tests to use real persisted IAM data.

## Execution Plan

- [x] Inspect current `ENABLE_DEMO_SEED`, `createDemoIamData`, in-memory IAM service creation, Prisma schema, and smoke tests.
- [ ] Add a Prisma-backed IAM persistence adapter and load backend IAM state from the database.
- [ ] Remove demo seed runtime configuration and rename test seed data to real test fixtures.
- [ ] Update backend/admin code, schemas, tests, README files, and architecture docs.
- [ ] Run Prisma, type, unit, smoke, browser, lint, format, and final checks.
- [ ] Commit and push to `origin/master`.

## Closure Notes

Pending.
