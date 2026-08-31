# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge base for organic-containing Cu(I) chloride, bromide and iodide materials. The review portal is a read-only query-and-view interface; the complete normalized curation corpus and primary-evidence archive remain private.

## Prepublication release status

**CuHalide Atlas is currently in a prepublication review state, not a formally released public dataset.** Direct-link access is retained for review and internal/advisor sharing, while search-engine indexing is disabled. Formal domain, ownership/authentication, archival identifier/DOI, licensing and final public-release metadata are intentionally not asserted until the owner completes those governance decisions.

## Authoritative scientific state

Two scientific layers are intentionally distinct.

### Current Curated rev.9 — living scientific state

Curated through **2026-08-19**, with source-explicit evidence repairs verified through **2026-08-31**. Rev.9 is the current full article + atomic/context-structure snapshot. It preserves the hostile structure-truth audit and targeted primary-source corrections, then closes member-level identity and evidence-state boundaries only where primary evidence supports a unique assignment.

| Denominator | Current Curated rev.9 |
|---|---:|
| Article audit records | 383 |
| Chemically included articles | 372 |
| Canonical verified articles | 370 |
| Structure / phase rows | 947 |
| Core-Included structure rows | 890 |
| Resolved space-group rows | 747 |
| Verified one-to-one SG rows | 720 |
| Verified polar rows | 101 |
| Strict-polar rows | 91 |
| Strict-polar articles | 57 |
| RAG documents / embeddings | 1,330 / 1,330 |

The structure taxonomy is one-to-one with the current structure register: **947 taxonomy rows**. Local Cu–X motif is source-resolved for **663** rows and explicitly unresolved for **284** rows; motif geometry is source-resolved for **217** rows. **35** unresolved rows retain an unresolved legacy material-category mapping rather than being force-classified.

Rev.9 makes evidence boundaries first-class data. Every Core-Included structure has an explicit organic-component structure-grain state, every reported component row has an explicit canonical-connectivity state, and unresolved space-group, dimensionality and mapping cases are represented as terminal evidence states rather than guessed values. A reported name, abbreviation or empirical formula remains searchable without being promoted to a verified molecular graph.

The 31 August evidence repair also re-opened source-explicit cases that older conservative rules had left unresolved. In particular, Record 205 was promoted after direct primary-article verification established three isolated 1D iodocuprate members with space groups **P21/c, Pnma and Pnna** and explicit Cu3I4 / Cu2I3 chain descriptions. Other motif/geometry repairs were accepted only when member-specific source language or verified structure evidence was explicit; empirical stoichiometry and chemical analogy were not used to fill gaps.

After those repairs, exactly 41 structure RAG documents plus the Record 205 article document were regenerated from the current authority and re-embedded. The active current corpus is again **1,330 / 1,330**, with validated content hashes and zero structure/RAG scientific-field mismatches.

The crystallographic hostile QA also recomputes internally checkable cell-volume relationships. Source-level inconsistencies are retained as source-reported values with explicit erratum flags when no uniquely verified corrected CIF/value exists; source data are not silently repaired by arithmetic.

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
- Article, chemical identity, organic component and crystallographic determination are different entity grains.
- Article-level dimensionality classes are **retrieval/index metadata only**. They do not assert that every structure reported in an article has that dimensionality; physical connectivity dimensionality is assigned at the structure/phase-determination grain.
- **Reported composition, normalized local Cu–X motif and global connectivity dimensionality are distinct fields.** A local Cu2I2, Cu2I4 or Cu4I4 unit does not by itself establish a globally 0D material.
- Formula, title wording, nuclearity and space group are not used as proxies for structural dimensionality.
- Multiple polymorphs, temperatures, CIF blocks or independent refinements remain separate structure rows when primary evidence supports separate determinations.
- Evidence hierarchy for crystallography: **CIF > SI crystallographic table > main article > external bibliographic metadata**.
- Shared article-level crystallography or dimensionality is not propagated to an individual compound/phase without a defensible one-to-one mapping.
- Missing or non-unique mappings remain unresolved; space group, motif, topology, empirical formula, molecular connectivity or photophysics are not inferred from analogy or arithmetic repair.
- Aggregate/context rows spanning multiple compounds or topologies do not receive a fabricated single topology.
- Fractional or mixed-occupancy Cu/halide stoichiometry is never rounded or truncated into an integer Cu–X motif without independent structure-grain connectivity evidence.
- Amorphous/glass states do not receive crystallographic space groups.
- Article-grain emission, PLQY, lifetime or mechanism is not copied to individual structures without explicit structure-specific mapping.
- Polar point-group symmetry does not establish ferroelectric switching.
- Strict-polar requires Core-Included status, polar symmetry and High space-group/mapping confidence.

