# Frontend React Doctor Workflow Memory

This persistent memory applies whenever an agent changes frontend-facing code, styles, copy wiring, or shared UI behavior.

## Rule Summary

After every frontend change, run `react-doctor` once, review its evaluation, and make reasonable optimization fixes before
handoff. This check complements, but does not replace, lint, format, type-check, Browser Mode, smoke, or targeted tests.

## Applies When

- Changing `apps/web`, `apps/web-admin`, or React-facing page/runtime code.
- Changing shared frontend packages such as `packages/ui`, `packages/hooks`, frontend form helpers, or frontend i18n usage.
- Changing frontend-facing styles, layout, interaction behavior, accessibility, or user-visible UI copy.

## Required Workflow

1. Finish the intended frontend implementation first.
2. Run the diff-scoped check from the repository root:

   ```sh
   npx -y react-doctor@latest . --verbose --diff
   ```

3. Read the reported score and issues. Confirm the score did not regress when the tool provides a baseline comparison.
4. Fix actionable issues from the report, prioritizing correctness, accessibility, security, performance, bundle size, dead
   code, and architecture diagnostics.
5. If a report item is a false positive, outside the task scope, or blocked by existing unrelated work, leave the code as-is
   and record that decision in the handoff.
6. If the command cannot run because the tool or network is unavailable, report the failure explicitly and continue with the
   normal repository validation gates.
7. After optimization, rerun only the validation needed for the touched frontend area, then continue with the standard final
   gates required by `docs/memory/testing-workflow.md` and `docs/Logical Architecture Diagram/02-quality-gates.md`.

## Component Composition Memory

- Keep app entry components such as `App.tsx` focused on provider/bootstrap composition.
- Do not collect many page, guard, fallback, or helper components inside one component file just because they are local to
  routing.
- Split route definitions, lazy-loaded page declarations, route guards, and loading fallbacks into focused modules, then
  import them into the entry component.
- Prefer file names that describe the responsibility, such as `admin-router.tsx`, `lazy-pages.ts`, `route-guards.tsx`, or
  `route-fallback.tsx`.
- Export React components through `memo(...)` by default unless there is a clear reason not to memoize.
- Functions declared inside React components must use `useCallback` so event handlers, render helpers, and effect-invoked
  callbacks have stable identities. If a function cannot be memoized cleanly, move it outside the component or document the
  exception in the handoff.

## Completion Criteria

A frontend handoff should state:

- The `react-doctor` command that was run.
- The resulting score or the fact that no score was emitted.
- Any fixes made because of the report.
- Any remaining report items intentionally left unresolved and why.
