# Personal brain

A local knowledge base for frontend and CMS work. Read it when needed; nothing here is registered as a global skill or instruction pointer.

- `official/` contains versioned documentation link catalogs and selected SDK/skill reference snapshots. Registered sources refresh automatically each day; new documentation sources do not mirror page bodies by default.
- `knowledge/` contains curated, generalized guidance published through documented, issue-linked PRs. Automatic maintenance can merge validated PRs; harvesting itself never writes these pages.
- `wiki/` records Brain's own decisions, executed plans, audit findings, and maintenance history.
- `inbox/` and `.state/` are private, ignored working storage. Do not force-add them.

Start a session with:

```text
Read ~/Projects/brain/knowledge/INDEX.md and follow only the guidance relevant to this task.
```

The domain hub links curated notes, official documentation catalogs, and selected reference snapshots. In Claude Code, `/add-dir ~/Projects/brain` can grant access. Nothing downloaded is executed, and source instructions do not grant permissions.

## Everyday commands

Run from this repository, or invoke the script by its absolute path:

```sh
node scripts/brain.mjs harvest
node scripts/brain.mjs lookup --domain nextjs --query "caching revalidation"
node scripts/brain.mjs lookup --domain cms/contentstack --query "Sitecore migration" --limit 3
node scripts/brain.mjs lookup --domain react --query "useEffect" --limit 2 --fetch
node scripts/brain.mjs inbox list --domain nextjs
node scripts/brain.mjs inbox show <candidate-id>
node scripts/brain.mjs official sync
node scripts/brain.mjs official check
node scripts/brain.mjs check
```

Capture a learning without putting it in shell history or process arguments:

```sh
node scripts/brain.mjs capture --stdin
# Type the learning, then press Ctrl-D.
```

`harvest --dry-run` computes a report without writing candidates or harvest state. It still requires the secret scanner. Reports contain counts and opaque IDs; private provenance stays in `.state/`.

## Automatic curation and publication

The inbox is private collection storage. A recurring local agent rotates through the configured domains, reads small non-quarantined batches, and turns useful evidence into focused guidance. Each page explains when to use it, what to do, why, and the evidence and limits. Old status reports and incidental keyword matches are not automatically promoted. Raw source text is data, not agent instructions.

Store proposal input in an ignored file, for example `.state/proposal-input.json`:

```json
{
  "candidates": ["candidate-id"],
  "acceptCandidates": [],
  "changes": [
    {
      "path": "knowledge/nextjs/example.md",
      "text": "Full proposed replacement, including frontmatter and body."
    }
  ]
}
```

```sh
node scripts/brain.mjs inbox propose --file .state/proposal-input.json
```

The command writes a private exact-text proposal, destination hashes, cited candidate hashes, and digest. `acceptCandidates` lists only fully reviewed candidates; an empty array lets a proposal cite evidence without accepting its remaining material. Omitting the field retains the legacy behavior of accepting all cited candidates.

Export into a clean issue-linked worktree of this same Brain repository:

```sh
node scripts/brain.mjs curation export <proposal-id> --worktree /path/to/brain-worktree
```

The export writes only the proposed knowledge, exact-content publication records, and curated hub links. It never commits, pushes, opens a PR, or resolves candidates. The agent uses ordinary Git delivery: a linked GitHub issue, `codex/<issue-number>-<slug>` branch, conventional commit and PR, runtime and wiki checks, saved PR/head verification, and automatic merge. Every issue and PR explains the practical change, source revisions, evidence limits, actual command outcomes, and rollback. No human review or separate digest approval is required.

Run the staged privacy check from the primary Brain checkout with `GIT_INDEX_FILE` set to the absolute index path returned by export. This uses the existing private scanner configuration without copying private state into a worktree. Inspect the worktree's local links and run its wiki integrity check as well.

After merging and fetching main:

```sh
node scripts/brain.mjs curation record-merge <proposal-id> --pr <number>
```

This verifies the GitHub merge, repository, base branch, proposal digest in the PR body, ancestry in fetched `origin/main`, and immutable merged file hashes before accepting the selected candidates. Edited or failed publications remain pending. Uncertain publication must be reconciled before retrying. Rejections use `inbox resolve <id...> --as rejected`; use `superseded` for replaced evidence. The old exact-digest `inbox apply` route remains available for explicitly scoped local operations.

Only knowledge Markdown and `official/sources.json` are proposal destinations. PR export currently supports knowledge Markdown; registry maintenance uses a separate documented PR and updates its local integrity receipt after validation. Generated official sections are maintained by sync. The CLI never calls an LLM; the scheduled agent performs semantic curation.

