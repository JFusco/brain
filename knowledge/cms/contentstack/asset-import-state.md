---
title: "Keep Contentstack import state with native concurrency"
domain: "cms/contentstack"
aliases: ["asset migration", "CLI backup directory", "UID mappings"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
versions: []
applicability: "Planning Contentstack CLI asset imports and dependent module imports; exact installed CLI release must be checked"
provenance: "contentstack-docs@27fb06e5aabe557865140dfcf163b8576b091a0711ecf2d98737750645f1543d; relevant rolling official pages read 2026-10-21; sanitized capture proposals, no bulk runtime validation"
---

# Keep Contentstack import state with native concurrency

## When to use this

Use this when a pilot upload must become a repeatable asset migration, particularly when later entries depend on imported asset identities. This is a proposed operating procedure, not an executed bulk pipeline.

## What to do

1. **Proposed:** evaluate the official CLI before building a custom uploader. Prepare its expected export-format input; arbitrary legacy files still need transformation. A cloud runner can remove dependence on one laptop, but needs access to inputs, credentials and retained import state.
2. **Documented:** the [versioned import guide](https://www.contentstack.com/docs/headless-cms/import-content-using-the-cli/v1) supports asset-module imports, management-token authentication and separate asset/entry publication-skip options. It includes CI examples. Confirm flags against the selected CLI release and keep publication disabled during migration review; do not copy unrelated replacement or publication options.
3. **Documented:** the [configuration reference](https://www.contentstack.com/docs/headless-cms/contentstack-cli-configuration-reference) sets `modules.assets.uploadAssetsConcurrency` to two by default and provides folder-import controls. `cs-assets` is a separate service mode. **Proposed:** begin with native controls, measure successful throughput and throttling on a representative batch, then tune. Concurrency is not a promised assets-per-second rate; coordinate jobs against the actual organization limit.
4. **Documented:** [CLI troubleshooting](https://www.contentstack.com/docs/headless-cms-cli-troubleshooting/faqs) explains that the backup directory carries UID mappings between module invocations and can become the working source of schemas and content. **Proposed:** retain the complete vendor working directory for one logical migration, input package and destination stack/branch. A mapping CSV alone is not an equivalent recovery package. Record the CLI version and invocation; check its `--backup-dir` semantics before use.
5. **Proposed:** preserve that state for dependent imports and supported retries. Inspect failed items and missing mappings before another mutation. Do not treat an uncertain upload as safe to repeat or discard state merely because file uploads finished. Keep necessary inputs, mappings and failure reports until acceptance; remove redundant temporary copies separately.

## Choose the transfer surface

**Documented:** the [Bulk Operations app](https://www.contentstack.com/docs/marketplace/bulk-operations) supports direct asset uploads and uploads into folders, subject to the organization’s asset limit. **Proposed:** consider this browser option for a one-time batch whose references can be reconciled separately; prefer the CLI for a repeatable prepared-package workflow. Browser availability does not establish faster transfer or automatic preservation of legacy identities, references or placement text.

**Documented:** the [CMA reference](https://www.contentstack.com/docs/developers/apis/content-management-api) lists default organization-wide limits of 10 read and 10 write requests per second, HTTP 429 responses, limit/remaining headers and plan-dependent adjustments. Bulk actions have a separate default of one request per second. **Proposed:** use the actual account limits and observed throttling when tuning; these request limits are not asset throughput guarantees.

**Documented:** [CMA asset upload](https://www.contentstack.com/docs/developers/apis/content-management-api/assets#upload-asset) accepts multipart `asset[upload]` with optional parent folder UID, title, description and tags. **Proposed:** add a small adapter only for a demonstrated gap in vendor tooling. Keep source transformation, identity/duplicate decisions and reference reconciliation explicit. If checksum validation is required, measure its download cost separately from transfer throughput rather than silently dropping it.

## Evidence and limits

These three official pages were read on the evidence date. The configuration and troubleshooting guidance support native concurrency and state retention; they do not prove idempotence, duplicate avoidance, complete mappings or recovery on a particular CLI release. Check dependent references with a bounded sample before scaling.

Private captures describe a small uploader pilot and propose cloud execution; that application and its receipts were not inspected here. No bulk import, cloud job, throughput benchmark, organization-specific limit or unpublished rendering was validated. Frontend package versions are not CLI compatibility evidence. The browser and multipart references above were checked during the follow-up review. They do not establish a server-to-server URL-only importer. Preserve existing destination assets and ledgers while establishing how the selected tool recognizes previous work. Do not mix options from different CLI documentation tracks without checking the installed release. For editorial organization, use [asset ownership and reuse](asset-ownership-and-reuse.md).

