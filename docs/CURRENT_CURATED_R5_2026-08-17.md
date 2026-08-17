# CuHalide Atlas — Current Curated rev.5

**Curated through:** 2026-08-17  
**Base archived snapshot:** Frozen Release 3.0.2 (immutable; verified through 2026-06-30)  
**Architecture:** full-current article and atomic/context structure snapshot

## Scientific denominators

- Article audit records: **379**
- Chemically included articles: **368**
- Canonical verified articles: **365**
- Structure/context rows: **938**
- Core-Included structure rows: **878**
- Resolved space-group rows: **705**
- Verified one-to-one space-group rows: **679**
- Verified polar rows: **96**
- Strict-polar rows: **81** across **51** articles
- Motif taxonomy rows: **938**
- Motif-resolved rows: **581**
- Motif-unresolved rows: **357**
- Unresolved legacy category rows: **35**
- Current RAG documents / embeddings: **1,317 / 1,317** (BGE-M3, 1024 dimensions)

## rev.5 primary-evidence additions

Six peer-reviewed articles were promoted after DOI/CCDC/identity deduplication and primary-evidence review, yielding fourteen new structure-grain determinations:

- Record 374 — `10.1002/anie.202519379`: two isolated 0D Cu4Br6 hybrid-ionic structures; the mixed-cation phase is C2/polar.
- Record 375 — `10.1021/acs.inorgchem.5c05228`: isolated 0D rhomboid Cu2I2 and cubane Cu4I4 coordination clusters.
- Record 376 — `10.1016/j.jlumin.2026.121789`: discrete 0D stairstep Cu4I4(L1)2 cluster, CCDC 2481109.
- Record 377 — `10.1016/j.ica.2026.123354`: five 1D polymeric [Cu2I2(L)2]n ladder-chain structures; Cu2I2 is a local repeat, not global 0D dimensionality.
- Record 378 — `10.1016/j.cej.2026.177390`: 1D Cu–I zigzag coordination polymer with local stepped Cu4I4 repeat; empirical formula remains unresolved rather than replacing it with the material shorthand PyPzPh-CuI.
- Record 379 — `10.1021/acsaom.6c00035`: three discrete 0D planar-rhomboid Cu2I2 dimers.

The Research Square preprint `10.21203/rs.3.rs-9170631/v1` was reviewed and retained in Literature Watch as an in-scope preprint candidate; it is not counted in canonical Current Curated denominators.

## Structure-truth rules reinforced in rev.5

Reported composition, normalized local Cu–X motif, and global connectivity dimensionality are separate fields. A local Cu2I2, Cu4I4, or Cu4Br6 repeat is not automatically a 0D material. Fractional or mixed-occupancy stoichiometry is not rounded/truncated into an integer motif. Missing values remain unresolved.

The uploaded ICA SI contains an internally inconsistent unit-cell row for complex 3 (CCDC 2407308): the reported b/c entries and reported volume cannot simultaneously describe the stated monoclinic cell. CuHalide Atlas preserves the source conflict and does not infer replacement b/c/V values.

## Evidence and public-access boundary

Evidence priority remains **CIF > SI crystallographic table > main article > external metadata**. Article-grain photophysics is not copied to a structure row without explicit structure-level mapping. Public access remains query-and-view; primary PDF/SI/CIF files, exact stored abstracts, source excerpts/locators, candidate scoring internals, and adjudication notes remain private.
