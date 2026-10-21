---
status: "partial"
executed: true
evidence: ["knowledge/performance/INDEX.md", "knowledge/security/INDEX.md", "knowledge/semantics/INDEX.md"]
source_tool: "codex"
source: "brain-performance-security-semantics-hubs"
topics: ["automatic-knowledge-maintenance"]
digest: "2da6a0ec3de8c97d2b7c1f3f638641787b0e5cbadaf06b3b22aad07d037b5767"
---

# Add Performance, Security and Semantics reference hubs

## 1. Outcome and boundaries

Create `knowledge/performance/INDEX.md`, `knowledge/security/INDEX.md` and `knowledge/semantics/INDEX.md`. Performance covers browser loading, rendering, Core Web Vitals, profiling, budgets, caching and application/CMS performance. Security covers application authentication, authorization, sessions, data handling, injection prevention, browser protections, secrets and dependencies. Semantics has four distinct sections: HTML meaning/native controls, structured/linked data, content/domain models and semantic search.

Use existing hub frontmatter and curated/official markers. Keep explanatory prose outside generated sections and retain `No curated notes yet.` Public interface changes are only the additive domain values `performance`, `security` and `semantics`; schemas and commands stay unchanged. Existing vendor hubs supply framework/CMS context. General infrastructure, compliance, organizational policy and initial practice notes remain outside scope.

This is an implementation handoff, not authorization to implement during plan review. Eventual execution stops at local uncommitted changes and actual verification results. Add no tests, fixtures, QA or implementation-review agents, collectors, classifiers, search schemas, graph/UI code or global registrations.

## 2. Isolated worktree prerequisite — FIND-003

Record the primary checkout's current HEAD and status. Create an owner-private temporary parent directory (0700) and a detached Git worktree from that recorded HEAD. Preserve the primary checkout's dirty files; do not transplant its unrelated edits.

Provision the applicable existing `brain.config.local.json` through an opaque local copy into the fresh worktree, without inspecting or printing its contents. Create the destination with mode 0600, confirm Git ignores it and `.state/`, and keep `.state/` at 0700. Copy no inbox, authentication, environment, transcript, memory or other operational stores. Preserve the exact profile and scanner pins; the existing absolute scanner path can remain usable from the worktree.

Require Node 24 and invoke `scanner()` from `scripts/lib/privacy.mjs` without printing its return value. It must validate the configured binary, hash and version before synchronization or repository checks. Do not run the latest-version installer, substitute hosted setup's empty profile, weaken the profile or bypass guards. If the profile or pinned scanner is unavailable, preserve local work and report runtime verification blocked. Do not assume ignored files follow Git worktrees.

## 3. Exact official registrations — FIND-001

Add these two entries to `official/sources.json`. Both use `kind: "collection"`, `indexFormat: "sitemap"`, `installPolicy: "reference-only"`, `preferred: false`, `maxPages: 5000` and `maxIndexes: 32`. Omit `fetchSuffix` and `track`; the existing collection path uses rolling-url tracking.

| ID / vendor / domains | indexUrl | allowedHosts / includePrefixes | license |
| --- | --- | --- | --- |
| `owasp-cheat-sheets` / `owasp` / `["security"]` | `https://cheatsheetseries.owasp.org/sitemap.xml` | `["cheatsheetseries.owasp.org"]` / `["/cheatsheets/"]` | `CC-BY-SA-4.0` |
| `schemaorg-docs` / `schemaorg` / `["semantics"]` | `https://schema.org/sitemap.xml` | `["schema.org"]` / `["/docs/"]` | `CC-BY-SA-3.0 (schemas, supporting documentation and examples; https://schema.org/docs/faq.html)` |

Use these exact applicability strings:

- OWASP: `Rolling OWASP application-security cheat-sheet links. Apply guidance to the target web application, framework and CMS; this catalog does not establish compliance. Page bodies are fetched selectively, not mirrored.`
- Schema.org: `Rolling Schema.org documentation links under /docs/ for structured-data vocabulary and modeling. Excludes the complete type/property vocabulary catalog. Page bodies are fetched selectively, not mirrored.`

For `schemaorg-docs`, add one `additionalPages` entry: `{ "title": "Schema.org structured data model", "url": "https://schema.org/docs/datamodel.html" }`. This existing title-override mechanism makes the structured-data query searchable. Document that Apache-2.0 concerns Schema.org site software, not the documentation license.

Add exactly these pointers, each containing only `domain`, `url` and the literal `reason` below. Labels P1–P7 are plan references, not registry fields.

| Ref | domain | url | reason |
| --- | --- | --- | --- |
| P1 | performance | `https://web.dev/learn/performance` | Web performance: browser loading, rendering and profiling. Rolling web.dev Learn Performance course; pointer only. |
| P2 | performance | `https://web.dev/articles/vitals` | Core Web Vitals performance metrics. Rolling web.dev overview; pointer only. |
| P3 | semantics | `https://html.spec.whatwg.org/multipage/` | HTML semantics and native controls in the WHATWG HTML Living Standard. Rolling standard; pointer only. |
| P4 | semantics | `https://web.dev/learn/html/semantic-html` | Semantic HTML meaning and native elements. Rolling web.dev tutorial; pointer only. |
| P5 | semantics | `https://www.w3.org/TR/json-ld11/` | JSON-LD 1.1 structured data and linked data; published W3C Recommendation. Pointer only. |
| P6 | semantics | `https://www.contentstack.com/docs/headless-cms/about-content-modeling` | Contentstack content modeling and domain models; product-specific headless CMS guidance. Verify applicability to the consuming stack. Pointer only. |
| P7 | semantics | `https://docs.optimizely.com/graph/docs/semantic-search.md` | Optimizely Graph semantic search; experimental product feature. Confirm current availability and limitations for the target Graph deployment. Pointer only. |

