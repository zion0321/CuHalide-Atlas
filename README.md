# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge base for organic-containing Cu(I) chloride, bromide and iodide materials. The public site is a read-only query-and-view interface; the complete curation corpus and primary-evidence archive remain private.

## Authoritative scientific state

Two scientific layers are intentionally distinct.

### Current Curated rev.4 — living default

Curated through **2026-08-17**. Rev.4 replaces the former append-only structure overlay with a **full-current atomic/context structure snapshot** so corrections, removals, splits and phase-specific determinations can be represented without duplicating obsolete Frozen rows.

| Denominator | Current Curated rev.4 |
|---|---:|
| Article audit records | 373 |
| Chemically included articles | 362 |
| Canonical verified articles | 359 |
| Structure / phase rows | 924 |
| Core-Included structure rows | 864 |
| Resolved space-group rows | 691 |
| Verified one-to-one SG rows | 665 |
| Verified polar rows | 94 |
| Strict-polar rows | 79 |
| Strict-polar articles | 49 |
| RAG documents / embeddings | 1,297 / 1,297 |

Motif Atlas rev.4 contains **924 taxonomy rows**, of which **567** have a resolved motif and **357** remain unresolved. **35** rows retain an unresolved legacy material-category mapping rather than being force-classified.

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
- Multiple polymorphs, temperatures, CIF blocks or independent refinements remain separate structure rows when primary evidence supports separate determinations.
- Evidence hierarchy for crystallography: **CIF > SI crystallographic table > main article > external metadata**.
- Missing or non-unique mappings remain unresolved; space group, motif, topology or photophysics are not inferred from analogy.
- Halogen type refers to the Cu–halide structural unit, not an unrelated organic substituent halogen.
- Fractional/mixed-occupancy Cu/halide stoichiometry is never rounded or truncated into an integer Cu–X motif without independent structure-grain connectivity evidence.
- Article-grain emission, PLQY, lifetime or mechanism is not copied to individual structures without explicit structure-specific mapping.
- Polar point-group symmetry does not establish ferroelectric switching.
- Strict-polar requires Core-Included status, polar symmetry and High SG/mapping confidence.

## Rev.4 hostile re-audit

Rev.4 performs entity-level and crystallographic hostile review across the current structure register. Examples of corrections include:

- removal of two non-structure article-level placeholders (`CUH-244-S01`, `CUH-305-S01`) while retaining their review/perspective articles as boundary context;
- separation of record 32 R/S Cu4I6 enantiomeric SCXRD determinations and one-to-one CCDC mappings;
- phase-specific promotion of alpha-Gua3Cu2I5 where primary crystallography supports Fdd2;
- completion of record 45 Cu5I7 C2 / C2/c one-to-one mappings;
- verification that record 160 contains two independent 235 K refinements rather than a duplicate import;
- CIF-first adjudication of record 160 compound 3 (`CUH-160-S11`) as **C2/c, nonpolar**, while retaining the main-article `Cc` statement as an explicit source conflict.

See `docs/CURRENT_CURATED_R4_2026-08-17.md` for the release audit.

## Public runtime

Current public runtime contract:

- Site: **v49**
- UI: **49.0**
- Public Data: **2.11.0**
- Smart RAG: **9.16.0**
- Research Assistant: **10.1.0**
- Motif Atlas: **1.2**
- Current evidence corpus: **1,297 BGE-M3 documents / 1,297 embeddings**

Current queries use the rev.4 full-current corpus. Frozen 3.0.2 evidence is consulted only when a question explicitly asks for the archived snapshot or historical denominator.

## Public/private boundary

Public access is intentionally **query-and-view**, not bulk redistribution. Public pages expose selected bibliographic, structural, crystallographic, motif, scope and evidence-status fields. The following remain private: complete normalized tables/raw payloads, exact stored publisher abstracts, primary PDF/SI/CIF files, evidence excerpts and locators, candidate scores/reason codes/source payloads, and internal QA/adjudication artifacts. `/api/export` is intentionally unavailable.

A manuscript-specific minimal dataset can be deposited separately when required for reproducibility. No permanent repository DOI or blanket project-wide license is asserted until the owner authorizes archival metadata and rights decisions.

## Citation

For living-atlas results, cite **CuHalide Atlas, continuously curated Cu(I) halide knowledge portal**, report the access date, and use the current public provenance metadata. For exact historical reproduction, cite **Archived scientific snapshot 3.0.2 (2026-08-11)**, verified through 2026-06-30.
