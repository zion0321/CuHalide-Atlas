# Article serving-context contract

Effective 2026-08-24 for Current Curated rev.7, Public Data 2.16.0 and Structured Photophysics 1.3.0.

A single article response can legitimately combine a core bibliographic/curation row inherited from Frozen Release 3.0.2 with a current structured-photophysics projection curated after the frozen cutoff. These layers must not be collapsed into one provenance label.

The existing `data_scope`, `item.curation_layer`, `item.coverage_class` and `item.live_revision` fields remain authoritative for the **core article-row origin** and are not rewritten. The Vercel public-data interface adds a `record_context` object for `action=article` responses:

- `serving_context = "current_curated"`
- `serving_revision = 7`
- `core_record_origin = data_scope`
- `core_record_origin_release = "3.0.2"` only when the core row comes from `frozen_release`
- `core_record_origin_revision` when the core row has a positive living revision
- `attached_photophysics_context = "current_curated"` when a structured-photophysics object is attached
- `attached_photophysics_contract = "1.3.0"`
- `context_policy = "core_origin_preserved_current_overlays_explicit"`

Negative/positive controls used by production QA:

- Record 46: `data_scope=frozen_release`, Frozen core article row, current Pass-A photophysics. The response must preserve the Frozen origin and explicitly identify the current serving/photophysics context.
- Record 381: `data_scope=current_curated`, Current Curated core row, current two-pass photophysics. The response uses the same context contract without inventing a Frozen origin.

This is an additive machine-readable clarification. It does not change article inclusion, bibliographic values, photophysics values, verification stages, analysis eligibility, scientific denominators, Frozen Release 3.0.2, or private/public evidence boundaries.