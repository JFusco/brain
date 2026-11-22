# Office knowledge interfaces

The Office uses supported CLI contracts rather than the viewer HTTP server or private module imports. All new responses have `version: 1`. These interfaces do not authorize publication or reveal pending inbox captures as guidance.

## Scan acquired text

`node scripts/brain.mjs scan --stdin --secrets-only`

Read at most 1 MiB of valid UTF-8. Return input SHA-256, scanner and policy versions, `clean`, and rule/line ranges. Findings contain no matched values. This operation does not create captures, scan reports, registry entries or publication state. Source acquisition necessarily happens before this scan.

## Pin published knowledge

`node scripts/brain.mjs snapshot [--snapshot SHA] [--cursor CURSOR]`

Resolve a committed snapshot, defaulting to `main`. Graph pages contain at most 500 nodes and 1,000 edges within 512 KiB, with an opaque continuation bound to the same commit. Ordering and IDs are deterministic. Worktree edits and inbox candidates are excluded.

`node scripts/brain.mjs search --snapshot SHA --query QUERY --kind note [--limit 5] [--versions next@16,react@19]`

Search eligible curated notes at the specified full commit SHA. Queries are limited to 2,000 characters and results to 1–20. Ranking reuses the existing ranker and breaks ties by stable identity. Results include committed paths, hashes, applicability and limitations. The optional `--versions` context (at most 2,000 characters) takes literal `package@version` values; notes whose version constraints conflict are excluded and counted in `incompatible`. Without it, compatibility remains unconfirmed.

`node scripts/brain.mjs read --snapshot SHA --path knowledge/DOMAIN/NOTE.md [--include-withdrawn] [--current-status [--versions next@16,react@19]]`

Read an eligible curated note's exact committed text and SHA-256, up to 256 KiB. A caller can verify that search and read refer to identical committed bytes. A changed worktree does not change a historical response.

`--include-withdrawn` also allows audit reads of valid retired or superseded
notes retained at the requested commit. These reads add `statusAtSnapshot` and
`eligible: false`. Withdrawn notes stay out of search at snapshots where they
are withdrawn.

`--current-status` adds a separate comparison against one committed local
`main` revision while preserving the requested bytes and digest. The
`currentStatus` object contains `mainRevision`, `outcome`, `statusAtPath` and
`bytesChanged` when known, a nullable `target`, and `correctionsChanged` and
`corrections`. Outcomes are `unchanged`, `updated`, `superseded`, `retired`,
`deleted`, `missing-replacement`, `invalid`, `cycle`, `depth-exceeded`, and
`unavailable`. The comparison follows up to eight replacement links. An eligible
target supplies its path, hash, applicability and freshness. The optional
`--versions` accepts the same bounded literal context as search and adds target
`versionFit` when supplied. The correction excerpt, when present, has
`excerpt`, `startLine` and `endLine` at `mainRevision`. Section removal can
set `correctionsChanged` with a null excerpt. A hash difference indicates changed
bytes. Read the affected claim and its evidence before relying on it.

Both switches can be used together to audit withdrawn bytes and compare them
with current guidance. A failed comparison preserves the requested audit read.

## Retain explicit publication lineage

Capture receipts retain existing request fields and add protocol version, incorporation mappings and lineage status. Request aliases are paginated in pages of 100; pass a returned `nextCursor` as `capture receipt --request-id UUID --cursor CURSOR` to read the next page. Historical dispositions without a map return unknown lineage.

Inbox acceptance requires `--publications` mapping each accepted candidate ID
to 1–20 unique note paths. An active entry is `{path, contentSha256}` and must
match an eligible note at the verified merged commit. A withdrawal entry is
`{kind: "withdrawal", path, contentSha256}` and must match a valid retained
retired or superseded note there. For a withdrawal, the merged commit must have
exactly one local parent, the path must occur in that commit's diff, and the
parent must contain an eligible version at that path. A rebased result can
establish a withdrawal only if its final commit proves the transition. Both
entry types can appear in one map.

Receipts preserve each path, commit and hash and add `kind` only on withdrawal
entries. Audit a withdrawal with `read --include-withdrawn` at the receipt's
commit and compare its exact digest to the receipt. Review coverage and
required nightly completion remain the curator's responsibility.

These are read and receipt contracts. Capture, review, merged publication and the repository's delivery rules continue to govern incorporation.
