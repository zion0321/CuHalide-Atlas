# Current Curated rev.6 — 2026-08-18

Current Curated rev.6 is the living full-current article and atomic/context structure snapshot. Frozen Release 3.0.2 remains immutable.

## Scientific state

- article audit: 383
- chemically included articles: 372
- canonical verified articles: 369
- structure / phase rows: 946
- Core-Included structures: 886
- resolved space-group rows: 713
- verified one-to-one space-group rows: 687
- verified polar rows: 100
- strict-polar rows / articles: 85 / 53
- structure taxonomy rows: 946 (589 motif-resolved; 357 unresolved; 35 unresolved legacy category)
- Current Curated RAG: 1,329 / 1,329 BGE-M3 embedded documents

## Primary-evidence batch

Four article-grain records were promoted: 10.1002/adma.73745, 10.1021/acs.inorgchem.5c06028, 10.1002/adom.202502786, and 10.1021/acs.cgd.5c01789. Eight SCXRD determinations were added from the first three articles. The glass states 2g/3g in Record 383 are amorphous and are not crystallographic rows. Record 383 3c is linked to the existing CUH-105-S03 identity instead of duplicated.

The 1D Cu3I5 systems in Record 381 store Cu3I5 as an extended chain repeat/SBU, not an isolated 0D cluster. The main-article formulation C10H21N2Cu3I5·CH3CN is retained; the conflicting SI Table S1 literal C12H25Cu3I5N2 is preserved as source-conflict provenance rather than silently repaired.

The dppb abbreviation in Record 382 is normalized explicitly as 1,2-bis(diphenylphosphino)benzene and is not conflated with 1,4-bis(diphenylphosphino)butane.

Reference-chain auditing also discovered historical coverage-backfill candidate 10.1016/j.poly.2014.07.034; it remains outside curated denominators pending primary-evidence promotion.

## Runtime

- Public Data 2.13.0
- Smart RAG 9.18.0
- Research Assistant 10.3.0
- site v50.2 / Current Curated rev.6
- deterministic sitemap denominator: 369 canonical articles + 886 Core-Included structures + 2 top-level pages = 1,257 URLs

## Invariants

- Frozen Release 3.0.2 is not rewritten.
- Public access remains query-and-view; primary PDF/SI/CIF and private evidence remain private.
- Article-grain photophysics is not automatically assigned to structure rows.
- Local motif and global connectivity dimensionality remain separate.
- Unresolved/conflicting source values are not repaired by analogy or arithmetic inference.
