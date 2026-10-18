# Personal brain

A local knowledge base for frontend and CMS work. Use it on demand through the opt-in `brain` skill; nothing loads into a session unless you invoke it.

- `official/` contains versioned documentation link catalogs and selected SDK/skill reference snapshots. Registered sources refresh automatically each day; new documentation sources do not mirror page bodies by default.
- `knowledge/` contains curated, generalized guidance published through documented, issue-linked PRs. Automatic maintenance can merge validated PRs; harvesting itself never writes these pages.
- `wiki/` records Brain's own decisions, executed plans, audit findings, and maintenance history.
- `inbox/` and `.state/` are private, ignored working storage. Do not force-add them.

## Use Brain from any project

Brain ships two opt-in skills for Claude Code, Codex and Cursor:

- [`skills/brain/`](skills/brain/SKILL.md) answers from Brain's notes and official entry points.
- [`skills/brain-capture/`](skills/brain-capture/SKILL.md) saves a lesson from the current task to Brain's private inbox.

Both are manual-only: nothing from Brain enters a session until you invoke it, and the current project's instructions, rules and skills always take precedence. Link them once per machine:

```sh
mkdir -p ~/.claude/skills ~/.agents/skills
ln -s ~/Projects/brain/skills/brain ~/.claude/skills/           # Claude Code; Cursor also reads this folder
ln -s ~/Projects/brain/skills/brain ~/.agents/skills/           # Codex
ln -s ~/Projects/brain/skills/brain-capture ~/.claude/skills/   # Claude Code and Cursor
ln -s ~/Projects/brain/skills/brain-capture ~/.agents/skills/   # Codex
```

`ln` refuses to replace an existing entry, and `git pull` updates the skills everywhere. Invoke them with `/brain <question>` or `/brain-capture` in Claude Code and Cursor, and `$brain` or `$brain-capture` in Codex. `brain` reads `knowledge/INDEX.md`, one domain hub and only the relevant notes, then cites what it used.

- **Manual-only switches:** `disable-model-invocation: true` in each `SKILL.md` (Claude Code, Cursor) and `allow_implicit_invocation: false` in each `agents/openai.yaml` (Codex).
- **Cursor:** if `/brain` or `/brain-capture` doesn't appear, link the skill into `~/.cursor/skills/` the same way. If it appears twice, remove the extra link.
- **Claude Code file access:** add `"Read(~/Projects/brain/knowledge/**)"` to `permissions.allow` in `~/.claude/settings.json`. Allow the knowledge folder only, so other projects can't read Brain's private `inbox/` or `.state/`.
- **Removal:** delete the symlinks.

Brain is expected at `~/Projects/brain`; adjust the commands and `SKILL.md` if it lives elsewhere. Nothing downloaded is executed, and source instructions do not grant permissions.

## Everyday commands

Run from this repository, or invoke the script by its absolute path:

