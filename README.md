# CuHalide Atlas

CuHalide Atlas is an evidence-grounded, structure-resolved knowledge base for organic-containing Cu(I) chloride, bromide and iodide materials. The review portal is a read-only query-and-view interface; the complete normalized curation corpus and primary-evidence archive remain private.

## Prepublication release status

**CuHalide Atlas is currently in a prepublication review state, not a formally released public dataset.** Direct-link access is retained for review and internal/advisor sharing, while search-engine indexing is disabled. Formal domain, ownership/authentication, archival identifier/DOI, licensing and final public-release metadata are intentionally not asserted until the owner completes those governance decisions. Any later public launch must explicitly remove the prepublication indexing boundary through a reviewed release change.

## Authoritative scientific state

Two scientific layers are intentionally distinct.

### Current Curated rev.8 — living scientific state

Curated through **2026-08-19**. Rev.8 is the current full atomic/context structure snapshot. It retains the full Rev.7 hostile structure-truth audit and adds a small primary-source-reverified correction set for structure-grain motif, dimensionality and chemical-identity mapping. Reported composition, normalized local Cu–X motif and global connectivity dimensionality remain separate scientific fields; unresolved values remain unresolved when primary evidence does not support a defensible one-to-one assignment.

| Denominator | Current Curated rev.8 |
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

The Rev.8 dimensionality delta is deliberately narrow and auditable: among the 886 Core-Included structure rows, **0D changes from 521 to 520 and 1D changes from 247 to 248**; **2D remains 53, 3D remains 25 and unresolved remains 40**. Polar and strict-polar denominators are unchanged.

Motif Atlas contains **946 taxonomy rows**, of which **628** have a resolved local Cu–X motif and **318** remain unresolved; **35** of the unresolved rows retain an unresolved legacy material-category mapping rather than being force-classified. Across all 946 structure rows, global dimensionality remains intentionally unresolved for **57** rows where the available primary evidence does not establish a defensible structure-grain connectivity rank.

The structure-truth audit remains a one-to-one mirror of the current structure register: **946 audit rows / 946 unique current structure IDs / 0 missing / 0 orphan**. A remaining `Unresolved` value is an evidence boundary, not a license to infer a topology from formula, family membership or analogy.

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

## Rev.8 primary-source correction set

Rev.8 does **not** reinterpret hundreds of structures. It applies field-level activation gates to the Rev.7 audit, rejects audit regressions, and activates only corrections that were independently re-read against structure-grain primary evidence in the Rev.8 closeout.

The scientific-value changes are concentrated in the following records:

- **CUH-285-S04 / Record 285** — `(NBu4)7[Cu6I9][Cu7I11]` contains two coexisting discrete iodocuprate anions, `[Cu6I9]3−` and `[Cu7I11]4−`. The local motif is therefore represented as **`Cu6I9 + Cu7I11`**, not only `Cu6I9`.
- **CUH-294-S01 / Record 294, Compound I** — retained as an isolated **0D `[Cu4I6]2−` rhombus cluster**.
- **CUH-294-S02 / Record 294, Compound II** — corrected to an isolated **0D edge-sharing `[Cu4I8]4−` dimer cluster**. The previous family-level `Cu4I6` motif propagation was incorrect.
- **CUH-294-S03 / Record 294, Compound III** — corrected to a **1D zigzag edge-sharing `[Cu5I7]2−` chain**. This is the only Core-Included global-dimensionality change in Rev.8.
- **Record 294 article-grain summary** — normalized from a generic “Cu4I6/Cu4I8” family label to the three compound-specific structures above; article-level dimensionality is therefore **0D/1D**.
- **Record 294 chemical identities** — the former generic family identity collision is split into three structure-specific identities corresponding to the Cu4I6, Cu4I8 and Cu5I7 compounds.

The Rev.8 gate explicitly prevents a lower-confidence audit proposal from erasing a higher-confidence current structure assignment. It also treats `NULL`, empty and `Unresolved` as the same scientific unresolved state so storage representation changes are not miscounted as scientific corrections.

