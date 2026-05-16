# Security Policy

## Supported Scope

Security reports may cover:

- Application runtimes under `apps/*`.
- Shared packages under `packages/*`.
- IAM, session, authorization, logging, and data-permission behavior.
- CI, release, dependency, and bootstrap workflows.
- Documentation that could cause unsafe production setup.

This template is versioned as source code. Unless a maintained release branch says otherwise, security fixes target the default branch first.

## Reporting A Vulnerability

Do not open a public issue for vulnerabilities, secrets, credentials, exploit chains, or private infrastructure details.

Use GitHub private vulnerability reporting or a private maintainer channel configured by your fork or organization. Include:

- Affected workspace, package, route, workflow, or document.
- Impact and realistic attack scenario.
- Minimal reproduction steps or proof of concept.
- Whether credentials, tokens, database URLs, customer data, or tenant data were exposed.
- Suggested remediation if known.

## Handling Expectations

Maintainers should:

1. Acknowledge the report privately.
2. Triage severity, affected versions, and exploitability.
3. Patch the issue without publishing exploit details.
4. Run relevant gates such as `pnpm check`, `pnpm test:smoke`, `pnpm test:browser`, and targeted IAM/security tests.
5. Publish an advisory or release note after a fix is available.

## Public Issue Rules

Public issues may discuss hardening ideas, dependency hygiene, or documentation improvements, but must not include:

- Live secrets, tokens, database URLs, cookies, session IDs, or private keys.
- Exploit payloads against real systems.
- Customer, tenant, or private infrastructure data.
- Unredacted logs containing credentials or personal data.
