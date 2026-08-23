# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge base for organic-containing Cu(I) chloride, bromide and iodide materials. The review portal is a read-only query-and-view interface; the complete normalized curation corpus and primary-evidence archive remain private.

## Prepublication release status

**CuHalide Atlas is currently in a prepublication review state, not a formally released public dataset.** Direct-link access is retained for review and internal/advisor sharing, while search-engine indexing is disabled. Formal domain, ownership/authentication, archival identifier/DOI, licensing and final public-release metadata are intentionally not asserted until the owner completes those governance decisions. Any later public launch must explicitly remove the prepublication indexing boundary through a reviewed release change.

## Authoritative scientific state

Two scientific layers are intentionally distinct.

### Current Curated rev.7 — living scientific state

Curated through **2026-08-19**. Rev.7 is the current full atomic/context structure snapshot after a hostile structure-truth re-audit. Reported composition, normalized local Cu–X motif and global connectivity dimensionality are represented as separate scientific fields; unresolved values remain unresolved when primary evidence does not support a defensible one-to-one assignment.

| Denominator | Current Curated rev.7 |
|---|---:|
| Article audit records | 383 |
| Chemically included articles | 372 |
| Canonical verified articles | 369 |
| Structure / phase rows | 946 |
| Core-Included structure rows | 886 |
| Resolved space-group rows | 710 |
| Verified one-to-one SG rows | 684 |
| Verified polar rows | 97 |
| Strict-polar rows | 87 |
| Strict-polar articles | 54 |
| RAG documents / embeddings | 1,329 / 1,329 |

Motif Atlas rev.7 contains **946 taxonomy rows**, of which **628** have a resolved local Cu–X motif and **318** remain unresolved; **35** of the unresolved rows retain an unresolved legacy material-category mapping rather than being force-classified. Global dimensionality is intentionally unresolved for **57** structure rows where the available primary evidence does not establish a defensible structure-grain connectivity rank.

The active structure-truth audit is a one-to-one mirror of the current snapshot: **946 audit rows / 946 unique current structure IDs / 0 missing / 0 orphan**. A remaining `Unresolved` value is a terminal evidence boundary, not unfinished curation.

### Frozen Release 3.0.2 — immutable historical snapshot

Released **2026-08-11** and verified through **2026-06-30**. It is retained for exact historical reproduction and is never rewritten by living curation.

| Denominator | Frozen 3.0.2 |
|---|---:|
| Article audit records | 346 |
| Chemically included articles | 335 |
| Canonical verified articles | 332 |
| Structure / phase rows | 878 |
| Core-Included structure rows | 816 |
| Resolved space-group rows | 650 |
| Verified one-to-one SG rows | 625 |
| Verified polar rows | 87 |
| Strict-polar rows | 67 |
| Strict-polar articles | 42 |
| RAG documents / embeddings | 1,224 / 1,224 |

The 2026-06-30 date is a boundary of the archived snapshot, **not** a cutoff for the living knowledge base.

## Evidence and entity rules

- One article-audit row per normalized DOI.
- Article, chemical identity and crystallographic determination are different entity grains.
- **Reported composition, normalized local Cu–X motif and global connectivity dimensionality are distinct fields.** A Cu2I2, Cu2I4 or Cu4I4 local unit does not by itself establish a globally 0D material.
- Formula, title wording, nuclearity and space group are not used as proxies for structural dimensionality.
- Multiple polymorphs, temperatures, CIF blocks or independent refinements remain separate structure rows when primary evidence supports separate determinations.
- Evidence hierarchy for crystallography: **CIF > SI crystallographic table > main article > external bibliographic metadata**.
- Shared article-level crystallography or dimensionality is not propagated to an individual compound/phase without a defensible one-to-one mapping.
- Missing or non-unique mappings remain unresolved; space group, motif, topology, empirical formula or photophysics are not inferred from analogy or arithmetic repair.
- Aggregate/context rows spanning multiple compounds or topologies do not receive a fabricated single topology.
- Fractional or mixed-occupancy Cu/halide stoichiometry is never rounded or truncated into an integer Cu–X motif without independent structure-grain connectivity evidence.
- Amorphous/glass states do not receive crystallographic space groups.
- Article-grain emission, PLQY, lifetime or mechanism is not copied to individual structures without explicit structure-specific mapping.
- Polar point-group symmetry does not establish ferroelectric switching.
- Strict-polar requires Core-Included status, polar symmetry and High space-group/mapping confidence.

