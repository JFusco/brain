---
title: "Keep Contentstack import state with native concurrency"
domain: "cms/contentstack"
aliases: ["asset migration", "CLI backup directory", "UID mappings"]
evidence_date: "2026-10-22"
reviewed_at: "2026-10-22"
status: "current"
versions: []
applicability: "Planning Contentstack CLI asset imports and dependent module imports; exact installed CLI release must be checked"
provenance: "contentstack-docs@27fb06e5aabe557865140dfcf163b8576b091a0711ecf2d98737750645f1543d; relevant rolling official pages read 2026-10-21; sanitized capture proposals, no bulk runtime validation"
---

# Keep Contentstack import state with native concurrency

## When to use this

Use this when choosing a one-time CLI import or an incremental asset writer, particularly when later entries depend on imported identities. Native mappings help dependent modules, but retaining them alone does not establish duplicate-safe asset reruns.

## What to do

1. **Proposed:** evaluate the official CLI before building a custom uploader. Prepare its expected export-format input; arbitrary legacy files still need transformation. A cloud runner can remove dependence on one laptop, but needs access to inputs, credentials and retained import state.
2. **Documented:** the [versioned import guide](https://www.contentstack.com/docs/headless-cms/import-content-using-the-cli/v1) supports asset-module imports, management-token authentication and separate asset/entry publication-skip options. It includes CI examples. Confirm flags against the selected CLI release and keep publication disabled during migration review; do not copy unrelated replacement or publication options.
3. **Documented:** the [configuration reference](https://www.contentstack.com/docs/headless-cms/contentstack-cli-configuration-reference) sets `modules.assets.uploadAssetsConcurrency` to two by default and provides folder-import controls. `cs-assets` is a separate service mode. **Proposed:** begin with native controls, measure successful throughput and throttling on a representative batch, then tune. Concurrency is not a promised assets-per-second rate; coordinate jobs against the actual organization limit.
4. **Documented:** [CLI troubleshooting](https://www.contentstack.com/docs/headless-cms-cli-troubleshooting/faqs) explains that the backup directory carries UID mappings between module invocations and can become the working source of schemas and content. **Proposed:** retain the complete vendor working directory for one logical migration, input package and destination stack/branch. A mapping CSV alone is not an equivalent recovery package. Record the CLI version and invocation; check its `--backup-dir` semantics before use.
5. **Proposed:** preserve that state for dependent imports and supported retries. Inspect failed items and missing mappings before another mutation. Do not treat an uncertain upload as safe to repeat or discard state merely because file uploads finished. Keep necessary inputs, mappings and failure reports until acceptance; remove redundant temporary copies separately.

## Choose the transfer surface

**Documented:** the [Bulk Operations app](https://www.contentstack.com/docs/marketplace/bulk-operations) supports direct asset uploads and uploads into folders, subject to the organization’s asset limit. **Proposed:** consider this browser option for a one-time batch whose references can be reconciled separately; evaluate the CLI for a prepared-package workflow only after checking its selected release and recovery behavior. Browser availability does not establish faster transfer or automatic preservation of legacy identities, references or placement text.

**Documented:** the [CMA reference](https://www.contentstack.com/docs/developers/apis/content-management-api) lists default organization-wide limits of 10 read and 10 write requests per second, HTTP 429 responses, limit/remaining headers and plan-dependent adjustments. Bulk actions have a separate default of one request per second. **Proposed:** use the actual account limits and observed throttling when tuning; these request limits are not asset throughput guarantees.

**Documented:** [CMA asset upload](https://www.contentstack.com/docs/developers/apis/content-management-api/assets#upload-asset) accepts multipart `asset[upload]` with optional parent folder UID, title, description and tags. **Proposed:** add a small adapter only for a demonstrated gap in vendor tooling. Keep source transformation, identity/duplicate decisions and reference reconciliation explicit. If checksum validation is required, measure its download cost separately from transfer throughput rather than silently dropping it.

## Evidence and limits

These three official pages were read on the evidence date. The configuration and troubleshooting guidance support native concurrency and state retention; they do not prove idempotence, duplicate avoidance, complete mappings or recovery on a particular CLI release. Check dependent references with a bounded sample before scaling.

Private captures describe a small uploader pilot and propose cloud execution; that application and its receipts were not inspected here. No bulk import, cloud job, throughput benchmark, organization-specific limit or unpublished rendering was validated. Frontend package versions are not CLI compatibility evidence. The browser and multipart references above were checked during the follow-up review. They do not establish a server-to-server URL-only importer. Preserve existing destination assets and ledgers while establishing how the selected tool recognizes previous work. Do not mix options from different CLI documentation tracks without checking the installed release. For editorial organization, use [asset ownership and reuse](asset-ownership-and-reuse.md).


## Check classic asset-import reruns separately

**Source observation, not a runtime result:** in [`@contentstack/cli-cm-import` 2.0.2 at `e52dc644163d261a2128299eb4f07f162b08aab6`](https://github.com/contentstack/cli-plugins/blob/e52dc644163d261a2128299eb4f07f162b08aab6/packages/contentstack-import/package.json), the [classic stack-assets module](https://github.com/contentstack/cli-plugins/blob/e52dc644163d261a2128299eb4f07f162b08aab6/packages/contentstack-import/src/import/modules/assets.ts) initializes empty asset/folder maps, imports folders before assets, and writes UID/URL maps after the upload loop. The classic startup path does not first restore the asset map. Loading mappings for later publication is a separate path. Parent folder references are translated through the current folder map. **Inference:** do not assume an interrupted run or another asset invocation will recognize earlier uploads, preserve all partial mappings or target pre-existing folders; verify those cases before use. This finding is limited to the inspected classic flow, not the newer Assets service or every CLI release.

The [pinned import-setup command](https://github.com/contentstack/cli-plugins/blob/e52dc644163d261a2128299eb4f07f162b08aab6/packages/contentstack-import-setup/src/commands/cm/stacks/import-setup.ts) offers `global-fields`, `content-types` and `entries` as module choices; it is not a standalone asset-resume command. The [limitations page](https://www.contentstack.com/docs/headless-cms/cli-limitations/v1) warns that ambiguous asset matches can cause duplicate uploads. Retain native mappings, but do not treat title/filename/size matching or a backup directory as proof of idempotence.

**Proposed:** reserve that classic CLI path for a controlled one-time import with a reviewed recovery plan. For incremental or interruptible migration, evaluate a CMA adapter that records pending attempts before upload, reconciles uncertain results against stable unique identities, explicitly creates/maps folders, sends the intended parent/tags and verifies required readback bytes. Existing assets must be preserved; deletion-and-reimport is not an automatic recovery action. Pin destination stack/branch and CLI release, serialize conflicting imports, use the intended token alias and skip publishing until review. Unique descriptive titles and filenames reduce ambiguity but do not prove identity.

A [vendor migration adapter](https://github.com/contentstack/migration-v2/blob/3557746/api/src/services/runCli.service.ts) converts input then invokes the CLI; that architecture does not prove that every source format or pilot/expansion sequence is supported. The [Sitecore migration guide](https://www.contentstack.com/docs/headless-cms/sitecore-to-contentstack) concerns that framework and must not be generalized into a claim that all Contentstack integrations prohibit incremental work. Do not replace a proven adapter solely to imitate that tool. The captured one-versus-four-request throughput estimate was unmeasured and is not adopted; measure actual successful transfer and verification costs.

**Revalidated October 22:** configuration, troubleshooting, asset limits and the pinned source were read. No stack write, CLI installation, interrupted import, matching algorithm or throughput benchmark ran. The earlier native-state advice remains useful for cross-module mappings; it is narrowed here for asset recovery.
