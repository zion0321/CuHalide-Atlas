# CuHalide Atlas material-grain photophysics audit

Status: active private curation workstream for Current Curated rev.7+; not a formal release and not a public dataset layer.

## Canonical database source of truth

The active curation model is the private `atlas_internal.cuhalide_photophysics_*_v1` schema. It separates article review, sample/state, measurement, spectral band, typed value, decay component, typed mechanism claim, evidence, conflict and curve-registry grains. The active structure-mapping health gate resolves structure identifiers through `atlas_internal.cuhalide_current_structure_registry_v1`, which is currently pinned to Current Curated rev.7 rather than to a superseded hard-coded structure table.

Mechanism curation is normalized through `atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1` and `atlas_internal.cuhalide_photophysics_mechanism_v1`. A mechanism claim is not a free-text synonym for a spectral band: it records the controlled mechanism code, claim scope, claim polarity (`supported`, `consistent_with`, `ruled_out`, or `unresolved`), claim basis (`author_assignment`, experimental/computational support, author inference, Atlas interpretation, or unresolved), direct evidence linkage, mapping/evidence confidence, and QC state. This permits explicit negative evidence—for example a source ruling out defect emission—without treating absence of a mechanism as evidence against it.

An earlier material-grain prototype exists under `public.cuhalide_atlas_material_entities` and `public.cuhalide_atlas_photophysics_*`. Those objects were always protected by RLS/revokes and were never a public product projection. They are now explicitly deprecated and frozen read-only for `service_role` so that historical rows remain auditable without allowing parallel curation to diverge from the canonical `atlas_internal` model. The prototype migrations remain versioned because they were applied to production and are part of the database migration history.

Primary evidence, evidence excerpts/locators, source filenames/hashes, conflict adjudication and unpublished normalized curation remain private. No public photophysics endpoint or bulk export is enabled by this workstream.

## Scientific objective

Complete a paper-by-paper primary-evidence review of photophysical, spectral and application properties at the finest defensible material/sample/condition grain. The audit does not alter Frozen Release 3.0.2 and does not weaken the rev.7 structure-truth contract.

## Non-negotiable grain rule

Article identity, material identity, crystallographic determination and measurement condition are distinct entities.

- A paper may report multiple materials, polymorphs, phases, samples or devices.
- Article-level emission/PLQY/lifetime/mechanism statements must not be copied to every structure row.
- A `structure_id` is attached to a material/property only when the paper/SI/CIF supports an explicit one-to-one mapping.
- Family ranges, comparison tables and article-level aggregate values remain at family/article grain.
- Literature-comparison rows in an SI table are secondary context, not primary measurements of the host article.
- Unresolved mapping is a valid terminal state. No value is completed by analogy.

## Mechanism rules

Mechanistic interpretation is held to a stricter evidentiary boundary than numerical transcription.

- Broad, red-shifted or strongly Stokes-shifted emission does not by itself establish STE emission.
- A short Cu···Cu distance does not by itself establish a cuprophilic-assisted excited state or assign an emission band.
- Temperature dependence, lifetime, transient spectroscopy, calculations and other supporting observations are retained separately from the final author/curator mechanism claim.
- Author assignment, author inference, experimentally supported assignment, computational support and Atlas interpretation are not interchangeable and must remain distinguishable.
- Positive and negative claims are both explicit. `ruled_out` is used only when the source actually excludes a proposed mechanism with stated evidence.
- If a paper gives competing assignments or internally inconsistent mechanistic evidence, the conflict is retained; the database does not silently choose a preferred story.
- Mechanism rows are analysis-eligible only after mapping, evidence and QC satisfy the fail-closed mechanism gate.

## Extraction scope

For every in-scope article, read the main article and available SI/data files and identify every distinct reported material/sample. Curate, when explicitly reported:

- absorption maxima/edges and optical bandgap;
- excitation maxima/ranges;
- emission maxima/ranges, shoulders/components and FWHM;
- CIE coordinates and reported emission color;
- PLQY with sample state, temperature, excitation and atmosphere when stated;
- PL/TRPL/XEL lifetimes, fit context and individual components when reported;
- Stokes shift, thermal activation energy, radiative/non-radiative rates;
- temperature-dependent luminescence and thermochromic transitions;
- reported/experimentally/computationally supported mechanism assignments such as STE, metal/cluster-centered transitions, MLCT/LMCT/XLCT/LLCT, TADF, phosphorescence, ISC/RISC and Cu(I)···Cu(I)-interaction-assisted behavior;
- explicit source-supported exclusions of defect/surface-defect or other candidate mechanisms;
- scintillation light yield, X-ray detection limit, spatial resolution, afterglow and dose-response metrics;
- LED/device metrics such as EQE, CRI and CCT;
- non-luminescent results when explicitly reported.

Numeric values are stored only when explicitly reported or transparently marked as derived with a documented derivation. Curves are never fabricated from peak values. Figure-only spectra are not converted into fake numerical traces; digitization, if later performed, must be a separate provenance-labelled workflow.

## Evidence contract

Every curated measurement or mechanism assignment requires a private evidence object containing source type and the best available locator (page, section, table and/or figure). Verbatim excerpts and private source filenames remain private. The public layer may expose normalized values, a compact citation/locator label and evidence confidence after QC, but never publisher PDFs/SI/CIF payloads or long copyrighted excerpts.

## Review status

Each article receives an explicit review state and completeness counters. `qc_passed` means the main article/SI available to the project were read, reported material identities were mapped at the finest defensible grain, measurements were normalized with units/conditions, and unresolved items were retained rather than inferred.

The canonical health function is fail-closed for orphaned entities, duplicate measurement/band keys, missing measurement evidence, eligible values without evidence, inconsistent conflict flags, unresolved conflict records without an adjudication basis, invalid intrinsic-scope claims, invalid structure-exact mappings, unknown property keys, pending row-level QC and completed reviews that do not satisfy the two-pass gate. Its mechanism extension additionally fails on mechanism sample/measurement/evidence orphans, band-to-measurement mismatches, evidence-to-claim mismatches, inactive mechanism codes, pending mechanism QC, and analysis-eligible mechanism rows whose mapping/evidence/QC state is unresolved.

## Website target

The public interface will add a Photophysics/Spectra layer only after the private audit reaches sufficient QC coverage and a separate publication decision is made. Planned capabilities:

- material-level property cards on article pages;
- structure pages show properties only for exact structure mappings, otherwise a clear material/article-level boundary note;
- filters for emission wavelength, PLQY, lifetime, mechanism, sample state, temperature, dimensionality, motif, halogen and application;
- mechanism filters that can distinguish positive assignments from source-supported exclusions and can expose claim basis/confidence rather than flattening all interpretations into one label;
- comparisons such as emission vs PLQY, lifetime vs PLQY and scintillation light yield, using only QC-passed normalized measurements;
- material-specific Smart RAG queries with evidence-grain labels and DOI/locator citations;
- explicit `reported`, `derived`, `unresolved` and `not applicable` states.

## Publication gate

No new public photophysics endpoint/view should be enabled merely because the schema exists. Public exposure requires:

1. row-level scientific QC;
2. material-to-article/structure referential checks;
3. unit/range validation;
4. evidence-locator coverage checks;
5. mechanism-claim provenance and contradiction checks;
6. privacy/copyright checks;
7. browser and API regression tests;
8. RAG unsupported-claim tests.

The current prepublication noindex and no-bulk-export governance remains unchanged.
