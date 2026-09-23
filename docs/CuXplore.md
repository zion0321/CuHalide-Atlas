# CuXplore

CuXplore names the literature-grounded research assistant and retrieval interface within CuHalide Atlas. Cu denotes copper, X the halide (Cl, Br, or I), and explore the task. It is not a new foundation model or an autonomous synthesis agent. Dataset citations, CUH identifiers, domain, repository, and scientific revision 10 remain unchanged.

## Source processing
The private native-text import of 23 September 2026 contains 75 identity-mapped PDFs: 48 MAIN files with native text, 21 SI files with native text, and six scan/sparse-text MAIN files. These yield 1,450 page-bounded passages. Combined with earlier private MAIN/SI indices, the live catalog has searchable prose for 78 distinct articles (48 MAIN, 46 SI, with overlap), with 1,984 passages. These counts are not claims of full scientific extraction or independent validation.

The 410-DOI catalog (372 included and 38 additional/boundary references), 901 Core-Included structural determinations and 1,322 article/structure embeddings remain separate denominators. Registration, native text, authored review, structure identity and photophysical review are independent per-source states. CIF text is not counted as prose. Missing, sparse, unreviewed and reviewed-no-data states are never merged.

## Access
Use the existing Literature scope selector or Research Assistant. `Indexed MAIN / SI text` filters to sources with real stored passages. Results expose bounded page-match metadata and processing coverage, not raw copyrighted passages, file identifiers or hashes. Saving selected context and preparing a question do not invoke a model.

## Reproducibility and security
Apply native-source schema before processing views/RPC. Primary data import requires a private authenticated transport and SHA-256 checks; raw payloads and temporary URLs are not part of this repository. All new raw tables use RLS and service-only grants. Existing curated fields, protected record/count queries and Frozen 3.0.2 routes are unchanged.

Run `npm run qa:preflight`, `node --test tests/cuxplore-contract.test.mjs`, and `node scripts/qa-cuxplore.mjs`. CI preserves both the inherited browser/Lighthouse gates and added source-processing checks.
