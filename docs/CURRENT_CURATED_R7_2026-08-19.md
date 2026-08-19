# CuHalide Atlas — Current Curated rev.7

**Curated through:** 2026-08-19  
**Base frozen release:** 3.0.2 (immutable)  
**Status:** ready

## Production counts

- Article audit records: **383**
- Chemically included articles: **372**
- Canonical verified articles: **369**
- Structure/phase rows: **946**
- Core-Included structure rows: **886**
- Resolved space-group rows: **710**
- Verified space-group rows: **684**
- Verified polar rows: **97**
- Strict-polar rows: **87** across **54** articles
- Current RAG documents: **1329 / 1329 embedded**

## Scientific changes in rev.7

Rev.7 is a structure-truth hostile-audit promotion. The frozen 3.0.2 release is not rewritten.

1. **10.1002/anie.202413991 / CUH-054-S01** — retained as a 0D Hybrid Ionic Cu4I6 phase, but the article-level P21 assignment is no longer propagated to this phase without compound-specific crystallographic mapping. Space group is therefore unresolved.
2. **10.1016/j.talanta.2025.128074 / CUH-059-S01** — the shared Pna21 assignment is no longer propagated to the alpha phase; its space group is unresolved pending phase-specific crystallographic evidence.
3. **10.1002/adpr.202200172 / Record 128** — compound-specific reconstruction from primary evidence:
   - Gua3CuCl4: 0D isolated [CuCl4]3− tetrahedra, Pna21, High/High mapping.
   - Gua7Cu3Br10·3DMF: 0D discrete [Cu2Br7]5− + [CuBr3]2− units, P31c, High/High mapping.
   - Gua7Cu3I10·3DMF: 0D inorganic topology supported by partial SCXRD/isostructural evidence, but exact iodide motif and space group remain unresolved.
4. **10.1039/a902290b / Record 186** — all four triazine-linked Cu(I)-halide compounds are classified as **3D global coordination networks**. Local Cu–X columns/chains/layers are retained separately in the motif/connectivity taxonomy and are not confused with global dimensionality.
5. **10.1021/acsmaterialslett.3c01594 / Record 341** — the four Cu4I4 polymorphs are atomized as 1-bu, 1-gn, 1-ye and 1-wh; fractional reduced CIF formulae are not used as compound identities. Compound 2 remains the distinct 1D CuI(4-trifluoromethylpyridine) coordination polymer.
6. **10.1039/c7dt00262a / Record 246** — the individual Cu11X15 members are no longer assigned the family-level `0D/1D/2D` value. Primary evidence explicitly identifies [H2dpp]2Cu11I15 and [H2dpp]2Cu11Br15 as **2D microporous [Cu11X15]4− layers**, built from [Cu9X17] units interconnected by [CuX4] tetrahedra. Their Aba2 crystallography is retained.

## QC gates

The rev.7 production snapshot passes the following gates:

- 946 structure rows / 946 unique structure IDs / no null structure IDs.
- No resolved space-group row lacks IT number, point group or crystal system.
- No High/High row has a missing space group.
- No invalid dimensionality vocabulary values.
- Structure search-safe projection contract: PASS.
- Article-title leakage into structure search projection: PASS.
- Taxonomy one-to-one with structure snapshot: PASS.
- Organic-component orphan check: PASS.
- RAG document-key uniqueness: 1329 / 1329.
- RAG content SHA-256 integrity: PASS.
- RAG embeddings: 1329 / 1329 using `@cf/baai/bge-m3`.
- Current Curated health: PASS.
- Public Smart RAG health: PASS; production route is `current-curated-r7`.

## Evidence policy

- Formula, title wording, nuclearity and space group are not used to infer structural dimensionality.
- Local Cu–X motif and global coordination-network dimensionality are independent fields.
- Same nominal formula does not establish polymorph/phase identity or space-group identity.
- Shared article-level crystallography is not promoted to a compound/phase row unless a defensible one-to-one mapping exists.
- Partial or isostructural evidence may support topology class while the exact motif or space group remains unresolved.
- Amorphous/glass states do not receive crystallographic space groups.
- Structure-grain RAG documents expose identity, crystallography, dimensionality and independently mapped motifs only; article-grain photophysics is not automatically reassigned to individual structures.

## Deliberately unresolved structures

The hostile audit distinguishes **scientifically unresolved** from **unfinished**. The structure-truth audit ledger contains no pending review state: rows are adjudicated as confirmed correction, confirmed no-change, confirmed unresolved, or terminal evidence missing. Examples of intentionally unresolved topology cases include Gua6Cu4I10 (Record 110) and the Pna21 polymeric adduct in Record 271 where exact long-range/local Cu–I graph reconstruction is not defensible from the presently mapped evidence. These are not completed by formula-based inference.
