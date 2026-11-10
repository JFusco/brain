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

`node scripts/brain.mjs read --snapshot SHA --path knowledge/DOMAIN/NOTE.md`

Read an eligible curated note's exact committed text and SHA-256, up to 256 KiB. A caller can verify that search and read refer to identical committed bytes. A changed worktree does not change a historical response.

## Retain explicit publication lineage

Capture receipts retain existing request fields and add protocol version, incorporation mappings and lineage status. Request aliases are paginated in pages of 100; pass a returned `nextCursor` as `capture receipt --request-id UUID --cursor CURSOR` to read the next page. Historical dispositions without a map return unknown lineage.

New inbox acceptance requires `--publications` containing a JSON object from each accepted candidate ID to 1–20 `{path, contentSha256}` entries. Each note must be eligible at the independently verified merged commit and its hash must match. Acceptance records each path, commit and hash; publication membership is never inferred from a filename or a changed file alone. Candidate/request identity and duplicate association are preserved.

These are read and receipt contracts. Capture, review, merged publication and the repository's delivery rules continue to govern incorporation.
