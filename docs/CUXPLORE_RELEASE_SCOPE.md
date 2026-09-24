# CuXplore release scope

CuXplore is the literature-grounded research and retrieval interface within CuHalide Atlas.
Cu denotes copper, X denotes Cl, Br or I, and explore describes the task.
This is not a new foundation model or autonomous synthesis agent. The dataset,
record identifiers, public URL, citation identity and Frozen Release 3.0.2 are retained.

## Actual processing, 24 September 2026

The reconciled knowledge catalog contains 410 distinct DOI records: 372 curated
articles and 38 supplementary or boundary references. The scientific rev.10 register
remains 901 Core-Included structure determinations and 1,322 embedded article/structure
retrieval records. Those 1,322 semantic records remain a separate index.

The recovered full-text v2 source corpus contains 727 registered source documents
mapped to 403 distinct DOI records. It contains 21,421,324 extracted characters and
6,275 reproducible overlapping text blocks generated with a 4,000-character window
and 3,600-character step. The document states are 664 native-text files, six
sparse-text files and 57 empty/unreadable files. The sparse-text blocks are preserved
for provenance but excluded from primary lexical retrieval.

Within the current 410-DOI knowledge catalog, 384 DOI records have searchable native
v2 text, contributing 6,175 v2 lexical blocks. Six additional v2 DOI records belong
to excluded/out-of-scope article records and remain outside active catalog retrieval.
For catalog records that have no v2 source document, the older page-bounded private
index remains a fallback when available. As a result, coverage denominators for the
source corpus, active catalog and semantic RAG are intentionally different.

CIF handling is also separate from prose retrieval. The 114 registered CIF files were
processed with a crystallographic parser and reconciled against the current curated
structure authority without automatically overwriting authority fields.

## In-place user workflow

- Overview: live catalog and processing coverage, with scientific and text-index dates separated.
- Literature: curated, all, reviewed, indexed MAIN/SI, or additional literature scopes.
- Record details: per-source availability, text state, reviewed notes, existing structures and sample-based photophysics.
- CuXplore: inspect ranked sources and MAIN/SI matches, select sources, prepare a question and save metadata without a model call.

The v2 lexical index returns bounded character-range locators rather than pretending
that character chunks are PDF pages. Legacy fallback matches retain real page
locators. Public results expose bibliographic identities, processing metadata and
bounded match locators, never private text passages, raw source files or private
Drive identifiers. Original-text matches support retrieval; chemical assignments,
structures, mechanisms and measurements retain their independent validation status.

## Boundaries and reproducibility

This is an implemented retrieval/index synchronization, not a claim that all 410
catalog articles have full-text extraction, that native text independently validates
scientific fields, or that model accuracy improved. No new model or new embedding
corpus was created for the full-text v2 cutover. The 1,322 current-curated semantic
records remain unchanged.

The database health contract checks the recovered v2 invariants: 727 documents,
403 DOI records, 21,421,324 characters, 6,275 declared and actual blocks, and zero
per-document block-count mismatches. Raw v2 tables use RLS and service-role-only
access. The public retrieval RPC returns only source identity, source role, score and
bounded locator metadata; raw copyrighted text is not returned.

Source registration, native-text extraction, CIF parsing, authored review,
crystallographic identity, photophysical review and semantic embedding are independent
states and must not be collapsed into one completion metric.


## Website synchronization, 24 September 2026

The production website now exposes the full-text v2 source-corpus denominators separately from the scientific and semantic denominators. The public coverage contract reports 403 source DOI records, 727 source documents, 21,421,324 extracted characters, 6,275 actual v2 blocks, 384 active-catalog DOI records with native v2 text, and the independently retained 1,322 semantic article/structure records. CIF reconciliation is surfaced separately: 114/114 registered files parsed, 237 Cu-containing structure blocks, 29 identity-review rows adjudicated (26 resolved and 3 quarantined), and 10/10 dimensionality flags adjudicated without overwriting the 939-row structural authority.

The interface distinguishes three update dates: Current Curated scientific curation through 14 September 2026; authored source-review overlay through 23 September 2026; full-text source index through 24 September 2026. v2 source matches are rendered as indexed text block plus bounded character range. Legacy matches retain page locators. The former project-specific research-design route is retired and redirects to CuXplore; project-specific recommendations are not part of the Atlas website.
