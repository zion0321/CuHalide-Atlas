# CuHalide Atlas — Current Curated rev.3

**Curation date:** 2026-08-14  
**Frozen base:** Release 3.0.2 (immutable; literature cutoff inclusive through 2026-06-30)  
**Rolling layer:** Current Curated rev.3

## Scope of this revision

Current Curated rev.3 promotes three DOI-unique 2026 primary articles supplied and reviewed on 2026-08-14 after main-article/SI/crystallographic evidence review. It also applies a conservative Motif Atlas hotfix for fractional and mixed-occupancy structure labels. Frozen Release 3.0.2 is not rewritten.

### Newly promoted articles

| Record | DOI | Journal | Role in rev.3 |
|---|---|---|---|
| 371 | 10.1021/acs.inorgchem.6c03055 | Inorganic Chemistry | Reversible 0D/1D decanuclear iodocuprate system; four SCXRD determinations |
| 372 | 10.1002/smll.74688 | Small | Eight enantiomeric Cu4I4 cluster determinations; two are known identities with new independent SCXRD determinations |
| 373 | 10.1021/acs.cgd.6c00650 | Crystal Growth & Design | Two new Cu2I2(bpp)(phosphine) SCXRD structures; CP-1 is a known identity and is linked rather than duplicated |

## Structure-grain promotion

Fourteen new crystallographic determination rows were added:

- `CUH-371-S01`–`CUH-371-S04`: pristine 0D `[Cu10I20]10−`, pristine 1D `[Cu10I17]n7n−`, transformed 1→2, and the 360 K determination of compound 2.
- `CUH-372-S01`–`CUH-372-S08`: R/S-1 through R/S-4 Cu4I4 cubane determinations.
- `CUH-373-S01`–`CUH-373-S02`: CP-2 and CP-3 Cu2I2(bpp)(phosphine) chains.

All 14 rows have direct primary crystallographic evidence, resolved reported space groups, High SG confidence and High mapping confidence. Article-grain photophysics is not reassigned to structure rows.

## Duplicate-identity adjudication

Article-level novelty and structure-level chemical identity were assessed separately.

- Small R/S-1 are independent crystallographic determinations of the R/S-3-methylmorpholine Cu4I4 identities already represented by `CUH-370-S02` and `CUH-370-S01`, respectively. These are recorded as `known_identity_new_determination` and cross-linked to the earlier identities.
- CGD CP-1, `Cu2I2(bpp)(PPh3)2`, is the previously reported identity already represented by `CUH-158-S09`; the 2026 paper contributes new article-grain scintillation evidence but does not create a duplicate structure row for CP-1.
- Duplicate DOI review returned no pre-existing Frozen or Current Curated article record for the three new DOIs.

## Motif Atlas 1.2 hotfix

A hostile audit identified 15 legacy rows in which fractional or mixed-occupancy Cu/halide stoichiometry in the reported structure label had been truncated into an apparent integer motif. Examples included solid-solution labels such as `CuI1.6Br0.4`, `CuBr1.04Cl0.96`, and mixed Br/I occupancy series.

Exactly those 15 over-parsed rows were corrected to:

- `motif_formula = Unresolved`
- `motif_geometry = Unresolved`
- `normalization_confidence = Unresolved`

New rule: **fractional or mixed-occupancy stoichiometry is not converted to an integer Cu–X motif unless an independent structure-grain mapping establishes a discrete core.**

The hotfix changes taxonomy resolution only. It changes no Frozen denominator and no article, structure, space-group, polar or strict-polar denominator.

Motif Atlas rev.3 totals:

- taxonomy rows: **949**
- motif-resolved rows: **816**
- motif-unresolved rows: **133**
- unresolved legacy-category rows: **40**

## Organic-component evidence

Twenty primary-evidence curated organic-component rows were added for the 14 new determinations. Counter-cations and coordinating ligands are represented separately. Lattice solvents are not promoted as coordinating ligands. Public structure pages label component evidence tiers explicitly so token-derived legacy labels are not presented as primary-evidence identities.

## Literature Watch operational-state reconciliation

Historical metadata screening is retained for audit history. The current operational candidate state was synchronized for DOIs that subsequently passed primary-evidence Current Curated review, preventing an old `excluded`, `screened_boundary`, or `pending` metadata state from misleading users after later evidence-based promotion.

For the three rev.3 articles, explicit primary-evidence adjudication records were added with release inclusion authorized only after article/SI/structure-level review. No historical adjudication record was deleted.

## RAG and evidence-grain controls

Rev.3 added **17** RAG documents:

- 3 article-grain documents
- 14 structure-grain documents

All 17 were embedded with BGE-M3. Structure documents contain identity, crystallography and independently mapped motif information only; they do not contain article-level PLQY/emission claims.

A new scoped embedding writer is restricted to `current-curated-rN`, requires 1024-dimensional vectors, has bounded batch size and is executable only by the service role. The temporary rev.3 indexer was retired immediately after 17/17 embeddings completed.

Unified Current Curated retrieval now includes rev.1–rev.3. Production Smart RAG is **9.15.0** with **1,322 / 1,322** unified documents embedded.

## Scientific denominators

| Metric | Frozen 3.0.2 | Current Curated rev.3 |
|---|---:|---:|
| Article audit records | 346 | **373** |
| Chemically included articles | 335 | **362** |
| Canonical verified articles | 332 | **359** |
| Structure / phase rows | 878 | **949** |
| Core-Included structure rows | 816 | **887** |
| Resolved space-group rows | 650 | **719** |
| Verified one-to-one SG mappings | 625 | **694** |
| Verified polar rows | 87 | **97** |
| Strict-polar rows | 67 | **77** |
| Strict-polar articles | 42 | **46** |
| RAG documents / embeddings | 1,224 / 1,224 | **1,322 / 1,322** |

The rev.3 overlay contains **27 reviewed articles** and **71 structure/phase determinations** relative to Frozen 3.0.2. Nineteen overlay articles are cutoff-period coverage backfills and eight are post-cutoff additions.

## QC gate

Before promotion, the staging audit required all of the following:

- 3/3 article records staged
- 14/14 structure rows staged
- 14/14 taxonomy rows staged
- 20 primary-evidence component rows staged
- 17/17 RAG embeddings present
- zero structure-search contract mismatches
- zero structure-RAG article-photophysics leakage
- zero crystallographic contract failures for new rows
- zero unresolved motifs among the new primary-evidence structures
- zero remaining fractional-label motif leaks in the audited legacy target set

After promotion, `cuhalide_atlas_current_curated_health_v1()` returned `ok = true`, with state and derived counts matching and the Current Curated state `ready`.

## Public/private boundary

Public access remains query-and-view only. The complete normalized corpus, primary PDF/SI/CIF archive, exact stored publisher abstracts, field-evidence excerpts/locators, candidate scoring internals and private QA/adjudication artifacts remain private. `/api/export` remains intentionally retired.

## Version map

- Frozen scientific release: **3.0.2**
- Current Curated: **rev.3**, curated through **2026-08-14**
- Public site: **v48**
- UI/content: **48.4**
- Public Data: **2.10.0**
- Smart RAG: **9.15.0**
- Metadata/health: **48.4**
- Motif Atlas: **1.2**

Formal release versioning is unchanged: new rolling literature belongs to Current Curated; a future formal data-expansion release should be a minor release such as 3.1.0 after release-wide freeze and archival validation.