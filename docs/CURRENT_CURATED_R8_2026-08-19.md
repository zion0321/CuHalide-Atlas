# Current Curated rev.8 — 2026-08-19 scientific baseline

Current Curated rev.8 is the active living scientific state of CuHalide Atlas. It is a complete 383-article / 946-structure atomic snapshot built on the Rev.7 full hostile structure-truth audit and a targeted, primary-source-reverified Rev.8 correction set.

## Locked denominators

| Metric | Rev.8 |
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
| Current RAG documents / embeddings | 1,329 / 1,329 |

Core-Included global dimensionality is 520 0D, 248 1D, 53 2D, 25 3D and 40 unresolved. Relative to Rev.7, exactly one Core-Included row changes dimensionality: `CUH-294-S03` changes from 0D to 1D. Polar and strict-polar denominators do not change.

## Rev.8 structure-grain corrections

### CUH-285-S04

`(NBu4)7[Cu6I9][Cu7I11]` contains two coexisting discrete iodocuprate anions. The normalized local motif is therefore `Cu6I9 + Cu7I11`, preserving both `[Cu6I9]3−` and `[Cu7I11]4−` components.

### Record 294

- `CUH-294-S01`: isolated 0D `[Cu4I6]2−` rhombus cluster.
- `CUH-294-S02`: isolated 0D edge-sharing `[Cu4I8]4−` dimer cluster. The previous `Cu4I6` family-level motif propagation was rejected.
- `CUH-294-S03`: 1D zigzag edge-sharing `[Cu5I7]2−` iodocuprate chain. The previous 0D / `Cu4I6` assignment was rejected.
- The Record 294 article-grain summary is `0D/1D` and enumerates the three compound-specific structures.
- The former generic chemical-identity group is split into three structure-specific identities corresponding to the Cu4I6, Cu4I8 and Cu5I7 compounds.

## Activation logic

Rev.8 uses field-level activation rather than whole-row replacement. Dimensionality, motif formula and motif geometry are independently gated. A proposed field is not activated merely because an older audit row is labelled `CONFIRMED_CORRECTION`.

The gate requires:

1. structure-grain evidence;
2. High or Very High adjudication confidence;
3. non-generic, source-specific reviewer basis;
4. no out-of-scope or fail-closed status;
5. no regression from a higher-confidence current assignment;
6. explicit Rev.8 primary-source reverification for geometry enrichment that was not independently re-read in the Rev.8 closeout.

`NULL`, empty and `Unresolved` are treated as the same scientific unresolved state for change accounting.

## Hostile QA result

The complete candidate snapshot passed the Rev.8 release gate:

- 383/383 unique article records;
- 946/946 unique structure IDs;
- 946/946 taxonomy rows with `qc_status=passed`;
- zero changes to space group, polar assignment, inclusion status, eligibility or primary material category outside the intended correction set;
- three motif-formula changes;
- four motif-geometry changes;
- three chemical-identity-key changes;
- zero non-proportional Cu:X identity collisions after correction;
- 1,329/1,329 Rev.8 RAG documents independently embedded with `@cf/baai/bge-m3`;
- 1,329/1,329 returned vectors were 1024-dimensional;
- zero RAG content-hash mismatch.

## Rollback and reproducibility

Rev.7 remains preserved as the immediately preceding recovery layer. Frozen Release 3.0.2 remains immutable and is never rewritten by Current Curated revisions.

The Rev.8 production activation was transactional: candidate QA, taxonomy QC, RAG completeness and corrected-field postconditions were checked before commit. Dedicated Rev.7 article, structure/taxonomy, state and search/health rollback assets are retained internally.

## Photophysics boundary

Structured Photophysics remains contract **1.3.3**. Rev.8 structure activation does not silently change the locked Photophysics 1.3.3 verification-stage denominators. Global Pass B is still incomplete: 92 articles are two-pass verified, 237 are Pass A curated and 54 are verified-no-data. Future Pass B promotions or corrections require a new reviewed contract change.
