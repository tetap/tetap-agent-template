# Site Polish Bugfix Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Improve the `apps/site` landing implementation, fix broken site interactions, and align the visual design with a professional technical documentation landing page.

## Execution Plan

- [x] Create this execution plan after checking existing todolists.
- [x] Fix site links, accessible labels, and user-visible copy ownership.
- [x] Restyle the landing page and stabilize responsive/scroll layouts.
- [x] Update site documentation and localized copy to match the new direction.
- [x] Run targeted validation, formatting, build, and visual smoke checks.
- [x] Close this todolist with validation results.

## Closure Notes

Closed after refreshing the VitePress landing visual system, fixing site documentation links and localized accessible labels, updating matching documentation, and validating the result.

Validation:

- `pnpm --filter site type-check`
- `pnpm test:unit:target -- i18n-site`
- `pnpm --filter site build`
- Local Playwright visual smoke against `http://127.0.0.1:4173/` at 1440x900, 768x1024, and 390x844: no console errors, no horizontal overflow, no overflowing button/code/tag text, and all internal anchors resolved.
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:browser`

Note: unrelated admin web/hooks working tree changes are present outside this site task and were left in place.
