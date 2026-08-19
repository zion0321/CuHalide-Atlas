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
- Motif taxonomy: **946** rows = **624 resolved / 322 unresolved**, including **35** unresolved legacy-category rows
- Global dimensionality intentionally unresolved at final structure grain: **61** rows
- Current RAG documents: **1329 / 1329 embedded** with `@cf/baai/bge-m3`

## Scientific changes in rev.7

Rev.7 is a structure-truth hostile-audit promotion. Frozen Release 3.0.2 is not rewritten.

1. **Unsupported shared crystallography removed.** Article-level space groups are no longer propagated into individual phases without compound/phase-specific mapping; e.g. CUH-054-S01 and the alpha phase CUH-059-S01 retain unresolved SG rather than inherited assignments.
2. **Record 6 / 10.1002/anie.202525951.** The P-1 and P2/c temperature-dependent C6H18N2Cu2I4 determinations are both resolved as **0D discrete [Cu2I4]2− cluster structures** while retaining their distinct crystallographic phases.
3. **Record 28.** The gamma and delta Gua3Cu2I5 intermediate polymorph rows are resolved as **1D Cu-I-chain phases**; no phase-specific SG is invented where a one-to-one mapping is absent.
4. **Record 60 / 10.1016/j.mtchem.2025.102657.** Compound-specific 0D/1D topology and CCDC mapping are restored: 0D Cu3Br7 / Cu3Cl7 and 1D Cu2Br4 / Cu2Cl4 / Cu2I4 members.
5. **Record 91 / 10.1039/d4qi00500g.** Official RSC ESI Table S1 is used to correct a major compound-to-CIF error. CUH-091-S02 is C36H36Cu3I6N3, **P21/n, CCDC 2350403, 1D edge-sharing [CuI4] chain**; S01 is the 3D Cu6I8 porous framework and S03 is the 0D Cu4I4 cubane with CCDC 1476241.
6. **Record 104 / 10.1021/acs.inorgchem.2c04547.** Primary compound nomenclature is respected: 0D Cu2I4 / Cu4I6 members, **1D Cu6I8(L3)2**, and **2D Cu4I6(L4)2**. Network compositions are not relabeled as discrete clusters.
7. **Record 128 / 10.1002/adpr.202200172.** Gua3CuCl4 is 0D isolated [CuCl4]3−, Pna21; Gua7Cu3Br10·3DMF is 0D [Cu2Br7]5− + [CuBr3]2−, P31c; the iodide analogue is 0D but retains unresolved exact motif/SG where primary mapping is incomplete.
8. **Record 154 / 10.1021/jacs.7b04550.** The earlier mixed-dimensional interpretation is rejected. The primary JACS article defines the All-in-One structures as **finite molecular clusters that retain cluster molecular identity**. All ten Record 154 AIO rows are therefore 0D molecular clusters with compound-specific Cu2I4 / Cu3I5 / Cu4I6 / Cu6I8 composition.
9. **Record 159.** The five newly characterized CCDC 1013280–1013284 CuI(L) determinations are resolved as **1D**; exact local motif remains unresolved where no compound-specific topology statement supports a stronger claim.
10. **Record 165.** The mixed Cl/Br member CUH-165-S02 is resolved as **0D finite Cu2X4-fragment architecture**. Its local integer Cu-X motif remains unresolved because fractional mixed occupancies are never rounded.
11. **Record 172 / 10.1021/ic801574k.** The compound-specific set is resolved across **1D, 2D and 3D** global networks. The CN-only member retains no strict Cu-Cl/Br/I motif despite its resolved 3D coordination network.
12. **Record 185 / 10.1021/ic0005341.** [CuBrL(HMTA)] is 0D with a Cu2Br2 dimeric local component; [(CuBrL)2(Pyz)] and [(CuBrL)2(Bpy)] are **1D chains** built from local rhomboidal Cu2Br2 units. Legacy multi-compound aggregate rows remain context/unresolved rather than receiving a fabricated single topology.
13. **Record 186 / 10.1039/a902290b.** All four triazine-linked compounds are **3D global coordination networks**. Local Cu-X columns/chains/layers are kept separately and are not confused with global dimensionality.
14. **Record 246 / 10.1039/c7dt00262a.** Compound 1 is **0D [Cu4I8]4−**, compound 2 is a **1D [Cu2I4]2− chain**, and Cu11I15 / Cu11Br15 are **2D microporous layers**. Family-level `0D/1D/2D` is no longer copied to each member.
15. **Record 341 / 10.1021/acsmaterialslett.3c01594.** Four Cu4I4 polymorphs are atomized as distinct determinations; fractional reduced CIF formulae are not used as compound identities. Compound 2 remains the distinct 1D coordination polymer.

