# Current Curated rev.1 — 2026-08-12

## Status

- Base Frozen Release: **3.0.2**
- Frozen literature cutoff: **2026-06**, inclusive through **2026-06-30**
- Current Curated through: **2026-08-12**
- Live revision: **1**
- Status: **ready**
- Frozen Release mutated: **no**

## Promoted batch

The 2026-08-12 uploaded literature batch was independently re-screened against the actual Frozen Release 3.0.2 corpus rather than the older spreadsheet baseline.

Promotion result:

- 16 primary-evidence-reviewed article records;
- Records **347–362**;
- 14 coverage backfills dated on or before 2026-06-30;
- 2 post-cutoff additions dated 2026-07-01 and 2026-07-16;
- 43 new independent structure/phase determinations;
- 4 new-article → known-identity provenance links;
- 0 duplicate DOI groups;
- 0 duplicate Current structure IDs;
- 0 orphan Current structures;
- 0 orphan known-identity links;
- 0 missing DOI/title/formula/space-group fields within the promoted batch.

A new article does not automatically imply a new chemical or phase identity. Known compounds/phases were linked to existing identities instead of being duplicated. Distinct pressure/polymorph determinations were retained when primary crystallographic evidence established a separate phase.

## Current Curated denominators

| Metric | Current rev.1 |
|---|---:|
| Article audit records | 362 |
| Chemically included articles | 351 |
| Canonical verified articles | 348 |
| Structure / phase rows | 921 |
| Core-Included structure rows | 859 |
| Resolved space-group rows | 693 |
| Verified one-to-one SG mappings | 668 |
| Verified polar rows | 97 |
| Strict-polar rows | 77 |
| Strict-polar articles | 46 |
| RAG documents | 1,283 |
| RAG embeddings | 1,283 |

## Frozen guard

Frozen Release 3.0.2 remains:

346 / 335 / 332 / 878 / 816 / 650 / 625 / 87 / 67 / 42, with 1,224 / 1,224 Frozen RAG documents/embeddings.

Record 13 remains physically corrected in Frozen Release 3.0.2:

- CUH-013-S01 — Unresolved
- CUH-013-S02 — 0D
- CUH-013-S03 — 0D
- CUH-013-S04 — 0D

## Temporal semantics

Three dates must not be conflated:

1. **Frozen Release literature cutoff** — June 2026, inclusive through 2026-06-30.
2. **Current Curated coverage** — reviewed scientific content through 2026-08-12 for rev.1.
3. **Literature Watch last sync** — an operational metadata-discovery timestamp only.

A cutoff-period backfill is recorded as Current Curated provenance; it does not retroactively rewrite the already published Frozen Release snapshot.

## RAG integration

The 16 new article-grain documents and 43 new structure identity/crystallography documents were embedded with BGE-M3: **59/59**.

Smart RAG 9.13.0 searches Frozen + Current through a unified **1,283-document** retrieval layer while preserving:

- deterministic frozen/current counts;
- deterministic temporal scope;
- DOI/record/structure exact lookup for Current records;
- article/structure evidence-grain separation;
- no automatic promotion from Literature Watch;
- no model override of curation or crystallographic truth.

## Public/private boundary

The promoted records participate in the query-and-view public projections. Complete normalized row payloads, exact abstracts, PDF/SI/CIF, evidence excerpts/locators and internal QC/adjudication remain private.

This repository intentionally versions the schema, access-control contracts, runtime source and batch-level audit without publishing the private 16/43 row payload as a bulk SQL/data dump.