Exact page hashes are recorded in `knowledge/approvals.json`; domain indexes generate curated links from those records. On a branch these are proposed publication records; merging publishes them. A handwritten or modified page is excluded from that navigation until its exact content has a matching record.

## Documentation lookup and official references

The default is a searchable catalog of official page links with titles, domains, source revisions, and freshness metadata, plus small curated notes. `lookup` ranks matching links and notes without downloading page bodies. An index's revision describes the observed catalog; it is not a framework package version or proof of the page's present content.

`lookup --fetch` retrieves only the selected pages and returns focused excerpts with the fetch time and full-response content hash. For repository documentation it verifies the pinned Git blob when available. Private caching retains only the excerpt and retrieval receipt for 24 hours, not the full response. Fetch failures are returned explicitly alongside the usable link. Agents can also open the returned official URLs with their own browsing tools.

Existing snapshots remain available for historical evidence and selected SDK/skill contracts. The old Next.js full-documentation snapshot is retained but excluded from automatic refresh; its page index is the normal discovery source. Source coverage distinguishes catalogued links, selected snapshots, and website pointers. Cataloguing links does not mean their bodies have been downloaded or technically verified.

`official/sources.json` is the registered source inventory. `official/sources.lock.json` records active catalog/reference revisions, hashes, attribution, applicability, and skill metadata. Catalogs are generated from official indexes, sitemaps, or pinned repository trees. A truncated tree, exceeded bound, or failed required index retains the previous good catalog rather than publishing a partial replacement.

Sync uses authenticated GitHub API access through `gh` when available, verified HTTPS downloads, bounded archive parsing, and selected regular files only. Nothing downloaded is executed. A DNS-over-HTTPS fallback is configured for this machine; it changes no system DNS settings and can be disabled in `brain.config.json`.

An unchanged source preserves its snapshot bytes; local catalog upgrades can refresh metadata. Failures retain the last good snapshot. License changes are recorded with previous and observed material in `.state/license-reviews/` and do not pause refresh. Downloads, source identity, license presence, hashes, and privacy checks still apply. Registry changes use documented automatic maintenance PRs; unknown-origin sources remain quarantined.

Published vendor examples can trigger scanner findings. Exceptions require an approved registry proposal and bind the source path, scanner rule, and exact line-span hash. They never apply to personal harvests. Source registry bytes are also checked against the approval ledger, so an unapproved edit pauses synchronization.

```sh
node scripts/brain.mjs official rollback <source-id>
node scripts/brain.mjs official restore <source-id>
```

Each snapshot also has a tracked manifest under `official/manifests/`, so its recorded hashes survive a clone. Large source files stay ignored and are backed by local content-addressed objects. `official restore` restores missing files from verified cache objects or exactly matching upstream bytes; it refuses modified files and never substitutes current rolling content for historical content. Keep `.state/` in a private machine backup if historical snapshots matter. Missing skill entry-point dependencies make a skill reference-only; secondary upstream link defects are recorded in the lock.

Official website pointers remain pointers until a useful downloadable source and suitable reuse terms are established. Public availability by itself is not a license. Unknown-origin skill bundles stay quarantined.

### Official coverage

