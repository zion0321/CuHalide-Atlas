# CuHalide Atlas material-grain photophysics audit

Status: active curation workstream for Current Curated rev.7+ with a fail-closed, read-only public projection. The projection explicitly distinguishes **Pass A curated** records from **two-pass verified** records; it is not a bulk public dataset layer or a formal release.

## Canonical database source of truth

The active curation model is the private `atlas_internal.cuhalide_photophysics_*_v1` schema. It separates article review, sample/state, measurement, spectral band, typed value, decay component, typed mechanism claim, evidence, conflict and curve-registry grains. The active structure-mapping health gate resolves structure identifiers through `atlas_internal.cuhalide_current_structure_registry_v1`, which is currently pinned to Current Curated rev.7 rather than to a superseded hard-coded structure table.

Mechanism curation is normalized through `atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1` and `atlas_internal.cuhalide_photophysics_mechanism_v1`. A mechanism claim is not a free-text synonym for a spectral band: it records the controlled mechanism code, claim scope, claim polarity (`supported`, `consistent_with`, `ruled_out`, or `unresolved`), claim basis (`author_assignment`, experimental/computational support, author inference, Atlas interpretation, or unresolved), direct evidence linkage, mapping/evidence confidence, and QC state. This permits explicit negative evidence—for example a source ruling out defect emission—without treating absence of a mechanism as evidence against it.

An earlier material-grain prototype exists under `public.cuhalide_atlas_material_entities` and `public.cuhalide_atlas_photophysics_*`. Those objects were always protected by RLS/revokes and were never a public product projection. They are explicitly deprecated and frozen read-only for `service_role` so that historical rows remain auditable without allowing parallel curation to diverge from the canonical `atlas_internal` model. The prototype migrations remain versioned because they were applied to production and are part of the database migration history.

Primary evidence, evidence excerpts/locators, source filenames/hashes, conflict-adjudication internals and unpublished normalized curation remain private. The active public photophysics projection is a separately whitelisted service contract. An article may enter the public projection after the Pass A primary-evidence curation gate and row-level QC are complete; that state is machine-readable as `pass_a_curated` and is never presented as independent verification. Articles that subsequently complete independent Pass B review and agreement are promoted to `two_pass_verified`. Measurement-level source conflicts, unresolved rows and other ineligible claims remain fail-closed in either article state. The projection exposes no raw primary files, source filenames, raw evidence locators or internal sample identifiers, and bulk export remains disabled.

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
- explicitly reported calculated absorption/emission endpoints and associated calculated quantities when they are represented by the active property vocabulary;
- reported/experimentally/computationally supported mechanism assignments such as STE, metal/cluster-centered transitions, MLCT/LMCT/XLCT/LLCT, TADF, phosphorescence, ISC/RISC and Cu(I)···Cu(I)-interaction-assisted behavior;
- explicit source-supported exclusions of defect/surface-defect or other candidate mechanisms;
- scintillation light yield, X-ray detection limit, spatial resolution, afterglow and dose-response metrics;
- LED/device metrics such as EQE, CRI and CCT;
- non-luminescent results when explicitly reported.

Numeric values are stored only when explicitly reported or transparently marked as derived with a documented derivation. Experimental and calculated spectra remain different measurement grains. Curves are never fabricated from peak values. Figure-only spectra are not converted into fake numerical traces; digitization, if later performed, must be a separate provenance-labelled workflow.

## Evidence contract

Every curated measurement or mechanism assignment requires a private evidence object containing source type and the best available locator (page, section, table and/or figure). Verbatim excerpts and private source filenames remain private. The public layer may expose normalized values, public sample/state labels, structure links only when the mapping is exact/phase-exact/sample-exact, mechanism polarity/basis, analysis-eligibility state and a generic discrepancy warning after QC. It never exposes publisher PDFs/SI/CIF payloads, private source filenames, raw evidence locators or long copyrighted excerpts.

## Review status

Each article receives an explicit review state and completeness counters.

`pass_a_curated` means the primary-evidence Pass A curation gate is complete for the article's exposed claim set. Every exposed measurement/value/band/mechanism must still satisfy its own QC/evidence gate, and an unresolved or conflicted measurement remains withheld even when other measurements from that article are visible. Pass A curated does **not** claim an independent second review.

`two_pass_verified` / article `qc_passed` means an independent Pass B has re-read the retained public claim set, Pass A and Pass B agree after any controlled corrections, and all retained public claims meet the release-grade evidence/QC contract. Pass B may discover omissions, duplicates, source conflicts or transcription errors; those are corrected explicitly before promotion rather than being hidden by the verification label. External human independence is a separate field and is not implied by AI expert-surrogate Pass B.

Quantitative-analysis eligibility is independent of both publication stages. A claim can be viewable but remain analysis-ineligible because its mapping, condition specificity, approximation, processed-state status or conflict context is not appropriate for quantitative structure-property analysis.

The canonical health function is fail-closed for orphaned entities, duplicate measurement/band keys, missing measurement evidence, eligible values without evidence, inconsistent conflict flags, unresolved conflict records without an adjudication basis, invalid intrinsic-scope claims, invalid structure-exact mappings, unknown property keys, pending row-level QC and completed reviews that do not satisfy their declared verification state. Its mechanism extension additionally fails on mechanism sample/measurement/evidence orphans, band-to-measurement mismatches, evidence-to-claim mismatches, inactive mechanism codes, pending mechanism QC, and analysis-eligible mechanism rows whose mapping/evidence/QC state is unresolved.

## Website target and active projection

The prepublication review interface has a deliberately narrow Photophysics/Spectra projection. It is not a signal that the entire 383-article queue has completed Pass B. Active capabilities are designed to support:

- material-level property cards on article pages after the Pass A curation gate, with the verification stage displayed explicitly;
- a distinct `Two-pass verified` state only after independent Pass B agreement;
- structure pages showing properties only for exact structure/phase/sample mappings, otherwise retaining the material/article-level boundary;
- deterministic queries for emission wavelength, PLQY, lifetime, optical gap, scintillation performance and mechanism with sample-state labels;
- mechanism output that distinguishes positive assignments, source-supported exclusions, unresolved claims and claim basis/confidence rather than flattening all interpretations into one label;
- structure–property comparison only where `analysis_eligible=true`, while still allowing verified non-intrinsic/process/device values to be viewed with their state labels;
- material-specific Smart RAG queries using the same staged public contract instead of legacy article-level hint propagation;
- explicit `reported`, `derived`, `unresolved`, `not applicable`, publication-stage, and quantitative-analysis-eligibility states.

Bulk download of the normalized photophysics corpus remains disabled.

## Publication gate

Public exposure is not enabled merely because the private schema exists. For a Pass A curated claim to enter the public projection, the applicable gates include:

1. row-level scientific QC;
2. material-to-article/structure referential checks;
3. unit/range validation;
4. private evidence-locator coverage checks;
5. mechanism-claim provenance and contradiction checks;
6. privacy/copyright checks;
7. Pass A completion at article/claim grain;
8. browser and API regression tests;
9. RAG unsupported-claim tests.

Independent Pass B is an additional promotion gate for the `two_pass_verified` state; it is not retrospectively implied for Pass A curated records. Measurement-level conflicts remain fail-closed at both stages.

The current prepublication noindex and no-bulk-export governance remains unchanged. The public projection can grow article-by-article without weakening any of these gates.