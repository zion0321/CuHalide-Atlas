# Contributing and release governance

## Scientific corrections

A correction request should include:

1. DOI or stable bibliographic identifier;
2. exact compound, structure, phase, polymorph or temperature identity;
3. field(s) proposed for correction;
4. source-level evidence from the main article, SI and/or CIF;
5. an explanation of whether the change affects a canonical denominator or derived analysis.

Bibliographic metadata alone cannot authorize a scientific-field change.

## Curation rules

- Preserve article grain and structure/phase grain.
- Do not combine observations from different compounds or phases into one causal chain.
- Use the declared missingness codes; blank or unresolved values are not zero.
- Do not infer unresolved fields from related or analogous materials.
- CIF-derived crystallographic values take priority where the mapping is explicit and verified.
- Article-grain photophysics is not silently reassigned to a named structure/phase.
- A Literature Watch candidate remains outside curated scientific evidence until primary-evidence review and QC are complete.
- Motif/class/component normalization must preserve unresolved legacy mappings rather than forcing a category.

## Current Curated promotion

New literature first enters the private curation workflow. Promotion to the public Current Curated layer requires DOI/entity deduplication, chemical-scope adjudication, primary article/SI/CIF review as appropriate, structure/phase expansion, crystallographic mapping, evidence-grain checks, relational/scientific QC, RAG rebuild/embedding and production regression.

Only QC-passed records may become live Current Curated records. Literature Watch metadata is discovery evidence, not scientific evidence.

## Formal release requirements

A formal release that changes scientific data must pass:

- DOI and entity deduplication;
- scope and compound-level adjudication;
- field-evidence construction;
- expected-difference and zero-difference tests;
- normalized snapshot regeneration and SHA-256 verification;
- RAG re-indexing and evidence-grain validation;
- the versioned benchmark suite;
- public production browser/Lighthouse tests;
- public health, privacy and security gates;
- versioned archival-package construction.

Frozen Releases **3.0.1** and **3.0.2** are immutable historical snapshots. Patch releases are reserved for scientific corrections such as the Record 13 hotfix in 3.0.2. Fully curated new literature belongs first to Current Curated and later to a new data-expansion release (for example **3.1.0**) after release-wide validation; it must not be folded into 3.0.2.
