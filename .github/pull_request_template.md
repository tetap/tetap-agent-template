## Summary

<!-- Explain what changed and why. Keep the scope focused. -->

## Change Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Test or tooling
- [ ] Security hardening

## Boundary Checklist

- [ ] Apps only compose runtime/pages/routes; shared logic remains in `packages/*`.
- [ ] User-facing copy uses the correct scoped `@tetap/i18n/*` entrypoint.
- [ ] UI changes use shared `@tetap/ui` components and do not add app-local UI systems.
- [ ] Backend route files only register routes; logic stays in services/packages.
- [ ] Schemas/contracts live in `@tetap/schema` and use Zod.
- [ ] Runtime code does not introduce mock/demo/fallback business data.

## Validation

List exact commands and results.

- [ ] `pnpm test:affected` or a relevant `pnpm test:*:target` command
- [ ] `pnpm lint` or `pnpm lint:fix`
- [ ] `pnpm format` or `pnpm format:fix`
- [ ] `pnpm check`
- [ ] `pnpm test:browser` when UI behavior changed
- [ ] `pnpm test:smoke` when runtime/API/build integration changed
- [ ] `npx -y react-doctor@latest . --verbose --diff` when frontend-facing code changed

## Documentation

- [ ] Updated the nearest README or explained why no README changed.
- [ ] Updated architecture docs when boundaries, scripts, schemas, routes, exports, or behavior changed.
- [ ] Updated `docs/todolists` for multi-step work.

## Security And Data

- [ ] No secrets, tokens, database URLs, credentials, or exploit details are committed.
- [ ] No app-local `.env` files were added.
- [ ] IAM, sessions, menus, policies, and logs still come from real APIs/persistence.
