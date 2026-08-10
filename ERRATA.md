# CuHalide Atlas known errata

## Release 3.0.1 — Record 13 structure dimensionality

**Status:** confirmed; corrected in the public display/query/download layer; immutable 3.0.1 archive retained; formal scientific hotfix planned for **3.0.2**.

**Article:** Record 13, DOI `10.1016/j.matlit.2026.100010`  
**Field:** `Structural Dimensionality`  
**Evidence state:** A — main article plus SI/CIF

A post-publication QA pass identified a positional mapping error created when the article-level, semicolon-separated dimensionality statement was split across four structure-grain rows.

| Structure ID | Compound | Archived 3.0.1 value | Effective value |
|---|---|---|---|
| CUH-013-S01 | pip6Cu10I16 | `0D (pyrCu2Br3` | **Unresolved** |
| CUH-013-S02 | pyr4Cu4Br8 | `pyr4Cu4I8)` | **0D** |
| CUH-013-S03 | pyr4Cu4I8 | `not assigned in article narrative for pip6Cu10I16` | **0D** |
| CUH-013-S04 | pyrCu2Br3 | `pyr4Cu4Br8` | **0D** |

The article-level evidence states that pyrCu2Br3, pyr4Cu4Br8 and pyr4Cu4I8 are 0D, while the article narrative does not assign a dimensionality to pip6Cu10I16. The structure identities, formulas and motifs make the correction unambiguous.

### Scientific impact

This erratum does **not** change:

- article counts;
- the 878 structure/phase-row denominator;
- resolved or verified space-group counts;
- polar or strict-polar subsets;
- canonical article denominators;
- any space-group assignment.

### Reproducibility policy

The archived `v3.0.1` ZIP and its SHA-256 are intentionally unchanged. Public structure APIs preserve `Structural Dimensionality` as the archived value and additionally expose:

- `Structural Dimensionality (Effective)`;
- `Structural Dimension Class (Effective)`;
- `Known Release Erratum?`;
- `Release Erratum Key`;
- `Release Erratum Status`;
- `Release Erratum Note`.

Website tables, filters, detail views, downloads and Smart RAG use the effective correction where applicable. A later scientific hotfix will regenerate corrected frozen snapshots rather than rewriting release 3.0.1 in place.

Public health/errata metadata: `https://cuhalide-atlas-v3.vercel.app/api/meta?action=health`
