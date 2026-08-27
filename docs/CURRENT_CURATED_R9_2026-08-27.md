# CuHalide Atlas — Current Curated rev.9

Date: 2026-08-27

Current Curated rev.9 is the living scientific state of CuHalide Atlas. It is not a new frozen archival release and does not modify Frozen Release 3.0.2.

## Scientific denominators

- Article audit records: 383
- Chemically included articles: 372
- Canonical verified articles: 369
- Structure / phase rows: 947
- Core-Included structure rows: 887
- Resolved space-group rows: 744
- Verified one-to-one space-group rows: 717
- Verified polar rows: 101
- Strict-polar rows: 91
- Strict-polar articles: 57
- Structure taxonomy rows: 947
- Resolved local Cu–X motif rows: 640
- Explicitly unresolved local motif rows: 307
- Current RAG documents / embeddings: 1,330 / 1,330

## Rev.9 closeout scope

Rev.9 hardens structure-grain truth and evidence-state semantics rather than force-completing unresolved fields.

1. Member-specific crystallographic assignments were separated from article-level crystallography. Article-level values are not propagated to a member unless the primary evidence supports a unique mapping.
2. Multiple temperature/polymorph/refinement determinations are represented as separate structure rows where appropriate.
3. Aggregate or overcompressed legacy rows were reconstructed at determination/member grain where the evidence supports that split.
4. Space-group, dimensionality and mapping unresolved states are explicitly terminal when the available primary evidence cannot uniquely establish a value.
5. Organic-component structure association and canonical molecular connectivity are separate states. A searchable token/name/abbreviation is not a verified molecular graph.
6. All Core-Included structure-grain organic-component states are closed. All component representation rows have a canonical-connectivity resolution state.
7. Crystallographic derived fields were audited for internal consistency. Canonical `P21/n` is represented as space-group type No. 14.
8. Cell-volume consistency was recomputed where sufficient unit-cell parameters exist. Source-level numerical inconsistencies are preserved and flagged rather than silently repaired.
9. Structured Photophysics 1.4.0 is retained unchanged after a 12-table active-vs-candidate reconciliation with zero bidirectional differences.
10. The Rev.9 RAG corpus is a full-current 383-article + 947-structure snapshot with 1,330/1,330 BGE-M3 embeddings and validated content hashes.

## Organic Components 1.2.0

The public organic-component projection is database-authoritative and fail-closed for molecular connectivity.

- Representation rows: 965
- Represented structures: 908
- Distinct component keys: 438
- Verified-connectivity rows: 61
- Structures with verified connectivity: 59
- Explicitly unresolved rows: 894
- Not-applicable rows: 10

The high unresolved count is intentional: names, abbreviations and formula tokens remain searchable, but a 2D molecular graph is only asserted when member-specific canonical connectivity is independently verified.

## Structured Photophysics 1.4.0

- Article queue: 383
- Two-pass verified data-bearing articles: 329
- Verified-no-data articles: 54
- Pass A-only public articles: 0
- Publishable samples: 940
- Publishable measurements: 2,275
- Publishable normalized values: 3,002
- Quantitative-analysis-eligible values: 280
- Publishable mechanism claims: 478
- Conflict rows: 66
- Nonterminal conflicts: 0

Private primary files and evidence locators remain excluded from public projections.

## Runtime contract

- Site: v51
- UI: 51.0
- Metadata gateway: 51.0
- Public Data: 2.17.1
- Structured Photophysics: 1.4.0
- Organic Components: 1.2.0
- Smart RAG: 9.20.0
- Research Assistant: 10.5.0
- Motif Atlas: 1.2
- Current evidence corpus: 1,330 BGE-M3 documents / 1,330 embeddings
- Governance state: prepublication-review

Frozen Release 3.0.2 remains immutable and separately addressable for exact historical reproduction. Literature Watch candidates remain metadata-only until curation/QC promotion.
