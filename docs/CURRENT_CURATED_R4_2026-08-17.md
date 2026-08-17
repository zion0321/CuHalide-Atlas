# Current Curated rev.4 — 2026-08-17

> Deployment candidate: **site v49 / UI 49.0 / Current Curated rev.4**. This document is the release marker used for the final Preview-to-Production gate.

## Release decision

Current Curated rev.4 is the authoritative living scientific state of CuHalide Atlas as of 2026-08-17. Frozen Release 3.0.2 remains immutable and is not modified by this release.

Rev.4 changes the living structure architecture from an append-only Frozen-plus-overlay model to a **complete current atomic/context structure snapshot**. This is required because a living curation layer must be able to remove non-structure placeholders, correct existing rows, split generic rows into independent crystallographic determinations, and preserve phase/temperature-specific structures without retaining superseded rows in the current view.

## Locked denominators

- Article audit records: 373
- Chemically included articles: 362
- Canonical verified articles: 359
- Structure / phase rows: 924
- Core-Included structure rows: 864
- Resolved SG rows: 691
- Verified one-to-one SG rows: 665
- Verified polar rows: 94
- Strict-polar rows: 79
- Strict-polar articles: 49
- Motif taxonomy rows: 924
- Motif resolved: 567
- Motif unresolved: 357
- Unresolved legacy-category rows: 35
- RAG documents / embeddings: 1,297 / 1,297

Frozen Release 3.0.2 remains 346 / 335 / 332 articles, 878 structures, 816 Core, 650 resolved SG, 625 verified SG, 87 verified polar, 67 strict-polar rows across 42 articles, and 1,224 RAG documents.

## Major entity corrections

### Non-structure placeholders removed

`CUH-244-S01` and `CUH-305-S01` were explicit article-level review/perspective audit placeholders and are not atomic crystallographic structures. Their source articles remain in the article audit as boundary/context records, but the placeholder rows are removed from the living structure, motif, taxonomy, public-search and structure-RAG grains.

### Record 32 enantiomeric and achiral structures

The article contains four distinct crystallographic/chemical identities:

- meso-Cu2I6 — P21/n — CCDC 2414806
- rac-CuI3 — P21/n — CCDC 2414809
- R-Cu4I6 — P21 — CCDC 2414808
- S-Cu4I6 — P21 — CCDC 2414807

The R and S determinations are not represented by a single generic R/S row.

### Record 45

Primary evidence/CCDC mapping completed the two Cu5I7 determinations. `CUH-045-S01` is C2 and polar; `CUH-045-S02` is C2/c. Both receive High SG and High mapping confidence. The C2 structure enters the strict-polar subset.

### Record 160 variable-temperature and source-conflict audit

COD/deposited crystallographic metadata confirms five independent compound-4/L4 C2/c determinations at 115, 155, 195, 235 and 235 K. The two 235 K rows have distinct crystallographic refinements and are retained as separate determinations rather than merged as a duplicate.

For `CUH-160-S11` (compound 3), the main-article text reports Cc, but the deposited CIF block `mo_harvey_cu4i4_compound_3` is an exact compound/formula/cell match and explicitly reports IT 15 / C 1 2/c 1 / C2/c at 130 K. Existing direct-CIF field evidence is High/High and verified. Under the Atlas crystallographic hierarchy, the living canonical value is therefore C2/c, point group 2/m, nonpolar. The article-level Cc statement remains recorded as a source conflict.

## Motif policy

Fractional/mixed-occupancy compositions are not converted into integer Cu-X motifs by rounding, truncation or charge-balancing inference. A resolved integer motif is retained only when independent primary structure evidence explicitly defines the connected Cu-halide unit. This policy produces 567 resolved and 357 unresolved motif rows in rev.4.

## Halogen policy

`CUH-220-S04` remains Cu-X halogen Unresolved because its multihalogen empirical formula does not uniquely distinguish Cu-bound from other halogen atoms at structure grain. Record 232 mixed-occupancy structures are normalized to the filterable set Br/I while retaining fractional occupancies explicitly in composition/evidence notes.

## RAG and evidence grain

Rev.4 rebuilds the active retrieval corpus as a complete current snapshot:

- 373 article-grain documents
- 924 structure-grain documents
- 1,297 total BGE-M3 embeddings

Structure documents contain identity, crystallography, dimensionality and structure-specific motif information. Article-grain emission, PLQY, lifetime and mechanism are not reassigned to individual structures without explicit mapping. Exact stored publisher abstracts and private evidence excerpts are not exposed through the public RAG corpus.

## Destructive QA gates

Before promotion, all of the following were required to be zero or exact:

- duplicate current structure IDs
- structure ↔ motif ↔ taxonomy ↔ public-snapshot crosswalk mismatches
- article expected-determination cardinality mismatches
- unresolved/pending structure-ID flags
- structure search-safe mismatches and article-title leakage
- structure-RAG photophysics leakage
- structure-RAG metadata mismatches
- resolved SG rows with missing IT/point-group/crystal-system/polar derivation
- conflicting crystallographic SG tuples
- formula-derived fractional-motif leakage
- non-structure review/perspective placeholders in the living structure grain

All gates passed before the database cutover.

## Rollback and invariance

Pre-rev.4 living projections were copied to internal rollback snapshots before cutover. Frozen Release 3.0.2 was independently re-counted after promotion and its scientific denominators remained unchanged.

## Runtime versions

- Site v49
- UI 49.0
- Public Data 2.11.0
- Smart RAG 9.16.0
- Research Assistant 10.1.0
- Motif Atlas 1.2

Public access remains read-only query-and-view. The complete normalized corpus, primary PDF/SI/CIF archive, exact stored publisher abstracts, evidence locators and internal adjudication artifacts remain private.
