# CuHalide Atlas rolling literature surveillance and curation workflow

Date: 2026-08-11

## Purpose

CuHalide Atlas should remain scientifically current without allowing a public LLM, metadata-only discovery feed, or an unverified candidate to modify the curated corpus.

The operating model therefore separates four layers:

1. **Frozen scientific release** — immutable versioned snapshots used for citation and reproducibility.
2. **Discovery queue / Literature Watch** — metadata-only candidate surveillance; never evidence for a frozen scientific claim.
3. **Primary-evidence curation** — article/SI/CIF review, extraction, normalization, structure mapping and QC.
4. **Current curated website** — approved records may be shown after full curation while the previous frozen release remains available as an immutable archive; the next formal release is cut only after release-wide validation.

## Versioning rule

- **3.0.2** is a scientific hotfix to formalize the already-confirmed Record 13 dimensionality corrections in a new immutable snapshot. It should not contain unrelated newly discovered literature.
- New literature is not a patch-level erratum. Once approved for rolling curation, it belongs to the live current-curated layer and, at the next formal snapshot, to a new data-expansion release such as **3.1.0**.
- Historical releases remain immutable and addressable.

## Daily discovery

Two complementary routes are used.

### A. Existing automated metadata monitor

The existing Literature Watch cron remains a fast machine-readable discovery path. Its output is candidate metadata only and is kept outside release statistics.

### B. Daily researcher-level sweep

A separate daily ChatGPT task performs a broader search and notifies the curator only when genuinely new or newly online-first candidates are found. The sweep should use the broadest scholarly coverage available to the run, including:

- current CuHalide Atlas Literature Watch candidates;
- scholarly metadata/index sources available to the run;
- publisher article pages and early-view/ASAP/online-first pages;
- preprint servers where relevant;
- broad academic/web search for query variants not captured by a single index.

Search families should include combinations of copper(I), cuprous, Cu(I), chloride/bromide/iodide/halide, organic–inorganic hybrid, coordination complex/polymer/cluster, crystal/structure, luminescence/photoluminescence/scintillation/X-ray, STE/self-trapped exciton, Cu···Cu/cuprophilic, and relevant ligand/template terminology. Short strings such as CuI, CuBr and CuCl must be chemically disambiguated to avoid unrelated semiconductor/biological/noise results.

No claim of literal 100% coverage of all proprietary or inaccessible databases is made; the objective is broad, redundant, cross-source discovery with deduplication.

## Candidate deduplication and triage

Deduplicate in this order:

1. normalized DOI;
2. title + year + first/last author;
3. early-view versus final-version relationship;
4. preprint versus journal-version relationship.

For each new candidate retain privately:

- title;
- DOI/stable URL;
- journal/source;
- publication/online date;
- authors;
- discovery sources;
- likely scope reason;
- confidence: high / medium / low;
- duplicate/preprint/final-version relationship;
- requested primary evidence: article / SI / CIF.

The user notification should be concise and should not repeat already known candidates.

## Primary-evidence gate

A candidate does **not** enter the curated dataset from metadata alone.

After notification, the curator provides the full article and SI, and CIFs whenever available or obtainable. The curation pass then performs:

1. DOI and bibliographic identity validation;
2. compound-level scope adjudication;
3. article-grain scientific extraction;
4. structure/phase expansion;
5. formula and Cu–halide identity normalization;
6. space-group canonicalization and source-form retention;
7. one-to-one structure/phase mapping with confidence;
8. point-group and polarity derivation from crystallography only;
9. article-grain photophysics extraction without automatic phase reassignment;
10. evidence-level assignment and evidence object creation;
11. uncertainty and boundary notes;
12. duplicate/conflict checks against the existing corpus.

The public Smart RAG is a read-only scientific access layer and is not authorized to decide inclusion or write scientific records.

## Pre-publication QC for every accepted paper

Before a newly curated paper becomes visible in the current-curated website layer, verify at minimum:

- no duplicate DOI;
- no orphan structure rows;
- valid article ↔ structure relationships;
- no Core-Verified article outside Included scope;
- no Evidence-D record in canonical core;
- no polar/nonpolar point-group contradiction;
- no polar assignment without resolved crystallography;
- structure halogen evidence scope remains explicit;
- article-grain photophysics/motif data are not silently copied into structure grain;
- RAG article document rebuilt;
- structure identity/crystallography documents rebuilt for new structure rows;
- embeddings generated for new/changed documents;
- exact/statistical denominators recomputed from the current curated layer;
- health contracts pass;
- targeted RAG regression passes;
- production browser smoke/QA passes after deployment.

If any gate fails, the record remains in private curation state and is not promoted.

## Website publication model

The public website should distinguish:

- **Frozen release**: citable, immutable snapshot and its fixed counts/cutoff;
- **Current curated dataset**: frozen release plus fully verified post-release additions;
- **Literature Watch**: unverified metadata candidates.

Publication-growth charts should label the current calendar year simply as **2026**, not `2026.06`. The chart can update when fully curated literature is added. Scientific transparency is preserved by displaying the current-curated update date separately rather than encoding the cutoff into the x-axis label.

## Promotion state machine

`DISCOVERED → DEDUPED → TRIAGED → NOTIFIED → PRIMARY_EVIDENCE_RECEIVED → EXTRACTED → QC_PASSED → LIVE_CURATED → FORMAL_RELEASE`

Possible terminal/holding states:

- `OUT_OF_SCOPE`
- `DUPLICATE`
- `PRIMARY_EVIDENCE_PENDING`
- `BOUNDARY_REVIEW`
- `QC_BLOCKED`

Only `QC_PASSED` records may become `LIVE_CURATED`.

## Formal release cadence

Do not mint a new formal version for every daily discovery. Instead:

- hotfix an existing scientific error with a patch release (for example 3.0.2);
- accumulate fully curated new literature in the current-curated layer;
- cut a new formal data-expansion release (for example 3.1.0) after a meaningful batch or manuscript/reproducibility milestone;
- run release-wide integrity, RAG and browser gates before publication.

This preserves both scientific freshness and reproducibility.
