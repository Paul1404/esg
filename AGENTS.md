# Repository guidance

This is the canonical instruction file for this repository. Claude Code loads it through
`CLAUDE.md`.

## Start here

- Inspect branch, upstream divergence, status, and diff before editing.
- Preserve pre-existing changes and keep unrelated work out of the patch.
- Use the repository's existing runtime, package manager, framework, and deployment model.
- Do not refactor an existing project into the preferred new-project stack unless explicitly requested.
- Verify current documentation before changing version-dependent dependencies or hosting behavior.

## Project

ESG is a cross-client email-signature builder for Outlook, Gmail, Apple Mail, and other clients.

It uses Next.js, React, TypeScript, Prisma, PostgreSQL, S3-compatible storage, npm, Docker, and Railway.

## Project rules

- Use npm and preserve `package-lock.json`.
- Do not migrate the existing Next.js and Prisma architecture as unrelated cleanup.
- Email HTML must remain table-based, inline-styled, and compatible with Outlook's Word renderer.
- Preserve MSO conditionals, VML, explicit image dimensions, and dark-mode handling.
- Strip image metadata and validate uploads on the server.

## Commands

- `npm run lint`: lint
- `npm run build`: Prisma generation and production build
- `npm run dev`: local development

## Verification

Run the relevant checks and exercise the affected workflow, endpoint, or generated artifact.
State clearly when authenticated, database, deployment, or live verification was not possible.

## Maintaining instructions

Update `AGENTS.md` when verified, durable repository behavior changes. Keep it concise and
move detailed explanations into `docs/`. Keep `CLAUDE.md` as the compatibility import
unless Claude-specific guidance is genuinely required.
