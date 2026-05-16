# Contribution Governance Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Add enterprise contribution governance assets for pull requests, issue intake, and security reporting.

## Execution Plan

- [x] Inspect current `.github` governance assets and README contribution guidance.
- [x] Add a pull request template aligned with repository quality gates.
- [x] Add structured bug and feature issue forms.
- [x] Add a security reporting policy for private vulnerability disclosure.
- [x] Update README references for contribution and security workflow.
- [x] Run formatting and relevant validation gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Validation completed:

- `pnpm format:fix` passed.
- YAML parse check for `.github/**/*.yml` passed.
- `pnpm test:affected` executed and reported no mapped tests for docs/workflow-only changes; not used as the sole validation gate.
- `pnpm lint` passed.
- `pnpm format` passed.
- `pnpm check` passed.
- `pnpm test:browser` passed.
- `pnpm test:smoke` passed.
- `pnpm --filter @tetap/test-automation build` passed.
- `git diff --check` passed.
