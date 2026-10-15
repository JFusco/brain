---
name: dev-workflow
description: Use when setting up the repo locally, running npm scripts, or understanding CI and contribution flow for kickstart-next-ssr.
---

# Dev workflow – kickstart-next-ssr

## When to use

- Cloning the repo and running the app for the first time
- Running build, dev server, or lint
- Knowing what GitHub Actions do (and do not do) for this project

## Instructions

### Prerequisites

- Node.js and npm (versions aligned with your org; this repo uses Next.js 16 and React 19 per [package.json](../../package.json))
- A Contentstack stack, delivery/preview tokens, and `.env` values as described in [README.md](../../README.md)

### Setup

1. Clone: repository URL is `https://github.com/contentstack/kickstart-next-ssr` (see [package.json](../../package.json) `repository.url`).
2. `npm install`
3. Copy or create `.env` / `.env.local` with the `NEXT_PUBLIC_*` variables from [README.md](../../README.md); never commit secrets.
4. `npm run dev` — serves the App Router app with hot reload.

### Common commands

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Production server (after `build`) |
| `npm run lint` | ESLint via `next lint` |

### CI and automation

- [.github/workflows/policy-scan.yml](../../.github/workflows/policy-scan.yml) — security policy / license checks on PRs (public repo expectations)
- [.github/workflows/sca-scan.yml](../../.github/workflows/sca-scan.yml) — software composition analysis
- [.github/workflows/issues-jira.yml](../../.github/workflows/issues-jira.yml) — issue automation

There is **no** workflow in this repo that runs `npm ci`, `npm run build`, or `npm run lint` by default. Use those commands locally before pushing when you change application code.

### Pull requests

Follow your organization’s branch and review rules. Keep changes scoped; update [README.md](../../README.md) if env vars or setup steps change.
