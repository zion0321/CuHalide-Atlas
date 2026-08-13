# CuHalide Atlas known errata

## Release 3.0.1 — Record 13 structure dimensionality

**Status:** resolved and superseded by **Frozen Release 3.0.2**. The immutable 3.0.1 historical state is retained for reproducibility; 3.0.2 physically incorporates the four confirmed corrections.

**Article:** Record 13, DOI `10.1016/j.matlit.2026.100010`  
**Field:** `Structural Dimensionality`  
**Evidence state:** A — main article plus SI/CIF

A post-publication QA pass identified a positional mapping error created when the article-level, semicolon-separated dimensionality statement was split across four structure-grain rows.

| Structure ID | Compound | Archived 3.0.1 value | Correct value in 3.0.2 |
|---|---|---|---|
| CUH-013-S01 | pip6Cu10I16 | `0D (pyrCu2Br3` | **Unresolved** |
| CUH-013-S02 | pyr4Cu4Br8 | `pyr4Cu4I8)` | **0D** |
| CUH-013-S03 | pyr4Cu4I8 | `not assigned in article narrative for pip6Cu10I16` | **0D** |
| CUH-013-S04 | pyrCu2Br3 | `pyr4Cu4Br8` | **0D** |

The article-level evidence states that pyrCu2Br3, pyr4Cu4Br8 and pyr4Cu4I8 are 0D, while the article narrative does not assign a dimensionality to pip6Cu10I16. The structure identities, formulas and motifs make the correction unambiguous.

### Scientific impact

The correction does **not** change:

- article counts;
- the 878 structure/phase-row Frozen denominator;
- resolved or verified space-group counts;
- polar or strict-polar subsets;
- canonical article denominators;
- any space-group assignment.

### Reproducibility policy

Release 3.0.1 is not rewritten in place. Its historical values remain audit history. Frozen Release 3.0.2 contains the corrected structure-grain values directly, and its release-specific RAG documents use those corrected values without a current-release erratum overlay.

The public portal is query-and-view. Website tables, filters, stable record pages and Smart RAG use the 3.0.2 correction when Frozen Release scope is requested. Bulk normalized release exports and private primary-evidence/curation assets are not publicly distributed.

Public health metadata: `https://cuhalide-atlas-v3.vercel.app/api/meta?action=health`
