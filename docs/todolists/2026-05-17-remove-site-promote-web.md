# Remove Site Promote Web Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Remove the VitePress `apps/site` workspace and GitHub Pages deployment, then make `apps/web` the simple promotional landing page.

## Execution Plan

- [x] Inspect tracked `apps/site`, GitHub Pages, i18n, test mapping, and documentation references.
- [x] Remove `apps/site`, Pages workflow, and obsolete site i18n/test targets.
- [x] Replace the public web home page with a simple promotional landing page using `@tetap/ui` and public i18n.
- [x] Update workspace, README, architecture, testing, i18n, and agent guidance documentation.
- [x] Run install/lockfile update, formatting, targeted validation, React Doctor, and final gates.
- [x] Close this todolist with validation commands and results.

## Closure Notes

Removed the VitePress `apps/site` workspace, deleted the GitHub Pages workflow, removed the site i18n entrypoint and
`i18n-site` test target, and moved the public promotional landing page into `apps/web` with public i18n and Browser Mode
coverage.

Validation passed:

- `pnpm install --lockfile-only`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm --filter @tetap/i18n type-check`
- `pnpm --filter @tetap/hooks type-check`
- `pnpm --filter @tetap/test-automation type-check`
- `pnpm test:unit:target -- test-selection`
- `pnpm test:browser:target -- web-home`
- `npx -y react-doctor@latest . --verbose --diff`
- `pnpm check`
- `pnpm test:affected`
- `pnpm test:browser`
- `pnpm test:smoke`
- `pnpm --filter @tetap/test-automation build`
- `pnpm --filter web build`
- `pnpm lint`
- `pnpm format`
- `git diff --check`