Rev.7 remains the immediately preceding full hostile-audit baseline and is retained as a rollback/recovery layer. The following Rev.7 findings therefore remain part of the active Rev.8 scientific state unless superseded by the targeted Rev.8 correction set:

- Record 6: both temperature-dependent C6H18N2Cu2I4 determinations are **0D discrete [Cu2I4]2− cluster structures** while retaining distinct P-1 and P2/c crystallographic phases.
- Record 60: compound-specific 0D Cu3X7 and 1D Cu2X4 members are restored with their correct CCDC mappings.
- Record 91: the RSC SI mapping corrects CUH-091-S02 to C36H36Cu3I6N3, **P21/n, CCDC 2350403, 1D edge-sharing [CuI4] chain**.
- Record 104: network compositions remain networks; the set includes 0D Cu2I4/Cu4I6 members, **1D Cu6I8(L3)2** and **2D Cu4I6(L4)2**.
- Record 154: the All-in-One structures are treated as **finite 0D molecular clusters**, not assigned dimensionality from packing/contact heuristics.
- Records 170, 172, 185 and 186: local Cu–X units are explicitly separated from 1D/2D/3D global coordination-network dimensionality.
- Record 246: Cu4I8, Cu2I4-chain and Cu11X15 layer members are assigned compound-specifically rather than inheriting a family-level `0D/1D/2D` label.
- Record 328: PZ-ACN is the **1D CuI4-chain** structure (CCDC 2444174), whereas PZ-HI is the **0D Cu2I6 cluster** structure (CCDC 2402042).

See [`docs/CURRENT_CURATED_R8_2026-08-19.md`](docs/CURRENT_CURATED_R8_2026-08-19.md) for the active scientific baseline and [`docs/CURRENT_CURATED_R7_2026-08-19.md`](docs/CURRENT_CURATED_R7_2026-08-19.md) for the immediately preceding hostile-audit baseline.

## Review runtime contract

The Rev.8 prepublication-review runtime contract is:

- Site: **v50**
- UI: **50.2**
- Metadata gateway: **50.5**
- Public Data: **2.16.0**
- Structured Photophysics contract: **1.3.3**
- Organic Components contract: **1.1.0**
- Smart RAG: **9.19.0**
- Research Assistant: **10.4.1**
- Motif Atlas: **1.2**
- Current evidence corpus: **1,329 BGE-M3 documents / 1,329 embeddings**
- Publication/governance state: **prepublication-review**

The Rev.8 RAG corpus is a full rebuild of **383 article + 946 structure = 1,329 documents**. All 1,329 documents were independently re-embedded with `@cf/baai/bge-m3`; all returned embeddings passed the 1024-dimensional cardinality check and the staged corpus closed with zero content-hash mismatch. Rev.7 remains available as a locked recovery corpus; Frozen Release 3.0.2 remains the immutable historical snapshot.

Structured Photophysics 1.3.3 is the activated, fail-closed evidence-correction baseline after independent Pass B closeout of the controlled correction set. The activation preserves the scientific entity model, Frozen Release 3.0.2 and all non-photophysics scientific denominators while locking **940 publishable sample states, 2,267 measurements, 2,988 normalized values, 281 quantitative-analysis-eligible values and 477 mechanism claims**. The activated verification-stage state is **92 two-pass verified articles, 237 Pass A curated articles and 54 verified-no-data articles**, which exactly accounts for the 383-article review queue.

The 1.3.3 correction set retains all previously locked 1.3.2 source-grain corrections and adds only independently re-read, source-explicit omissions from the controlled Record 135 and Record 297 closeout. Record 297 preserves the source-reported 440 nm excitation condition for its compound-1 steady-state and thermochromic measurements, exposes source-reported absorption, excitation-spectrum and lifetime experiments at their supported measurement grain, and deliberately does **not** digitize plotted excitation peaks, lifetime values or other graph-only scalars. Record 135 is promoted to two-pass verification without changing its already curated sample/measurement/value content. These changes do not expose raw primary files, source hashes, evidence locators or private adjudication notes.