## Rev.9 closeout highlights

Rev.9 is primarily a scientific-state hardening release rather than a broad reinterpretation of the corpus.

- The current structure register is **947 rows**, with **890 Core-Included** rows.
- Canonical space-group derivation is internally consistent; the `P21/n` setting is represented as space-group type **No. 14**.
- Member-level organic-component coverage is closed with explicit resolution states. Token/name recognition is deliberately separated from verified canonical molecular connectivity.
- The public Organic Components projection contains **965 classified representation rows across 908 structures**. Only **61 rows across 59 structures** currently carry `verified_connectivity`; **894** remain explicitly unresolved and **10** are `not_applicable`. These counts describe representation/resolution rows, not a claim that 965 unique organic molecules exist.
- Cell-parameter/volume consistency is checked systematically. Publisher/source-level inconsistencies are flagged without fabricating corrected experimental values.
- The full current RAG corpus contains **383 article + 947 structure = 1,330 documents**, all with 1024-dimensional BGE-M3 embeddings and validated content hashes.

Rev.8 and Rev.7 remain historical recovery/audit layers. Frozen Release 3.0.2 remains the immutable archival denominator.

See [`docs/CURRENT_CURATED_R9_2026-08-27.md`](docs/CURRENT_CURATED_R9_2026-08-27.md) for the Rev.9 release note; the 31 August source-explicit repair is recorded in the production migration mirror under `supabase/migrations/`.

## Review runtime contract

The Rev.9 prepublication-review runtime contract is:

- Site: **v51**
- UI: **51.0**
- Metadata gateway: **51.0**
- Public Data: **2.17.1**
- Structured Photophysics contract: **1.4.0**
- Organic Components contract: **1.2.0**
- Smart RAG: **9.20.0**
- Research Assistant: **10.5.0**
- Motif Atlas: **1.2**
- Current evidence corpus: **1,330 BGE-M3 documents / 1,330 embeddings**
- Publication/governance state: **prepublication-review**

### Structured Photophysics 1.4.0

The 383-article review queue is fully terminal under the public policy: **329 data-bearing articles are two-pass verified** and **54 articles are verified-no-data**. There are no remaining Pass A-only public articles.

The public projection contains **940 sample states, 2,275 measurements, 3,002 normalized values, 280 quantitative-analysis-eligible values and 478 mechanism claims**. The curated conflict register contains **66** source-discrepancy objects with **0 nonterminal conflicts**; conflicts remain fail-closed. Raw primary files and raw evidence locators remain private.

### Organic Components 1.2.0

The database resolution tables are the sole authority for whether a molecular graph is verified. The browser may render a deterministic local 2D depiction only when the returned representation has `depiction.status = verified_connectivity`. Names, abbreviations, formula tokens, family labels and sibling compounds are never sufficient on their own to promote a graph.

This intentionally means that most reported organic-component representations remain drawable only as **2D unresolved** until member-specific canonical connectivity is independently verified. Searchability and structure association are preserved even when graph identity is withheld.

### Smart RAG / Research Assistant

Current queries use the Rev.9 full-current evidence corpus. Exact counts and protected scientific boundaries remain deterministic; general evidence retrieval uses BGE-M3 hybrid retrieval with reranking. Explicit requests for Frozen Release 3.0.2 route to the immutable archival corpus. Literature Watch candidate metadata is kept outside Current Curated denominators until promotion through the review/QC gate.

## Review/private boundary

Review access is intentionally **query-and-view**, not bulk redistribution. Review pages may expose selected bibliographic, structural, crystallographic, motif, scope, evidence-status, structured photophysics and structure-linked organic-component fields.

The following remain private research assets: complete normalized tables/raw payloads, exact stored publisher abstracts, primary PDF/SI/CIF files, field-evidence excerpts and raw evidence locators, candidate scores/reason codes/source payloads, source hashes and internal QA/adjudication artifacts. `/api/export` is intentionally unavailable.

A manuscript-specific minimal dataset can be deposited separately when required for reproducibility. No permanent repository DOI or blanket project-wide license is asserted until the owner authorizes archival metadata and rights decisions.

## Citation

Before formal public release, treat the portal as a prepublication review resource rather than a deposited public dataset. For living-atlas results shared during review, report the access date and **Current Curated rev.9**. For exact historical reproduction, use **Archived scientific snapshot 3.0.2 (2026-08-11)**, verified through 2026-06-30.
