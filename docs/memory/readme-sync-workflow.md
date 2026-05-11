# README Sync Memory

This persistent memory applies whenever an agent changes code, package exports, public APIs, workspace structure, scripts, env keys, Prisma models, shared UI components, i18n scopes, or user-facing admin behavior.

## Rule Summary

Every implementation change must leave the nearest README and architecture docs accurate. Do not treat documentation as a separate cleanup phase. If a package adds, removes, or renames an export, tool, method, route, model, script, or UI primitive, update that package README in the same task.

Treat "README", "readme", and user typos such as "remade" as the same documentation-sync request.

## Required Workflow

1. Identify the owner workspace for the change.
2. Open the owner README before editing or before handoff.
3. Update the README sections that describe:
   - current responsibility and boundaries,
   - public entrypoints and exported helpers,
   - package tools, service methods, store actions, UI primitives, schema groups, and direct subpath exports,
   - scripts and validation commands,
   - API routes, Prisma models, UI primitives, hooks, i18n scopes, or schema contracts affected by the change.
4. For packages, compare README content against `package.json#exports`, `src/index.ts`, important subpath files, and any exported service class methods before handoff.
5. If the change affects repository-wide behavior, update root `README.md`, localized README files, `AGENTS.md`, and the relevant architecture doc under `docs/Logical Architecture Diagram`.
6. If the change affects future agent workflow, update or add a memory under `docs/memory` and link it from `docs/memory/README.md` and `AGENTS.md`.
7. Run formatting after README changes.
8. Record documentation updates and validation commands in the matching `docs/todolists` closure notes.

## Completion Criteria

- The package/app README accurately answers what the workspace owns, what it must not own, which entrypoints/routes/components/scripts exist, and which validation commands apply.
- Root documentation no longer mentions removed concepts such as stale APIs, removed menu items, or old terminology.
- Multilingual README files match the English root README in structure and meaning.
