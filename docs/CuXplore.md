# CuXplore

CuXplore names the literature-grounded research and retrieval interface within CuHalide Atlas. Cu denotes copper, X the halide (Cl, Br, or I), and explore the task. It is not a new foundation model or an autonomous synthesis agent. Dataset citations, CUH identifiers, domain, repository, and scientific revision 10 remain unchanged.

## Source processing

The full-text v2 corpus recovered on 24 September 2026 contains 727 source documents mapped to 403 distinct DOI records, with 21,421,324 extracted characters and 6,275 reproducible overlapping blocks. The block rule is fixed at a 4,000-character window with a 3,600-character step. The source states are 664 native-text files, six sparse-text files and 57 empty/unreadable files.

The current knowledge catalog contains 410 DOI records (372 curated and 38 additional/boundary references). Of these, 384 have searchable native v2 text, contributing 6,175 active v2 blocks. Six v2 DOI records are excluded/out-of-scope records and are not promoted into active catalog retrieval. When a catalog DOI has no v2 source document, the previous private page-bounded index remains available as a fallback where real legacy text exists.

The 901 Core-Included structure determinations and 1,322 current-curated article/structure embeddings remain separate denominators. The v2 full-text cutover changes the private lexical source layer; it does not convert raw text blocks into semantic embeddings and does not replace the structured scientific authority.

CIF text is not counted as prose. The 114 registered CIF files are handled by a crystallographic parsing and reconciliation workflow separate from MAIN/SI lexical retrieval.

## Access

Use the existing Literature scope selector or CuXplore. `Indexed MAIN / SI text` filters to sources with actual indexed prose. v2 matches return an indexed block number and bounded character range; legacy fallback matches return PDF page locators. The interface never labels a character range as a PDF page.

Results expose processing coverage and match metadata, not raw copyrighted passages, private file identifiers, hashes or Drive URLs. Saving selected context and preparing a question do not invoke a model.

## Reproducibility and security

The v2 health contract requires exactly 727 source documents, 403 DOI records, 21,421,324 extracted characters, 6,275 declared blocks, 6,275 actual blocks and zero block-count mismatches. Raw v2 source and chunk tables have RLS enabled and are restricted to the service role.

Scientific revision 10, Frozen Release 3.0.2, structured photophysics and the 1,322 semantic retrieval records remain unchanged by this text-index cutover. Native text supports evidence retrieval but does not independently certify a compound identity, topology, photophysical value or mechanism.

Run `npm run qa:preflight`, `node --test tests/cuxplore-contract.test.mjs`, and `node scripts/qa-cuxplore.mjs`. CI preserves the inherited browser/Lighthouse gates and the CuXplore source-processing checks.


## Website synchronization

The main Atlas and CuXplore interface now present the 24 September 2026 full-text v2 corpus directly: 403 DOI records, 727 source documents and 6,275 reproducible text blocks. Coverage copy distinguishes that source corpus from the 410-DOI knowledge catalog, the 939-row structural authority / 901 Core-Included structures, and the 1,322 semantic article/structure records. CIF reconciliation and the three independent update dates are shown explicitly. The former project-specific research-design route is retired and redirects to CuXplore; project-specific recommendations are not part of the Atlas website.