## Final audit semantics

The active structure-truth audit is now a one-to-one mirror of the Current Curated snapshot: **946 audit rows / 946 unique current structure IDs / 0 missing / 0 orphan**. Sixty-two superseded, deleted-placeholder, pre-atomization or otherwise historical audit-only structure IDs are retained separately in the internal archive rather than mixed into the active ledger.

All active audit rows use the single final revision label `structure-truth-r7-final-2026-08-19`. Workflow-language residues such as `Automated risk-screen` or `pending` are absent from the active audit and active motif taxonomy. A remaining `Unresolved` value means a terminal scientific evidence boundary, not unfinished curation.

## QC gates

The final rev.7 production snapshot passes the following gates:

- 946 structure rows / 946 unique structure IDs / no null structure IDs.
- Active structure-truth audit: 946 / 946 one-to-one with the current snapshot.
- No resolved space-group row lacks IT number, point group or crystal system.
- No High/High row has a missing space group.
- No invalid dimensionality vocabulary values.
- Structure search-safe projection contract: PASS after deterministic rebuild from current identity/crystallography fields.
- Article-title leakage into structure search projection: PASS.
- Taxonomy one-to-one with structure snapshot: PASS.
- Active taxonomy workflow-residue check: PASS.
- Organic-component orphan check: PASS.
- RAG document-key uniqueness: 1329 / 1329.
- RAG content provenance synchronized to final taxonomy: PASS.
- RAG embeddings: 1329 / 1329 using `@cf/baai/bge-m3`.
- Deterministic Current Curated health: PASS.
- Public runtime contract: HTTP 200 / PASS.
- Public Data 2.14.0, Smart RAG 9.19.0 and Research Assistant 10.4.0: PASS.

## Evidence policy

- Formula, title wording, nuclearity and space group are not used to infer structural dimensionality.
- Local Cu-X motif and global coordination-network dimensionality are independent fields.
- Same nominal formula does not establish polymorph/phase identity, space-group identity or topology identity.
- Shared article-level crystallography or dimensionality is not promoted to a compound/phase row without a defensible one-to-one mapping.
- Aggregate/context rows spanning compounds with different topologies do not receive a fabricated single dimensionality.
- Fractional or mixed-occupancy halide stoichiometry is not rounded into an integer Cu-X motif.
- Partial or isostructural evidence may support a topology class while exact motif or space group remains unresolved.
- Amorphous/glass states do not receive crystallographic space groups.
- Structure-grain RAG documents expose identity, crystallography, dimensionality and independently mapped motifs only; article-grain photophysics is not automatically reassigned to individual structures.

## Deliberately unresolved structures

The final snapshot contains **61** rows whose global dimensionality remains explicitly unresolved. These are not a backlog. Typical reasons are: an aggregate/context row spans multiple compound topologies; a formula/SG row cannot be mapped one-to-one to the compound number or ligand isomer that carries the topology statement; a primary source identifies a local Cu-X unit but does not establish long-range connectivity rank; or the row is a non-core boundary/excluded context for which strict Cu-X topology is deliberately not promoted. Examples include Gua6Cu4I10 where local Cu3I6 units are known but long-range rank is not mapped, Record 170 where two same-formula ligand-isomer structures correspond to 1D/2D compounds but cannot be safely assigned by SG alone, and polymeric Record 271 structures whose exact connectivity rank requires atomic-graph reconstruction. These remain unresolved by design.
