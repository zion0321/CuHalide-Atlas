# Structure-filtered photophysics scope contract

Effective 2026-08-24 for Current Curated rev.7, Public Data 2.16.0 and Structured Photophysics 1.3.0.

## Scientific boundary

A photophysics review stage is an **article-level verification state**. It is not, by itself, evidence that a particular crystallographic structure has photophysical measurements mapped to it.

When a public photophysics projection is requested with a structure filter, the existing `public_state` and `verification_stage` fields remain unchanged for backward compatibility, but their scope is made explicit with additive fields:

- `public_state_scope = "parent_article"`
- `parent_article_public_state`
- `parent_article_verification_stage`
- `structure_mapping_state = "mapped_samples_present" | "no_structure_mapped_data"`
- `structure_mapping_sample_count`
- `structure_mapping_policy = "parent_article_verification_separate_from_structure_mapping"`

Machine consumers must not interpret an article-level `pass_a_curated` or `two_pass_verified` state as structure-level photophysical verification. Structure-specific interpretation requires an explicit mapped sample and its mapping status (`structure_exact`, `phase_exact`, or `sample_exact`).

## Fail-closed examples

`CUH-006-S01` is a negative control: its parent article is two-pass verified, but the structure-filtered public projection contains zero mapped photophysics samples. The API therefore reports `structure_mapping_state = "no_structure_mapped_data"` and `structure_mapping_sample_count = 0`.

`CUH-381-S01` is a positive control: its parent article is two-pass verified and the public projection contains an explicitly `structure_exact` crystal sample. The API therefore reports `structure_mapping_state = "mapped_samples_present"` with a positive sample count.

## Implementation and governance

The scope annotation is applied at the canonical public photophysics RPC boundary, upstream of the public-data Edge Function and Vercel gateway. This keeps direct public API access, standalone record rendering, and portal queries on the same scientific semantics. The change is additive: no curated measurement, denominator, publication stage, analysis-eligibility flag, Organic Components mapping, or Frozen Release 3.0.2 record is rewritten.

Database execute permissions remain restricted to the pre-existing privileged roles; the migration does not expand anonymous or authenticated database execution access. Public access continues only through the field-whitelisted query-and-view interface.

## Regression gate

Production QA must verify both controls above and must also assert that no private evidence fields are introduced. Standalone structure pages use the same distinction: zero mapped samples render `No structure-mapped data`; mapped samples identify Pass A / two-pass state explicitly as **parent article** provenance.
