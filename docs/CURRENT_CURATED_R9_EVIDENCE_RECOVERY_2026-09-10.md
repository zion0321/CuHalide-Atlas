# Current Curated rev.9 — primary-evidence recovery, 2026-09-10

This note records a living-state evidence repair. It does **not** modify immutable Frozen Release 3.0.2.

## Scope

A 16-asset primary-evidence bundle was reconciled against Current Curated rev.9. The assets map to 11 existing DOI records; no new or duplicate article record was created.

Record 156 (`10.1021/acs.cgd.5b01721`) was promoted from primary-evidence-pending after the main article, supporting information and crystallographic data became available. Seven member-specific SCXRD determinations are now supported directly. Members for which the primary source reports no suitable single crystal remain explicitly unresolved. A PXRD-supported topology assignment is not used to copy a space group from a different member.

The same evidence pass strengthened or corrected member-level crystallography/topology for Records 110, 136, 271, 276, 299, 311 and 346. Records 307 and 342 gained supporting-information coverage, but member-specific crystallographic values absent from that evidence remain unresolved rather than inferred.

## Current scientific state

- article audit records: **383**
- chemically included articles: **372**
- canonical verified articles: **371**
- structure/phase rows: **947**
- Core-Included structure rows: **901**
- resolved space-group rows: **760**
- verified one-to-one space-group rows: **733**
- verified polar rows: **101**
- strict-polar rows: **94** across **60** articles
- taxonomy rows: **947**
- source-resolved local Cu–X motifs: **674**; explicitly unresolved: **273**
- source-resolved motif geometry: **264**; explicitly unresolved: **683**
- Current RAG documents/embeddings: **1,330 / 1,330**

## Unresolved-state closure

The current Core-Included scientific fields are fail-closed. Every remaining unresolved space group, structural dimensionality, member mapping, local motif formula and motif geometry has an explicit terminal evidence state; there are no open/unclassified unresolved rows in those five fields.

These terminal states are source-limited outcomes, not values awaiting formula-, analogy- or neighboring-member inference. They are retained until new member-specific primary evidence becomes available.

Record 187 (`10.1515/znb-1999-0120`) remains the sole chemically included article still pending unavailable primary evidence and is intentionally deferred.

## Organic Components and RAG

The public Organic Components 1.2.0 projection contains **976** representation rows across **919** structures: **61** verified-connectivity rows, **905** explicit unresolved rows and **10** not-applicable rows. Unresolved molecular connectivity is a deliberate fail-closed state and does not block searchability of source-supported names or tokens.

The evidence repair regenerated and re-embedded **49** affected Current Curated retrieval documents. The active corpus remains **1,330 / 1,330**, with validated content hashes and no missing embeddings.

## Privacy boundary

Primary PDFs, SI, CIF files, source hashes, raw evidence locators and internal adjudication objects remain private. The prepublication portal remains query-and-view only; bulk export is not enabled and indexing remains disabled.
