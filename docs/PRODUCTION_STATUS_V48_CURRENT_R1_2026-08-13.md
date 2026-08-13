# Production status — v48 + Current Curated rev.1

Date: 2026-08-13

This document describes the intended and regression-gated production state after the Current Curated rev.1 production synchronization. Frozen Release 3.0.2 remains the immutable scientific citation snapshot.

## Version matrix

| Component | Version |
|---|---|
| Frozen Release | 3.0.2 |
| Site | 48 |
| Public Data | 2.8.0 |
| Smart RAG | 9.13.0 |
| Meta / health | 48.1 |
| Current Curated | rev.1 |
| Current curated through | 2026-08-12 |

## Temporal model

- Frozen Release 3.0.2 literature cutoff: **June 2026, inclusive through 2026-06-30**.
- Current Curated rev.1: **curated through 2026-08-12**.
- Literature Watch: metadata-only discovery; the last-sync timestamp is operational and is not a scientific coverage date.

## Frozen / Current denominators

| Metric | Frozen 3.0.2 | Current rev.1 |
|---|---:|---:|
| Article audit | 346 | 362 |
| Chemically included | 335 | 351 |
| Canonical verified | 332 | 348 |
| Structure/phase | 878 | 921 |
| Core-Included | 816 | 859 |
| Resolved SG | 650 | 693 |
| Verified SG mapping | 625 | 668 |
| Verified polar | 87 | 97 |
| Strict polar | 67 | 77 |
| Strict-polar articles | 42 | 46 |
| RAG documents / embeddings | 1,224 / 1,224 | 1,283 / 1,283 |

## Current rev.1 batch integrity

- 16 promoted article records, Records 347–362.
- 43 new independent structure/phase determinations.
- 4 article-to-known-identity provenance links.
- 14 cutoff-period coverage backfills.
- 2 post-cutoff additions.
- duplicate DOI groups: 0.
- duplicate Current structure IDs: 0.
- orphan Current structures: 0.
- orphan identity links: 0.
- promoted records missing DOI/title/formula/space group: 0.

## Public Data 2.8

Default public query scope is Current Curated. Explicit `scope=frozen` remains available for Frozen Release 3.0.2. Public list/search/single-record responses remain field-whitelisted; bulk/raw/payload actions remain unavailable.

Default canonical views:

- articles: Current canonical = 348;
- structures: Current Core-Included = 859;
- strict polar: 77 rows / 46 articles.

Frozen scope remains 332 / 816 / 67 / 42 for the corresponding canonical denominators.

## Smart RAG 9.13

- Unified documents / embeddings: 1,283 / 1,283.
- Frozen compatibility path retained for validated 3.0.2 facts.
- Current exact layer covers Records 347–362, Current structure IDs and DOI lookup.
- Current retrieval layer uses BGE-M3 + lexical/RRF with optional BGE reranking.
- Temporal scope, counts and protected curation facts are deterministic.
- Structure-grain evidence remains identity/crystallography only unless an independent mapping supports a structure-level scientific property.
- Literature Watch metadata cannot become curated evidence automatically.

## Stable discovery

Target canonical sitemap cardinality after synchronization:

- root: 1
- Current canonical article pages: 348
- Current Core-Included structure pages: 859
- total: **1,208 URLs**

Current Curated stable pages explicitly state `Current Curated rev.1`; Frozen pages explicitly state `Frozen Release 3.0.2`.

## Security / privacy

- Public access mode: query-and-view.
- `/api/export`: HTTP 410.
- Current raw tables: private, RLS-enabled, no anon/auth direct read/write.
- primary PDF/SI/CIF: private.
- exact stored abstracts: private.
- field-evidence excerpts/locators: private.
- candidate scoring/reasoning/source payloads: private.
- Supabase Security Advisor at the rev.1 database checkpoint: 0 findings.

## Repository / deployment governance

The active `Protect main production` ruleset applies to the default branch with no bypass actors. It requires an up-to-date PR and successful:

- chromium-production
- lighthouse-production
- preview-chromium
- preview-lighthouse
- Vercel

Force pushes and branch deletion are blocked and review conversations must be resolved.

Vercel also runs an independent fail-closed production provenance gate. Production builds are accepted only for an exact merged-PR result whose candidate QA, production baseline and trusted Vercel status passed.

## Acceptance gate

The synchronization is complete only when post-merge production verifies all of the following:

- `/health.json`: core PASS and `site_readiness=PASS`;
- root temporal labels show Frozen cutoff and Current curated-through separately;
- Public Data = 2.8.0;
- Smart RAG = 9.13.0 / 1,283 unified documents;
- Current and Frozen denominators above are exact;
- Record 13 values remain unchanged;
- Record 353 and a Current structure stable page resolve with Current Curated provenance;
- sitemap contains exactly 1,208 URLs;
- `/api/export` remains 410;
- full Chromium/accessibility/responsive QA passes;
- Lighthouse thresholds remain unchanged and pass;
- production runtime has no unexplained 5xx/error burst;
- Supabase Security Advisor remains clean.