The earlier 1.3.2 corrections remain part of this locked baseline: Record 310 keeps the 291 nm excitation-spectrum maximum and 14-day stability observation separate from the structure-mapped steady-state emission and from the device CRI; Record 312 retains the source-reported 180 nm FWHM for the 625 nm emission band; Record 313 keeps 302 nm as a steady-state excitation condition rather than a PLE peak and stores the 84.63 μs lifetime as a separate time-resolved measurement without inventing a structure mapping; Record 333 retains the source-reported approximately 260 °C thermal-stability/decomposition threshold separately from the 140 °C and 250 °C thermal events.

Current queries use the **Rev.8 full-current evidence corpus**. Exact counts and protected structure-grain scientific boundaries remain deterministic. Structured photophysics uses an explicit staged-verification policy:

- **Pass A curated** means the primary-evidence curation gate is complete for the article and its exposed sample/measurement/value records. It does **not** mean that independent Pass B verification has been completed.
- **Two-pass verified** means Pass A and independent Pass B are complete and the article-level review agrees. The machine-readable verification stage for this state is `two_pass_verified` (the human-readable label is also referred to as “two-pass verified”).
- Measurement-level QC remains fail-closed in both stages. A source-conflicted, unresolved or otherwise ineligible measurement stays withheld even when other measurements from the same Pass A article are exposed.
- Quantitative-analysis eligibility is a separate flag and is never implied merely by publication-stage eligibility.

This staged-verification policy allows the living review portal to expose carefully curated first-pass evidence without falsely presenting it as independently double-verified. Global Pass B is **not** complete: the current locked 1.3.3 state contains 92 two-pass verified, 237 Pass A curated and 54 verified-no-data articles. Any further Pass B promotions or corrections require a new reviewed contract change; they must not silently rewrite the locked 1.3.3 public denominators. Frozen 3.0.2 evidence is consulted only when a question explicitly asks for the archived snapshot or historical denominator. Literature Watch candidate metadata remains outside curated evidence until promotion through the defined review/QC gate.

Organic Components 1.1.0 is a separate structure-grain identity/depiction contract. It audits all **495 QC-passed mappings across 453 structures and 260 raw component keys**. Every mapping is explicitly classified: the current audited state contains **253 verified-connectivity rows across 241 structures, using 81 graph identities**, while **242 rows remain fail-closed unresolved** because the molecular identity/connectivity is not uniquely supported. Verified depictions use deterministic RDKit 2025.09.4 2D coordinate layouts rendered as local browser SVG; no generative-image model or remote depiction service is used. Stereochemistry, ambiguous abbreviation expansions and conflicting component identities are never inferred to make a drawing appear complete.

## Review/private boundary

Review access is intentionally **query-and-view**, not bulk redistribution. Review pages may expose selected bibliographic, structural, crystallographic, motif, scope, evidence-status, staged photophysics and structure-linked organic-component fields. The photophysics and organic-component projections do **not** expose primary source filenames, raw publisher files, raw evidence locators, internal sample IDs, source hashes, donor-atom internals, evidence-basis notes or unpublished adjudication notes; processed/composite/device states remain distinct from crystallographic structure rows.

The following remain private research assets: complete normalized tables/raw payloads, exact stored publisher abstracts, primary PDF/SI/CIF files, field-evidence excerpts and raw evidence locators, candidate scores/reason codes/source payloads, and internal QA/adjudication artifacts. `/api/export` is intentionally unavailable.

A manuscript-specific minimal dataset can be deposited separately when required for reproducibility. No permanent repository DOI or blanket project-wide license is asserted until the owner authorizes archival metadata and rights decisions.

## Citation

Before formal public release, treat the portal as a prepublication review resource rather than a deposited public dataset. For living-atlas results shared during review, report the access date and **Current Curated rev.8**. For exact historical reproduction, use **Archived scientific snapshot 3.0.2 (2026-08-11)**, verified through 2026-06-30.
