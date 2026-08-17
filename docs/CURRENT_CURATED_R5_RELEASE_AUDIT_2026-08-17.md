# Current Curated rev.5 — release audit

Date: 2026-08-17

## Promotion gates

- DOI duplicate groups among Current Curated article set: **0**
- New structure-ID duplicates: **0**
- New CCDC collisions with existing current structures: **0**
- New article-to-structure cardinality: **2 + 2 + 1 + 5 + 1 + 3 = 14**, all matched
- Structure snapshot / motif taxonomy cardinality: **938 / 938**, zero missing or orphan taxonomy rows
- Organic-component orphan rows: **0**
- Structure search-safe contract mismatches: **0**
- Article-title leakage into structure search index: **0**
- Structure-RAG article-photophysics leakage before the evidence-boundary marker: **0**
- Current RAG content SHA mismatches: **0**
- Current RAG live-revision mismatches: **0**
- BGE-M3 embeddings: **1,317 / 1,317**, all **1024-dimensional**
- Current health RPC: **PASS**
- Frozen Release 3.0.2 denominators rechecked unchanged: **346 / 878 / 816 / 650 / 625 / 87 / 67 / 42**

## Hostile structure checks

The rev.5 additions were not accepted from empirical formula or manuscript labels alone. The audit explicitly distinguished local motifs from global connectivity:

- ICA record 377: local rhomboid Cu2I2 repeat; global 1D ladder-chain coordination polymer.
- CEJ record 378: local stepped Cu4I4 repeat; global 1D zigzag Cu–I coordination polymer.
- Inorganic Chemistry record 375: discrete Cu2I2 and Cu4I4 units are genuinely globally 0D.
- Journal of Luminescence record 376: discrete stairstep Cu4I4 is globally 0D.

The ICA complex-3 source-internal cell inconsistency is retained as an explicit source conflict with b/c/V unresolved in normalized fields. No arithmetic repair or analogy-based imputation was used.

## Release architecture

Current Curated rev.5 uses a complete 938-row full-current atomic/context structure snapshot and a 1,317-document full-current retrieval corpus. Frozen Release 3.0.2 remains an independent immutable historical snapshot. Rollback copies of the pre-rev.5 living layer were stored in the internal schema before promotion.
