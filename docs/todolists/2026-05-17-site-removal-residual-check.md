# Site Removal Residual Check Todolist

Status: Closed
Created: 2026-05-17
Closed: 2026-05-17
Task: Re-check the removed site/GitHub Pages setup, clean any leftover VitePress references, and verify the public web promotional page remains the active frontend entry.

## Execution Plan

- [x] Confirm `apps/site`, GitHub Pages workflow, and site i18n entrypoint are absent.
- [x] Confirm `apps/web` owns the simple promotional landing page.
- [x] Remove stale VitePress/site tooling references.
- [x] Run targeted validation.
- [x] Close this todolist with validation results.

## Closure Notes

Confirmed `apps/site`, the GitHub Pages workflow, and `@tetap/i18n/site` are absent. `apps/web` remains the public
promotional landing page, and the stale `.vitepress/cache` ESLint ignore was removed.

Validation passed:

- `pnpm --filter web type-check`
- `pnpm --filter web lint`
- `pnpm test:browser:target -- web-home`
- `pnpm lint:fix`
- `pnpm check`
- `pnpm test:affected`
- `pnpm test:browser`
- `pnpm format`
- `git diff --check`
- `npx -y react-doctor@latest . --verbose --diff` reported 98/100 for the main diff; package-wide reports include
  pre-existing shadcn/ui and i18n follow-ups outside this cleanup.
