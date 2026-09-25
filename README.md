# CuHalide Atlas

CuHalide Atlas integrates literature discovery, structure-resolved records, organic-component identity, sample-resolved photophysics and source-linked retrieval for organic-containing Cu(I) halide materials. It is a query-and-view research resource, not an unrestricted distribution of primary-source files.

## Current website

The original portal remains the single interface: Overview, Literature, Structures, Motifs, Photophysics, Polar, CuXplore and About data. The former project-specific companion is retired; its legacy URL returns users to CuXplore. No project-specific recommended pair is a fixed website result.

The integrated knowledge layer adds broader DOI discovery and authored source-review notes to the existing structure and sample records. It does not relabel bibliographic references as verified structures or promote a reported chemical name to a verified molecular graph.

## CuXplore and source-processing coverage

**CuXplore** is the literature-grounded research and retrieval interface within CuHalide Atlas: Cu for copper, X for Cl/Br/I, and explore for the task. It connects the curated scientific register to source-linked literature without changing the dataset identity or scientific release.

The full-text v2 source layer synchronized on **2026-09-24** contains **403 DOI records, 727 source documents, 21,421,324 extracted characters and 6,275 reproducible text blocks**. The source states are 664 native-text files, six sparse-text files and 57 empty/unreadable files. Within the active 410-DOI knowledge catalog, 384 DOI records contribute 6,175 native v2 blocks. The **1,322 article/structure semantic records remain a separate index**.

CIF processing is independent of prose retrieval. All **114/114 registered CIF files** have been parsed; the reconciliation layer contains 237 Cu-containing structure blocks, 29 identity-review rows (26 resolved, three quarantined) and 10/10 adjudicated dimensionality flags. Parsed CIF results do not automatically overwrite the 939-row curated structural authority.

Literature and CuXplore expose source availability and bounded retrieval locators while keeping original source files private. v2 matches use indexed text-block and character-range locators; older page-bounded text is used only as DOI-level fallback where v2 text is absent. Retrieval does not promote a text mention into a verified chemical, crystallographic or photophysical assignment.

See [CuXplore release scope](docs/CUXPLORE_RELEASE_SCOPE.md) for provenance, coverage definitions and reproducibility limits.

## Scientific and interface versions

The scientific current release remains **Current Curated rev.10**, curated through **2026-09-14**. The authored source-review overlay is dated **2026-09-23**; the full-text source index was synchronized on **2026-09-24**; the site-wide denominator, provenance and interface-metadata synchronization was completed on **2026-09-25**. These dates describe different operations and do not change the scientific curation cutoff.

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

The public literature corpus contains **410 DOI-deduplicated articles**. This is the single article denominator used by the website. Some articles have linked structured scientific records and some do not; that is represented as per-article data availability rather than as a separate literature class. The semantic layer still contains 383 article documents plus 939 structure documents because semantic indexing and structured-data revision coverage are separate processing layers, not alternative article totals. Forty-one authored source-review notes are linked by DOI. The earlier 402-record research collection is an older overlapping source collection, not the current website denominator.

## Integrated use

- **Literature:** the website uses one 410-article DOI-deduplicated corpus. Filters may show articles with linked structured data, source-reviewed articles, or articles with indexed MAIN/SI text, but these are coverage subsets of the same corpus rather than separate literature classes.
- **Article and structure details:** follow existing one-to-one structure links, sample-resolved measurements and organic-component resolution states. The source-review panel supplies an authored source statement and its qualification, not a publisher quotation.
- **CuXplore:** search ranked evidence, inspect source-linked records, select references and ask across literature, structures and photophysics while preserving evidence grain.
- **Retrieval provenance:** distinguish exact structured lookup, hybrid article/structure retrieval and lexical discovery/source-review context. Scores are relevance signals, not truth probabilities. Supplemental references are not silently added to the semantic-embedding count.

## Retrieval implementation

The semantic layer retains 1,322 current-curated article/structure records. The source layer adds full-text lexical retrieval over indexed MAIN/SI text alongside titles, authored source-review notes and curated descriptions, with exact DOI priority. A server-side, field-whitelisted projection joins linked scientific records.

The integrated RAG layer returns source-reviewed findings from the same literature corpus while preserving per-article source and structured-data availability. It records which retrieval method ran, whether a fallback occurred, and whether any new generation was performed. No benchmark improvement, independent discovery or new embedding coverage is inferred from catalog size. Existing exact-count and historical-snapshot routes remain authoritative.

## Evidence boundaries

Article identity, compound constitution, crystallographic determination and optical sample are different entities. Global connectivity dimensionality is not inferred from local motif, empirical formula, nuclearity or space group. Article-level optical values are not assigned to a structure without a verified mapping. Polar symmetry does not demonstrate ferroelectric switching. Canonical organic connectivity is depicted only when the database marks it verified; abbreviations and formulae alone are insufficient.

Source-review notes retain material-specific qualifications. They do not rewrite existing structured values or automatically resolve source conflicts. No new scientific measurement or unsupported mechanism is introduced by a website upgrade.

## Private and public data

Public data are limited to selected bibliographic, structural, sample, scope and authored-review fields. Raw primary PDFs/SI/CIF, publisher passages, private storage locators, full internal payloads, credentials and unpublished experimental records remain private. Catalog RPC access is service-role only; public requests pass through a bounded, read-only endpoint. `/api/export` remains unavailable.

The portal remains **prepublication-review** with noindex/nofollow/noarchive. Direct-link review access is not authentication or formal archival publication. A permanent repository DOI or blanket license is not asserted.

## Immutable archive

**Frozen Release 3.0.2** remains unchanged: 346 article-audit records, 332 canonical verified articles, 878 structure records, 816 Core-Included structures and 1,224 embedded documents. Its scientific cutoff is **2026-06-30**; the archived release was issued on **2026-08-11**. This historical cutoff does not restrict living literature discovery.

## Release safeguards

The existing PR-based production gate, Chromium and Lighthouse checks remain mandatory. Integrated knowledge QA additionally checks live denominator reconciliation, exact DOI retrieval, review/source separation, linked-record navigation, responsive layout, accessibility and absence of automatic model calls. A failed backend is shown as unavailable, not as an empty scientific result.

Use the access date, scientific Current Curated revision and knowledge-interface contract when describing a live result. Older release notes under `docs/` remain historical records.
