# Site Scroll Story Overlap Todolist

Status: Closed
Created: 2026-05-11
Closed: 2026-05-11
Task: Fix the `apps/site` continuous scroll story layout so sticky copy does not obscure scrolling chapter cards.

## Execution Plan

- [x] Inspect the scroll story layout and reproduce the overlap risk.
- [x] Adjust the desktop scroll story CSS so sticky stage/copy and chapter cards have separate visual space.
- [x] Run formatting and targeted site validation.
- [x] Close this todolist with validation results.

## Closure Notes

Closed after moving the scroll chapters into the same desktop grid as the story copy and animation stage. The copy now
scrolls away naturally while the right-side animation stage remains sticky, so chapter cards no longer pass through the
`Continuous story` text area.

Validation:

- `pnpm --filter site type-check`
- `pnpm test:unit:target -- i18n-site`
- `pnpm --filter site build`
- `pnpm lint:fix`
- `pnpm format:fix`
- `pnpm check`
- `pnpm test:affected`
- Playwright visual geometry check at 1440x1000, 768x900, and 390x844: max copy/card overlap `0`, max stage/card
  overlap `0`, and no horizontal overflow.
