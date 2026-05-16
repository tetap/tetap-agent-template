# CI Quality Gates Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Add a repository-level GitHub Actions quality gate so the template enforces enterprise delivery checks on pull requests and main branch pushes.

## Execution Plan

- [x] Inspect current workflow coverage and quality-gate documentation.
- [x] Add a GitHub Actions workflow for lint, format, type/unit, Browser Mode, smoke, and test package build gates.
- [x] Update README and architecture docs to describe the CI gate.
- [x] Run targeted validation for workflow and documentation changes.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Added `.github/workflows/quality-gates.yml` for pull requests, pushes to `master`, and manual dispatch. The workflow installs dependencies and Chromium, then runs lint, format, check, Browser Mode, smoke, and the test package build smoke gate.

Validation passed:

- `pnpm format:fix`
- `pnpm test:affected` executed; no mapped test target exists for workflow/docs-only changes.
- `pnpm check`
- `pnpm lint`
- `pnpm format`
- `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/quality-gates.yml'); YAML.load_file('.github/workflows/pages.yml'); puts 'workflow yaml ok'"`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm --filter @tetap/test-automation build`
