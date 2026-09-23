# CuHalide Atlas

CuHalide Atlas integrates literature discovery, structure-resolved records, organic-component identity, sample-resolved photophysics and source-linked retrieval for organic-containing Cu(I) halide materials. It is a query-and-view research resource, not an unrestricted distribution of primary-source files.

## Current website

The original portal remains the single interface: Overview, Literature, Structures, Motifs, Photophysics, Polar, Research Assistant and About data. The former project-specific companion has been retired; its URL returns users to the main Research Assistant. No project-specific recommended pair is a fixed website result.

The integrated knowledge layer adds broader DOI discovery and authored source-review notes to the existing structure and sample records. It does not relabel bibliographic references as verified structures or promote a reported chemical name to a verified molecular graph.

## CuXplore and source-processing coverage

**CuXplore** is the literature-grounded research assistant within CuHalide Atlas: Cu for copper, X for Cl/Br/I, and explore for the research task. It names the assistant and retrieval interface, not a new foundation model. The website address and dataset citation identity remain unchanged.

The 23 September native-source import contains 75 original PDFs (48 MAIN and 21 SI files with native text, plus six scan/sparse MAIN files) and adds 1,450 page-bounded passages. Combined with the existing private index, **78 distinct catalog articles have MAIN or SI prose indexed**, comprising 48 MAIN and 46 SI article sets with overlap and **1,984 prose passages**. These are not extra semantic embeddings or newly verified experimental measurements.

Every catalog article has a processing view separating source registration, MAIN/SI extraction, CIF parsing, authored source review, linked structures and photophysics review. The Literature and CuXplore scope menus include **Indexed MAIN / SI text**. Retrieval can match actual private MAIN/SI text and return page-match metadata, while original passages remain private. Registered-but-unindexed sources, sparse scans, unpublished SI, inapplicable CIF, reviewed no-data results and unreviewed fields are distinguished.

See [CuXplore release scope](docs/CUXPLORE_RELEASE_SCOPE.md) for import provenance, coverage definitions and reproducibility limits. These are actual partial processing states across the full catalog, not a claim that all 410 original papers have been re-extracted or independently revalidated.

## Scientific and interface versions

The scientific current release remains **Current Curated rev.10**, curated through **2026-09-14**. The integrated knowledge interface and source-review overlay were updated on **2026-09-23**. These dates describe different operations.

| Current scientific denominator | Value |
|---|---:|
| Article audit records | 383 |
| Included / canonical verified articles | 372 |
| All structure / phase records | 939 |
| Core-Included structures | 901 |
| Resolved space-group records | 761 |
| Verified one-to-one space groups | 734 |
| Strict-polar structures | 94 |
| Articles with strict-polar structures | 60 |
| Current semantic documents / embeddings | 1,322 / 1,322 |

The semantic corpus contains 383 article and 939 structure documents. It is distinct from the expanded literature catalog. Catalog coverage is read live from `/api/knowledge?action=coverage`; it is not maintained by a hardcoded headline number. At this integration, the catalog joins the 372 included articles, 5 explicitly labeled boundary references, 32 historical/supplemental references and one newly linked reviewed reference (410 distinct DOI records). Forty-one authored source-review notes are linked by DOI. The earlier 402-record research collection is an older overlapping source collection, not the current website denominator.

## Integrated use

- **Literature:** keep the Curated collection for compound-level filters, or choose All indexed literature / Source-reviewed literature / Indexed MAIN / SI text / Additional literature. Additional references are separately labeled and do not receive fabricated structure or measurement mappings.
- **Article and structure details:** follow existing one-to-one structure links, sample-resolved measurements and organic-component resolution states. The source-review panel supplies an authored source statement and its qualification, not a publisher quotation.
- **Research Assistant:** inspect ranked evidence first, select up to six references, prepare a source-supported question, or save the selected context record. These retrieval and preparation actions make no model calls. Sending a question is a separate explicit action using the existing assistant.
- **Retrieval provenance:** distinguish exact structured lookup, hybrid article/structure retrieval and lexical discovery/source-review context. Scores are relevance signals, not truth probabilities. Supplemental references are not silently added to the semantic-embedding count.

## Retrieval implementation

The core semantic index retains BGE-M3 embeddings and its existing hybrid search/reranking contract. The knowledge catalog adds deterministic lexical retrieval over weighted titles, authored source-review notes and curated descriptions, with term coverage and exact DOI priority. A server-side, field-whitelisted projection joins linked structures. Both interfaces use the same knowledge RPC.

The integrated RAG layer returns source-reviewed findings and separate supplemental-literature records. It records which retrieval method ran, whether a fallback occurred, and whether any new generation was performed. No benchmark improvement, independent discovery or new embedding coverage is inferred from catalog size. Existing exact-count and historical-snapshot routes remain authoritative.

## Evidence boundaries

Article identity, compound constitution, crystallographic determination and optical sample are different entities. Global connectivity dimensionality is not inferred from local motif, empirical formula, nuclearity or space group. Article-level optical values are not assigned to a structure without a verified mapping. Polar symmetry does not demonstrate ferroelectric switching. Canonical organic connectivity is depicted only when the database marks it verified; abbreviations and formulae alone are insufficient.

Source-review notes retain material-specific qualifications. They do not rewrite existing structured values or automatically resolve source conflicts. No new scientific measurement or unsupported mechanism is introduced by a website upgrade.

## Private and public data

Public data are limited to selected bibliographic, structural, sample, scope and authored-review fields. Raw primary PDFs/SI/CIF, publisher passages, private storage locators, full internal payloads, credentials and unpublished experimental records remain private. Catalog RPC access is service-role only; public requests pass through a bounded, read-only endpoint. `/api/export` remains unavailable.

The portal remains **prepublication-review** with noindex/nofollow/noarchive. Direct-link review access is not authentication or formal archival publication. A permanent repository DOI or blanket license is not asserted.

## Immutable archive

**Frozen Release 3.0.2** remains unchanged: 346 article-audit records, 332 canonical verified articles, 878 structure records, 816 Core-Included structures and 1,224 embedded documents; verified through 2026-06-30. This historical cutoff does not restrict living literature discovery.

## Release safeguards

The existing PR-based production gate, Chromium and Lighthouse checks remain mandatory. Integrated knowledge QA additionally checks live denominator reconciliation, exact DOI retrieval, review/source separation, linked-record navigation, responsive layout, accessibility and absence of automatic model calls. A failed backend is shown as unavailable, not as an empty scientific result.

Use the access date, scientific Current Curated revision and knowledge-interface contract when describing a live result. Older release notes under `docs/` remain historical records.