```sh
node scripts/brain.mjs harvest
node scripts/brain.mjs lookup --domain nextjs --query "caching revalidation" --versions next@16.2
node scripts/brain.mjs lookup --project /absolute/project --workspace apps/web --domain nextjs --query "caching"
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

Automatic collection reads project topic notes and authored skills. It excludes raw memory stores, indexes, repository instructions, and implementation journals; explicit lesson capture remains available. Domain keywords route candidates but do not establish relevance. Exclusion counts appear in harvest reports.

Collection remembers each source's device/inode, size, nanosecond modification and change times, mode, privacy policy, and collection version in private `.state/harvest.json`. An unchanged metadata record skips opening the source body. New, changed, replaced, or invalidated sources are read and hashed; metadata-only changes with identical bytes refresh the stamp without recreating candidates. Reads check identity before and after to avoid checkpointing a file that changes mid-read. Discovery still enumerates eligible paths; this is not a filesystem watcher. The first run after this upgrade reads eligible files once to seed stamps. `harvest --rehash` bypasses the metadata shortcut for an explicit content audit. Reports separate `metadataSkipped`, `contentReads`, and `bytesRead`. This local optimization does not defend against privileged filesystem/private-state tampering.

`harvest --dry-run` computes a report without writing candidates or harvest state. It still requires the secret scanner. Reports contain counts and opaque IDs; private provenance stays in `.state/`. See [implementation status](STATUS.md) for current local verification and [maintenance history](wiki/topics/automatic-knowledge-maintenance.md) for dated evidence.

## Capture lessons from working chats

Posting advice in a chat does not automatically save it in Brain. The optional project integration instructs Codex, Claude, and Cursor to submit concise lessons at meaningful planning, investigation, and implementation checkpoints. It does not read chat histories or install global instructions. Agent execution, sandbox access, and uninterrupted sessions are still required; this is not a guaranteed end-of-chat hook.

Enrollment is explicit for each Git repository and does not require `package.json`. Run these commands from Brain; installation and removal preview by default:

```sh
node scripts/brain.mjs integration install --project /absolute/project
node scripts/brain.mjs integration install --project /absolute/project --yes
node scripts/brain.mjs integration status --project /absolute/project
node scripts/brain.mjs integration remove --project /absolute/project
node scripts/brain.mjs integration remove --project /absolute/project --yes
node scripts/brain.mjs integration recover --project /absolute/project
```

Repeat `install` to update unchanged owned integration content. `--dry-run` always prevents writes, even with `--yes`. Interrupted operations retain a private recovery journal in Brain; inspect the recovery preview and use `recover --yes` to restore the prior content. Recovery refuses later edits. It also refuses to remove the new ignore rule if an interrupted initial installation has already collected private queue/receipt evidence.

Installation appends managed blocks to root `AGENTS.md`, `CLAUDE.md`, and `.gitignore`, and creates shared instructions/helper files in `.agents/brain-capture/` plus an always-applied `.cursor/rules/brain-capture.mdc`. Claude imports the shared instructions; Codex and Cursor are directed to read them. The installer refuses symlinks, conflicting unmanaged files/markers, and changed or missing owned content. A nonempty root `AGENTS.override.md` must be reconciled first because it shadows the Codex adapter. Nested agent overrides and instruction size limits can still affect coverage. Nothing is committed automatically.

Adapters follow the documented [Codex project instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Claude project imports](https://code.claude.com/docs/en/memory), and [Cursor project rules](https://cursor.com/docs/rules). Their file formats are not evidence that a live agent actually followed the capture instruction.

The integration asks agents to capture at most three useful new lessons per checkpoint, labeling documented facts, observed results, and proposed practices. Untried recommendations are eligible when their limits are clear. Versions belong to the selected application, never a union of sibling workspaces. Use sanitized references; omit client names, private paths, credentials, proprietary excerpts, and transcripts. Private machine configuration, ownership records, queued lessons, and receipts stay under ignored `.brain-capture/` with restrictive permissions. Agent-prepared queued text is not yet verified by Brain's scanner.

From an enrolled project's root, the helper accepts lesson text on stdin and retries up to three queued records:

```sh
node .agents/brain-capture/submit.mjs flush
node .agents/brain-capture/submit.mjs submit --domain tailwind <<'LESSON'
# Describe a reusable decision

Applicability: Name the task, application workspace, and confirmed versions.

Proposed practice: Explain the action and why it helps.

Evidence: Cite the official source or sanitized observation. Separate documented facts from observed results.

