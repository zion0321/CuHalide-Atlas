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
- A candidate marked `screened_in_scope` or `screened_boundary` remains outside the frozen release until primary-evidence review is complete.

## Release requirements

A release that changes data must pass:

- DOI and entity deduplication;
- scope and compound-level adjudication;
- field-evidence construction;
- expected-difference and zero-difference tests;
- normalized snapshot regeneration and SHA-256 verification;
- RAG re-indexing;
- the frozen benchmark suite;
- public production smoke tests;
- public health and security gates;
- versioned archival-package construction.

Release 3.0.1 is immutable. New literature candidates require a later version.