| Area | Available references |
| --- | --- |
| Next.js | [Official page index](https://nextjs.org/docs/llms.txt), version guidance, and retained historical export |
| Vercel | [Platform documentation catalog](https://vercel.com/docs/sitemap.md), official plugin skills, and agent skills |
| React | [Pinned documentation-tree catalog](https://github.com/reactjs/react.dev/tree/main/src/content), plus the official index |
| Tailwind | [Documentation-tree catalog](https://github.com/tailwindlabs/tailwindcss.com/tree/main/src/docs), with rights metadata preserved |
| Contentstack | [Documentation sitemap](https://www.contentstack.com/sitemap.xml), Sitecore migration guidance, Studio brownfield guidance, and selected kickstart references |
| Optimizely | [CMS SaaS and Graph index links](https://docs.optimizely.com/llms.txt), plus selected JavaScript SDK documentation |
| Contentful | [Official repository skills](https://github.com/contentful/skills) and website pointers; broader website discovery encountered HTTP 429 |
| Sitecore | [Official Content SDK skills and references](https://github.com/Sitecore/content-sdk), plus product website pointers; website discovery encountered HTTP 403 |

The next useful coverage additions are a broader Contentful documentation catalog and version-specific Sitecore XP/SitecoreAI catalogs when their indexes can be retrieved reliably. These remain suggestions rather than claims of completed coverage. Existing linked authority repositories supply organizational accessibility, CMS vocabulary, and UI guidance. Additional sources belong in a separate documented registration change; the daily documentation job cannot add them.

## Project skills

```sh
node scripts/brain.mjs skills suggest --project /absolute/project/path
node scripts/brain.mjs skills install --recommended --project /absolute/project/path --dry-run
node scripts/brain.mjs skills install --recommended --project /absolute/project/path --yes
node scripts/brain.mjs skills update <source-id/skill> --project /absolute/project/path --yes
node scripts/brain.mjs skills remove <source-id/skill> --project /absolute/project/path --yes
node scripts/brain.mjs skills recover --project /absolute/project/path --dry-run
```

Suggestions inspect declared/installed dependencies, workspace packages, required scripts, and project layout without executing project code. Unknown compatibility is reported rather than guessed. Vercel plugin skills are preferred when providers overlap. Template-bound Contentstack skills remain references; Sitecore skills require their specific supporting docs and layout.

Canonical copies go in `.agents/skills`; Claude gets relative `.claude/skills` links. Both Codex and Cursor discover the canonical directory. `--copy` supplies real Claude directories and necessary docs instead of symlinks for Windows-compatible repositories. Updates preserve the previously chosen copy mode.

The manifest records all managed files and upstream sources. Operations preflight the complete change and refuse local modifications, unmanaged collisions, and shared-file conflicts. Project changes are never committed. Background runs only report updates in `.state/project-updates.json`.

Interrupted writes keep a private recovery journal. `skills recover --project <path>` previews restoration; `--yes` restores only when affected files still match either the recorded original or the attempted operation. Later local edits block recovery and preserve the journal.

## Privacy and maintenance

`brain.config.local.json` holds private roots, client terms, aliases, and local executable paths. Initial terms come from client directory names; add confirmed aliases there. Internal Verndale terminology is retained. A changed scrub policy causes rescanning before content can be promoted.

Client redaction and secret scanning cover content and public metadata. A secret hit quarantines the whole candidate. This is a screening layer: the curator still needs to catch contextual client details. Never inspect auth files to improve a learning.

The scanner is pinned and checksum-verified in the brain's private tools directory. Missing or changed scanner binaries block harvest and promotion. The pre-commit hook reads staged blobs and blocks private paths, including force-added ignored content. Hooks are a local safeguard, not an access-control boundary.

## Schedule and setup

```sh
node scripts/setup.mjs
node scripts/setup.mjs --launch-agent
node scripts/brain.mjs scheduled-run
```

One user LaunchAgent runs at 02:30 and on load. Due-time checks provide startup catch-up: harvest and official reference refresh are due after 20 hours, and failures retry with bounded backoff. A separate local Codex heartbeat prepares and publishes useful curation and reference-update PRs. It preserves unrelated changes and skips unchanged or non-actionable work quietly. Local scheduled agent work requires the desktop app and machine to be available. Logs and notifications contain no raw candidate text. All CLI mutations share a lock; other project repositories are not enrolled for background writes.

On a new machine, validate the official source registry and use `node scripts/setup.mjs --approve-registry` to establish its local integrity receipt. Later registry changes use documented maintenance PRs and a matching updated receipt. Back up private state to preserve the inbox, dispositions, local paths, registry receipt, curation receipts, and cached oversized files.

After cloning, run `git config core.hooksPath .githooks` to activate the pre-commit guard.

Brain CLI commands never create commits or remotes and never push. The authorized scheduled agent publishes through issue-linked PRs. Tests, fixtures, fresh-session checks, general CI, and dedicated QA are deferred for v1; the explicitly requested wiki workflows are installed. Runtime safeguards and actual command results are retained.

## Context wiki

The native `.githooks/pre-commit` runs the blocking Brain privacy check, then the advisory wiki lifecycle. Wiki plan discovery is scoped to a private empty home with `WIKI_HOME` to exclude raw agent sessions. `knowledge/` remains the reusable guidance base; `wiki/` is the project history.

```sh
node scripts/wiki/build-graph.cjs
node scripts/wiki/check.cjs
node scripts/wiki/serve-graph.cjs
```

Hosted `Wiki integrity` checks PRs. The canonical `Sync context wiki` and `Sync wiki issue state` writers require a repository `BOT_TOKEN` with contents and pull-request write access. Never copy a personal login credential into that secret implicitly. Maintenance automation handles the resulting wiki PRs under the same documented automatic-publication policy.