## Rev.7 structure-truth audit

Rev.7 re-adjudicates compound/phase identity, crystallographic mapping, local Cu–X motif and global dimensionality across the full current structure set. Representative corrections include:

- Record 6: both temperature-dependent C6H18N2Cu2I4 determinations are **0D discrete [Cu2I4]2− cluster structures** while retaining distinct P-1 and P2/c crystallographic phases.
- Record 60: compound-specific 0D Cu3X7 and 1D Cu2X4 members are restored with their correct CCDC mappings.
- Record 91: the RSC SI mapping corrects CUH-091-S02 to C36H36Cu3I6N3, **P21/n, CCDC 2350403, 1D edge-sharing [CuI4] chain**.
- Record 104: network compositions remain networks; the set includes 0D Cu2I4/Cu4I6 members, **1D Cu6I8(L3)2** and **2D Cu4I6(L4)2**.
- Record 154: the All-in-One structures are treated as **finite 0D molecular clusters**, not assigned dimensionality from packing/contact heuristics.
- Records 170, 172, 185 and 186: local Cu–X units are explicitly separated from 1D/2D/3D global coordination-network dimensionality.
- Record 246: Cu4I8, Cu2I4-chain and Cu11X15 layer members are assigned compound-specifically rather than inheriting a family-level `0D/1D/2D` label.
- Record 328: PZ-ACN is the **1D CuI4-chain** structure (CCDC 2444174), whereas PZ-HI is the **0D Cu2I6 cluster** structure (CCDC 2402042).

See [`docs/CURRENT_CURATED_R7_2026-08-19.md`](docs/CURRENT_CURATED_R7_2026-08-19.md) for the current scientific baseline, audit semantics, QC gates and deliberately unresolved evidence boundaries.

## Public runtime contract

The rev.7 staged-review runtime contract is:

- Site: **v50**
- UI: **50.2**
- Metadata gateway: **50.4**
- Public Data: **2.16.0**
- Structured Photophysics contract: **1.3.0**
- Smart RAG: **9.19.0**
- Research Assistant: **10.4.1**
- Motif Atlas: **1.2**
- Current evidence corpus: **1,329 BGE-M3 documents / 1,329 embeddings**

Current queries use the rev.7 full-current evidence corpus. Exact counts and protected structure-grain scientific boundaries remain deterministic. Structured photophysics uses an explicit staged-verification policy:

- **Pass A curated** means the primary-evidence curation gate is complete for the article and its exposed sample/measurement/value records. It does **not** mean that independent Pass B verification has been completed.
- **Two-pass verified** means Pass A and independent Pass B are complete and the article-level review agrees.
- Measurement-level QC remains fail-closed in both stages. A source-conflicted, unresolved or otherwise ineligible measurement stays withheld even when other measurements from the same Pass A article are exposed.
- Quantitative-analysis eligibility is a separate flag and is never implied merely by publication-stage eligibility.

This staged policy allows the living review portal to expose carefully curated first-pass evidence without falsely presenting it as independently double-verified. Pass B can subsequently promote or correct individual records without rewriting the scientific entity model. Frozen 3.0.2 evidence is consulted only when a question explicitly asks for the archived snapshot or historical denominator. Literature Watch candidate metadata remains outside curated evidence until promotion through the defined review/QC gate.

## Public/private boundary

Review access is intentionally **query-and-view**, not bulk redistribution. Review pages may expose selected bibliographic, structural, crystallographic, motif, scope, evidence-status and staged photophysics fields. The photophysics projection does **not** expose primary source filenames, raw publisher files, raw evidence locators, internal sample IDs or unpublished adjudication notes; processed/composite/device states remain distinct from crystallographic structure rows.

The following remain private research assets: complete normalized tables/raw payloads, exact stored publisher abstracts, primary PDF/SI/CIF files, field-evidence excerpts and raw evidence locators, candidate scores/reason codes/source payloads, and internal QA/adjudication artifacts. `/api/export` is intentionally unavailable.

A manuscript-specific minimal dataset can be deposited separately when required for reproducibility. No permanent repository DOI or blanket project-wide license is asserted until the owner authorizes archival metadata and rights decisions.

## Citation

Before formal public release, treat the portal as a prepublication review resource rather than a deposited public dataset. For living-atlas results shared during review, report the access date and Current Curated revision. For exact historical reproduction, use **Archived scientific snapshot 3.0.2 (2026-08-11)**, verified through 2026-06-30.