# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge base for organic-containing Cu(I) chloride, bromide and iodide materials. The public site is a read-only query-and-view interface; the complete curation corpus and primary-evidence archive remain private.

## Authoritative scientific state

Two scientific layers are intentionally distinct.

### Current Curated rev.5 — living default

Curated through **2026-08-17**. Rev.5 retains the rev.4 full-current atomic/context structure architecture and adds a primary-evidence-reviewed literature batch while preserving structure grain, local Cu–X motif, and global connectivity dimensionality as separate scientific axes.

| Denominator | Current Curated rev.5 |
|---|---:|
| Article audit records | 379 |
| Chemically included articles | 368 |
| Canonical verified articles | 365 |
| Structure / phase rows | 938 |
| Core-Included structure rows | 878 |
| Resolved space-group rows | 705 |
| Verified one-to-one SG rows | 679 |
| Verified polar rows | 96 |
| Strict-polar rows | 81 |
| Strict-polar articles | 51 |
| RAG documents / embeddings | 1,317 / 1,317 |

Motif Atlas rev.5 contains **938 taxonomy rows**, of which **581** have a resolved motif and **357** remain unresolved. **35** rows retain an unresolved legacy material-category mapping rather than being force-classified.

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
- **Reported composition, normalized local Cu–X motif and global connectivity dimensionality are distinct fields.** A Cu2I2 or Cu4I4 local repeat does not imply a globally 0D material.
- Multiple polymorphs, temperatures, CIF blocks or independent refinements remain separate structure rows when primary evidence supports separate determinations.
- Evidence hierarchy for crystallography: **CIF > SI crystallographic table > main article > external metadata**.
- Missing or non-unique mappings remain unresolved; space group, motif, topology, empirical formula or photophysics are not inferred from analogy or arithmetic repair.
- Halogen type refers to the Cu–halide structural unit, not an unrelated organic substituent halogen.
- Fractional/mixed-occupancy Cu/halide stoichiometry is never rounded or truncated into an integer Cu–X motif without independent structure-grain connectivity evidence.
- Article-grain emission, PLQY, lifetime or mechanism is not copied to individual structures without explicit structure-specific mapping.
- Polar point-group symmetry does not establish ferroelectric switching.
- Strict-polar requires Core-Included status, polar symmetry and High SG/mapping confidence.

## Rev.4 hostile structure re-audit and rev.5 additions

Rev.4 remains the hostile full-corpus structure-truth baseline. It removed non-structure placeholders, repaired structure/determination identity, completed crystallographic mappings where primary evidence permitted, and retained genuine source conflicts explicitly rather than silently normalizing them.

Rev.5 adds **six peer-reviewed in-scope articles and fourteen structure-grain determinations** after DOI/CCDC/identity deduplication and primary-evidence review. Examples include:

- two isolated 0D Cu4Br6 phases in `10.1002/anie.202519379`, including the C2/polar mixed-cation phase;
- discrete rhomboid Cu2I2 and cubane Cu4I4 clusters in `10.1021/acs.inorgchem.5c05228`;
- a discrete 0D stairstep Cu4I4(L1)2 cluster in `10.1016/j.jlumin.2026.121789`;
- five ICA structures in `10.1016/j.ica.2026.123354` represented as **local Cu2I2 repeats within globally 1D polymeric ladder chains**, not 0D dimers;
- the CEJ structure in `10.1016/j.cej.2026.177390` represented as a **local stepped Cu4I4 repeat within a globally 1D Cu–I zigzag coordination polymer**; its empirical formula remains unresolved rather than being replaced by the shorthand `PyPzPh-CuI`;
- three discrete 0D planar-rhomboid Cu2I2 complexes in `10.1021/acsaom.6c00035`.

The Research Square preprint `10.21203/rs.3.rs-9170631/v1` was primary-evidence reviewed and retained in Literature Watch as an in-scope preprint candidate, but it is **not** counted in Current Curated canonical denominators.

A source-internal crystallographic inconsistency in ICA complex 3 (CCDC 2407308) is retained explicitly: the SI reports mutually incompatible b/c/volume cell data, so the normalized b, c and V fields remain unresolved rather than being mathematically reconstructed.

See `docs/CURRENT_CURATED_R5_2026-08-17.md` and `docs/CURRENT_CURATED_R5_RELEASE_AUDIT_2026-08-17.md` for the rev.5 scientific baseline and destructive release audit.

## Public runtime

Current public runtime contract after v50 deployment:

- Site: **v50**
- UI: **50.0**
- Public Data: **2.12.0**
- Smart RAG: **9.17.0**
- Research Assistant: **10.2.0**
- Motif Atlas: **1.2**
- Current evidence corpus: **1,317 BGE-M3 documents / 1,317 embeddings**

Current queries use the rev.5 full-current corpus. Frozen 3.0.2 evidence is consulted only when a question explicitly asks for the archived snapshot or historical denominator. Literature Watch candidate metadata remains outside curated evidence until promotion through the defined review/QC gate.

## Public/private boundary

Public access is intentionally **query-and-view**, not bulk redistribution. Public pages expose selected bibliographic, structural, crystallographic, motif, scope and evidence-status fields. The following remain private: complete normalized tables/raw payloads, exact stored publisher abstracts, primary PDF/SI/CIF files, evidence excerpts and locators, candidate scores/reason codes/source payloads, and internal QA/adjudication artifacts. `/api/export` is intentionally unavailable.

A manuscript-specific minimal dataset can be deposited separately when required for reproducibility. No permanent repository DOI or blanket project-wide license is asserted until the owner authorizes archival metadata and rights decisions.

## Citation

For living-atlas results, cite **CuHalide Atlas, continuously curated Cu(I) halide knowledge portal**, report the access date, and use the current public provenance metadata. For exact historical reproduction, cite **Archived scientific snapshot 3.0.2 (2026-08-11)**, verified through 2026-06-30.