Keep web.dev pointer-only: the observed child-sitemap timeouts and archived repository do not justify another collector. Preserve vendor catalog domain assignments. Pointer coverage and catalog coverage must remain visibly distinct.

## 4. Hub integration and capture routing — FIND-001, FIND-002

Add the three domains before `_unsorted` in `brain.config.json`. Append these keyword entries after all existing entries, in this order:

- `performance`: `["web performance", "core web vitals", "largest contentful paint", "interaction to next paint", "cumulative layout shift", "performance budget", "rendering performance"]`
- `security`: `["application security", "owasp", "authentication", "authorization", "session security", "injection prevention", "content security policy"]`
- `semantics`: `["semantic html", "html semantics", "structured data", "schema.org", "json-ld", "content modeling", "domain modeling", "semantic search"]`

Link the new hubs from `knowledge/INDEX.md`. Add reciprocal related-domain links in the existing Frontend, Accessibility, React and Next.js hubs. From the new hubs, also link relevant Vercel, WordPress and CMS hubs without retagging their catalogs. Semantics must distinguish standards, vendor modeling guidance and experimental search. Update README's coverage/watch-list rows with the selected sources and limits.

Verify configuration-backed inference through one-off `domainFor()` calls, without a test harness or inbox writes:

| Exact input | Expected domain |
| --- | --- |
| `Core Web Vitals` | performance |
| `Interaction to Next Paint` | performance |
| `input handling` | _unsorted |
| `OWASP authentication` | security |
| `structured data with JSON-LD` | semantics |
| `semantic HTML` | frontend — existing tie order |
| `accessibility native controls` | accessibility |
| `Next.js caching` | nextjs |
| `React WordPress` | cms/wordpress — existing exception |
| `WordPress authentication` | cms/wordpress — existing tie order |

Inspect `capture()` to confirm that an explicit valid domain overrides inference, including `Next.js caching` explicitly assigned to performance. Do not invoke capture. Do not add bare `inp` or alter existing routing rules.

## 5. Local verification and handoff — FIND-004, FIND-005

After creating hubs and registrations, run `node scripts/brain.mjs official sync owasp-cheat-sheets`, then the corresponding command for `schemaorg-docs`. For each source require inclusion in `changed` or `unchanged`, absence from `failed`/`skipped`, successful bounded crawl evidence, a nonempty catalog of at most 5,000 pages and 1 MiB, and matching lock revision/hash. Preserve failures and backoff; an uncatalogued-source warning cannot satisfy completion.

Run `curation hubs`, `check` and `official check` through `node scripts/brain.mjs`. Inspect returned issues and warnings, not just exit codes. Use domain-filtered `lookup --query ... --limit 5` for these expectations:

| Domain / area | Query → expected entry |
| --- | --- |
| performance | `loading rendering` → P1; `Core Web Vitals` → P2 |
| security | `authentication` → `owasp-cheat-sheets`, `https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html` |
| semantics / HTML | `HTML Living Standard` → P3; `semantic HTML` → P4 |
| semantics / structured data | `structured data model` → Schema.org datamodel; `JSON-LD` → P5 |
| semantics / models | `Contentstack content modeling` → P6 |
| semantics / search | `semantic search` → P7 |

Expect `official-page` for the two catalog examples and `official-pointer` for P1–P7. Repeat the P2, authentication, datamodel and P7 queries with `--limit 1 --fetch`; require the intended URL, a nonempty excerpt and retrieval metadata without an error. Preserve retrieval failures and report the corresponding acceptance incomplete. These are bounded retrieval observations, not full technical or link audits.

Archive the executed plan with `node scripts/wiki/archive-plan.cjs <executed-plan-file> --status implemented --source-tool codex --source brain-performance-security-semantics-hubs --evidence knowledge/performance/INDEX.md --evidence knowledge/security/INDEX.md --evidence knowledge/semantics/INDEX.md --topic automatic-knowledge-maintenance`. Keep the original review artifacts outside the repository. Use `partial` status and only actual repository-relative implementation evidence when incomplete. Record actual outcomes in the dated wiki journal and existing `automatic-knowledge-maintenance` topic per `wiki/MECHANICS.md`. Inspect the generated tracked archive frontmatter and plan-ledger diff: require the explicit sanitized source label and no absolute review-artifact paths or private operational provenance. Run scoped `WIKI_HOME="$PWD/.state/wiki-plan-scope" node scripts/wiki/discover-plans.cjs`, then wiki graph generation and integrity checking. Recheck affected runtime checks after final documentation edits.

Hand off the worktree path, intended diff and actual results. Keep failures visible; use no hosted fallback or maintenance Actions. Local lookup reads worktree data, while the visual graph reads committed main and gains these domains only after separately authorized publication. No commit, push, PR or merge occurs here; future delivery requires the prescribed issue-linked registration changes.
