# CuXplore release scope

CuXplore is the literature-grounded research assistant within CuHalide Atlas.
Cu denotes copper, X denotes Cl, Br or I, and explore describes the task.
This is not a new foundation model or autonomous synthesis agent. The dataset,
record identifiers, public URL, citation identity and Frozen Release 3.0.2 are retained.

## Actual processing, 23 September 2026

The reconciled source catalog contains 410 distinct DOI records: 372 included
curated articles and 38 supplementary or boundary references. Each receives a
source-processing record. The scientific rev.10 register remains 901 Core-Included
structure determinations and 1,322 embedded article/structure retrieval records.

The checksummed private import contains 75 original PDF files: 48 MAIN files with
native text, 21 SI files with native text, and six scan/sparse MAIN files. It adds
1,450 page-bounded passages. Combined and SHA-deduplicated with legacy private
sources, 78 catalog articles have MAIN or SI prose indexed: 48 MAIN and 46 SI
article sets overlap. There are 1,984 indexed prose passages. The six scan/sparse
files are not counted as searchable MAIN text. CIF text is counted separately and
is not a prose search or scientific field-verification result.

Batch payload SHA-256:
`4cf43128c6b77746513557c52efa2a4ee118e596242cd9637879f1d294bcc88d`

The library's registered-source counts (399 MAIN, 326 SI, 311 CIF) describe inventory
coverage, not an assertion that all those originals were parsed or scientifically
rechecked. Reviewed measurements, reviewed no-data results, unreviewed records and
unindexed originals are independent statuses. Legacy reviewed fields are not
invalidated simply because the new native-text index lacks a corresponding file.

## In-place user workflow

- Overview: live catalog and processing coverage, with scientific and text-index dates separated.
- Literature: curated, all, reviewed, indexed MAIN/SI, or additional literature scopes.
- Record details: per-source availability, text state, reviewed notes, existing structures and sample-based photophysics.
- CuXplore: inspect ranked sources and MAIN/SI page matches, select sources, prepare a question and save metadata without a model call.

Public results disclose bibliographic identities, authored annotations and page-match
metadata, never private text passages. Original-text matches support retrieval;
chemical assignments and mechanisms retain their original validation status.
Structured-record and explicit historical queries preserve the exact evidence routes.

## Boundaries and reproducibility

This is an implemented index and interface synchronization, not a claim that all
410 articles have full-text extraction, newly validated scientific fields, or a
measured model-accuracy improvement. No new model was invoked for these release tests.
The existing site's user-triggered conversational service retains its existing provider.

The SQL migrations define private storage and safe read projections. They do not
redistribute private source files or seed their text publicly. To reproduce populated
coverage, use the authorized private import and inventory; an empty database cannot
recreate their contents from this public repository. Import schema and hash checks,
API boundaries, strict CSP, source-state distinctions, responsive browser behavior,
and the inherited production release gates must pass before deployment.