Limits: State what was not checked and when the advice does not apply.
LESSON
```

Available domains and the candidate byte limit are in the private configuration. The helper queues exact bytes before calling Brain's existing locked, scanned `capture --stdin --domain <domain>` command. Legacy `capture --stdin` still infers a domain. Explicit domains are validated and participate in duplicate identity. Queue and receipt hashes detect changed records; exact duplicates are suppressed locally and by Brain. Semantic overlap is handled during curation.

`saved` means a pending inbox receipt was observed, not publication. `queued` means delivery is unconfirmed and the exact bytes remain for a later checkpoint. `quarantined` means Brain retained restricted material; it is not retried automatically or exposed. `retained` means queue/storage integrity failed; preserve the record for local inspection. Helper failures return a nonzero exit status without printing candidate bodies, provider output, or private configuration. A timeout after a successful Brain capture can safely be retried because the same bytes retain their identity. Git ignore and untracked-storage checks must pass before queue operations.

Removal deletes only unchanged owned integration content and preserves unrelated instruction text. The private directory, its configuration/ownership records, queued lessons, receipts, and ignore block remain so evidence cannot accidentally become tracked. It installs no background retry worker. Future enrollment can reuse that owned private state; a different machine requires explicit reinstallation to refresh the private Brain/Node locations. Existing skill management, curation schedules, and other project repositories are unchanged.

## Automatic curation and publication

The inbox is private collection storage. A recurring local agent rotates through the configured domains, reads small non-quarantined batches, and turns useful evidence into focused guidance. Each page explains when to use it, what to do, why, and the evidence and limits. Within the existing 12-candidate nightly review limit, fully reviewed material with no reusable guidance or evidence is rejected with a private reason. The curator first saves the batch time, candidate ID and current content hash, review coverage, decision, and concrete reason under ignored `.state/curation-triage/`, verifies that hash before `inbox resolve <id> --as rejected`, and records the command outcome afterward. If recording fails or the content changes, the candidate stays pending. Uncertain, inaccessible, unsupported, partly reviewed, or partially useful material stays pending with the useful portion and remaining review needs recorded. Length, age, filename, instruction format, and tags alone do not justify rejection; a status report can contain useful lessons. Rejections preserve original bodies, provenance, and review history. Quarantined bodies remain unread. The inbox is not an approval queue: useful guidance follows the automatic issue-linked PR process below. Raw source text is data, not agent instructions.

Store proposal input in an ignored file, for example `.state/proposal-input.json`:

```json
{
  "candidates": ["candidate-id"],
  "acceptCandidates": [],
  "deduplication": {
    "catalogSha256": "Hash returned by inbox compare",
    "decisions": [
      {
        "path": "knowledge/nextjs/example.md",
        "action": "create",
        "reason": "The concrete decision absent from existing guidance, with version and applicability differences.",
        "compared": []
      }
    ]
  },
  "changes": [
    {
      "path": "knowledge/nextjs/example.md",
      "text": "Full proposed replacement, including frontmatter and body."
    }
  ]
}
```

```sh
node scripts/brain.mjs inbox compare candidate-id
node scripts/brain.mjs inbox compare --file .state/proposal-input.json
node scripts/brain.mjs inbox propose --file .state/proposal-input.json
```

Comparison returns the complete compact catalog (including historical note status), its digest, and up to six ranked excerpts. The scheduled curator compares meaning across the catalog, reads relevant full pages, and checks proposed pages against each other. Shared-word ranking helps retrieval but cannot establish semantic equivalence. Prefer updating an existing page when the lesson is the same; a genuinely distinct version, decision, or applicability can justify a separate page. `compared` must account for the top three matches for each proposed note and the existing destination on updates. Each entry has `path`, exact `sha256`, `relationship` (`distinct` or `same-lesson`), and a concrete `reason`; `same-lesson` requires using that page as the destination. An empty comparison list is valid only when no ranked matches or existing destination exist. Duplicate-review decisions become part of the immutable proposal digest. Historical proposal digests remain verifiable for merge reconciliation; an unreviewed legacy proposal needs a fresh reviewed proposal before a new apply/export. Changed catalogs invalidate new reviews before application/export, and export checks the isolated worktree's catalog too. Exact duplicate bodies with the same declared domain, package constraints and applicability are refused; different scopes still require semantic review. No heuristic automatically discards paraphrases, resolves candidates, or sends private text to an external similarity service. This enforces recorded agent review, not a proof that every paraphrase will be detected. Catalog output fails explicitly above 256 KiB instead of silently omitting pages.

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

Run `curation stale --limit 12` before selecting new material. A changed source revision or a 30-day review date queues the note for claim verification; neither proves that its advice changed. Re-read the relevant official pages, keep the evidence and limits, and publish the revised note through the same exact-content proposal. Optional `review_after` selects an earlier review date. Set `status: retired` when advice should no longer be recommended, or `status: superseded` with a published `superseded_by` path when a replacement exists. These pages remain in history but leave lookup and curated hub recommendations.

Only knowledge Markdown and `official/sources.json` are proposal destinations. PR export currently supports knowledge Markdown; registry maintenance uses a separate documented PR that also updates the matching policy hashes in `official/sources.lock.json`. Generated official sections are maintained by sync. The CLI never calls an LLM; the scheduled agent performs semantic curation.

Exact page hashes are recorded in `knowledge/approvals.json`; domain indexes generate curated links from those records. On a branch these are proposed publication records; merging publishes them. A handwritten or modified page is excluded from that navigation until its exact content has a matching record.

## Documentation lookup and official references

The default is a searchable catalog of official page links with titles, domains, source revisions, and freshness metadata, plus small curated notes. `lookup` ranks matching links and notes without downloading page bodies. An index's revision describes the observed catalog; it is not a framework package version or proof of the page's present content.

`lookup --fetch` retrieves only the selected pages and returns focused excerpts with the fetch time and full-response content hash. For repository documentation it verifies the pinned Git blob when available. Private caching retains only the excerpt and retrieval receipt for 24 hours, not the full response. Managed excerpts are capped at 1,000 files / 8 MiB. Cleanup deletes only unchanged files owned by the cache ledger; legacy, unowned, or modified files and all source objects remain intact. Fetch failures are returned explicitly alongside the usable link. Agents can also open the returned official URLs with their own browsing tools.

Add `--project /absolute/project --workspace apps/web` to resolve the selected application’s installed dependencies, or use explicit literals such as `--versions next@16.2,react@19`. Brain reads bounded manifests without executing project code. It does not combine sibling workspaces. A monorepo root requires an explicit application workspace for skill operations; lookup reports that selection is still needed. When present, the selected Next.js package’s bundled docs are searched first. No instructions are injected into consuming projects.

Curated `versions` support only `package@major[.minor.patch]` and `package@>=version`. Incompatible notes are excluded; missing, partial, complex, or prerelease versions remain unconfirmed where they cannot establish the constraint. Rolling official catalogs are not labeled version-compatible merely because a package was detected.

Existing snapshots remain available for historical evidence and selected SDK/skill contracts. The old Next.js full-documentation snapshot is retained but excluded from automatic refresh; its page index is the normal discovery source. Source coverage distinguishes catalogued links, selected snapshots, and website pointers. Cataloguing links does not mean their bodies have been downloaded or technically verified.

`official/sources.json` is the registered source inventory. `official/sources.lock.json` records active catalog/reference revisions, hashes, attribution, applicability, and skill metadata. Catalogs are generated from official indexes, sitemaps, or pinned repository trees. A truncated tree, exceeded bound, or failed required index retains the previous good catalog rather than publishing a partial replacement.

Sync uses authenticated GitHub API access through `gh` when available, verified HTTPS downloads, bounded archive parsing, and selected regular files only. Nothing downloaded is executed. A DNS-over-HTTPS fallback is configured for this machine; it changes no system DNS settings and can be disabled in `brain.config.json`.

An unchanged source preserves its snapshot bytes; local catalog upgrades can refresh metadata. Failures retain the last good snapshot. License changes are recorded with previous and observed material in `.state/license-reviews/` and do not pause refresh. Downloads, source identity, license presence, hashes, and privacy checks still apply. Registry changes use documented automatic maintenance PRs; unknown-origin sources remain quarantined.

Published vendor examples can trigger scanner findings. Exceptions require an approved registry proposal and bind the source path, scanner rule, and exact line-span hash. They never apply to personal harvests. Each registered source must also match its policy hash in `official/sources.lock.json`; a registry edit without the matching lock update fails `official check` and `official restore`.

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
| Sitecore | [Official Content SDK skills and references](https://github.com/Sitecore/content-sdk), plus canonical product website pointers; earlier HEAD restrictions remain historical evidence |

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

Suggestions inspect only the selected application’s declared/installed dependencies, required scripts, and project layout without executing project code. In a monorepo add `--workspace apps/web` to each command. Installed versions and declared-only ranges have distinct confidence labels. Unknown compatibility is reported rather than guessed. Vercel plugin skills are preferred when providers overlap. Template-bound Contentstack skills remain references; Sitecore skills require their specific supporting docs and layout.

Canonical copies go in `.agents/skills`; Claude gets relative `.claude/skills` links. Both Codex and Cursor discover the canonical directory. `--copy` supplies real Claude directories and necessary docs instead of symlinks for Windows-compatible repositories. Updates preserve the previously chosen copy mode.

The manifest records all managed files and upstream sources. Operations preflight the complete change and refuse local modifications, unmanaged collisions, and shared-file conflicts. Project changes are never committed. Background runs only report updates in `.state/project-updates.json`.

Interrupted writes keep a private recovery journal. `skills recover --project <path>` previews restoration; `--yes` restores only when affected files still match either the recorded original or the attempted operation. Later local edits block recovery and preserve the journal.

## Privacy and maintenance

Official-reference refresh, bounded link investigation/publication and completion-linked verification run in [GitHub Actions](https://github.com/JFusco/brain/actions/workflows/brain-maintenance.yml) at 03:15 America/New_York or by manual dispatch; a separate hosted check at 04:00 verifies the day’s actual scheduled run. They use GitHub-hosted runners, with `BOT_TOKEN` only in the guarded writer and `OPENAI_API_KEY` only in the investigator action. [Hosted maintenance](wiki/topics/hosted-maintenance.md) documents scope, evidence, operational artifacts, cache limits and rollback. Private project collection and unpublished learning curation stay local and are not uploaded.

`brain.config.local.json` holds private roots, client terms, aliases, and local executable paths. Initial terms come from client directory names; add confirmed aliases there. Internal Verndale terminology is retained. A changed scrub policy causes rescanning before content can be promoted.

Client redaction and secret scanning cover content and public metadata. A secret hit quarantines the whole candidate. This is a screening layer: the curator still needs to catch contextual client details. Never inspect auth files to improve a learning.

The scanner is pinned and checksum-verified in the brain's private tools directory. Missing or changed scanner binaries block harvest and promotion. The pre-commit hook reads staged blobs and blocks private paths, including force-added ignored content. Hooks are a local safeguard, not an access-control boundary.

## Maintenance

```sh
node scripts/brain.mjs curation stale --limit 12
node scripts/brain.mjs links check --limit 24
node scripts/brain.mjs links check --retry-failures --limit 25
node scripts/brain.mjs links check --source website-pointers --limit 8
node scripts/brain.mjs links status
node scripts/brain.mjs maintenance status
node scripts/brain.mjs maintenance run --dry-run
node scripts/brain.mjs maintenance run
node scripts/brain.mjs maintenance cleanup
node scripts/brain.mjs maintenance cleanup --yes
```

Link checks rotate through a bounded sample (24 by default, maximum 100), favoring published-note and recently fetched references while spreading work across sources. They request headers with an explicit documentation-compatible Accept header. A HEAD 403, 405 or 501 receives one GET fallback with a one-byte range request; response bodies are discarded immediately. Final request method and original HEAD status remain recorded, and a GET access error remains an access error. The implicit `website-pointers` source can be checked separately under the same bounds. A first 404 is suspected dead, two daily observations establish dead, and 410 is immediately dead. Access restrictions, rate limits, redirects, and network failures remain separate. Failed observations can retry after their recorded backoff; healthy samples and 404/410 observations retain the daily window. Due failures take priority within each source bucket. `--retry-failures` checks only due warnings under the same batch/host bounds. Previous observations are saved privately under `.state/link-health-history/` before replacement, so recovery clears current warnings without erasing failures. Checks never rewrite a registration. Coverage counts distinguish sampled links from the full catalog; this is not an exhaustive link audit. Approved-host boundaries also apply to redirects.

The existing daily publisher also follows the [link-warning investigation runbook](wiki/topics/link-warning-investigation.md): up to 12 new/due warning URLs, verified official alternatives, private evidence/dispositions, and narrow existing-reference routing repairs through its single checked issue-linked PR. Unchanged unresolved warnings stay visible without duplicate daily alerts or issues. The agent performs investigation; the CLI checker and its backoff are unchanged.

`maintenance run` refreshes the stale-note queue, cleans owned excerpt receipts, and samples links when due. Status shows collection/publication attempts and success separately, source failures, unfinished publication, link coverage, and stale notes. A completed unchanged publication run is valid; an attempt alone is not success. Publication bookkeeping uses `maintenance publication --phase started --trigger manual|scheduled-agent`, then the returned `--run-id` with `--phase completed --outcome unchanged`, or `--outcome published --pr <merged-number>`. Record failures with `--phase failed`. These are agent reports, not independent scheduler attestations. The 36-hour missed-run signal appears when status is next evaluated; a sleeping or offline Mac cannot send an immediate alert.

## Schedule and setup

```sh
node scripts/setup.mjs
node scripts/setup.mjs --launch-agent
node scripts/brain.mjs scheduled-run
```

One user LaunchAgent runs at 02:30 and on load. Due-time checks provide startup catch-up: harvest, official reference refresh and link sampling run when due, and source failures retry with bounded backoff. A separate local Codex heartbeat handles private learning curation when the Mac/app is available; the hosted workflow owns official-reference and link maintenance. It preserves unrelated changes and skips unchanged or non-actionable work quietly. Local scheduled agent work requires the desktop app and machine to be available. Logs and notifications contain no raw candidate text. All CLI mutations share a lock; other project repositories are not enrolled for background writes.

Registry changes use documented maintenance PRs. Git history and the lock's per-source policy hashes are the integrity record, so a new machine needs no separate registry approval step. Brain has no built-in backup; include `.state/`, `inbox/` and `brain.config.local.json` in your normal machine backup to preserve the inbox, dispositions, local paths, curation receipts, and cached oversized files.

After cloning, run `git config core.hooksPath .githooks` to activate the pre-commit guard.

Brain CLI commands never create commits or remotes and never push. The authorized scheduled agent publishes through issue-linked PRs. Tests, fixtures, fresh-session checks, general CI, and dedicated QA are deferred for v1; the explicitly requested wiki and hosted maintenance/verification workflows are installed. Runtime safeguards and actual command results are retained.

## Context wiki

The native `.githooks/pre-commit` runs the blocking Brain privacy check, then the advisory wiki lifecycle. Wiki plan discovery is scoped to a private empty home with `WIKI_HOME` to exclude raw agent sessions. `knowledge/` remains the reusable guidance base; `wiki/` is the project history.

```sh
node scripts/wiki/build-graph.cjs
node scripts/wiki/check.cjs
node scripts/wiki/serve-graph.cjs
```

Hosted `Wiki integrity` checks PRs. Brain no longer runs automatic wiki merge or issue reconciliation workflows; the same-delivery rule records history with each change. The repository `BOT_TOKEN` secret remains in use by the hosted maintenance publisher.
