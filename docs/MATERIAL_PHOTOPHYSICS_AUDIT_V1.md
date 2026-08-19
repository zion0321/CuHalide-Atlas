# CuHalide Atlas material-grain photophysics audit

Status: workstream scaffold for Current Curated rev.7+; not a formal release.

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
- reported/experimentally/computationally supported mechanism assignments such as STE, CC, MLCT, HLCT, XLCT, TADF and phosphorescence;
- scintillation light yield, X-ray detection limit, spatial resolution, afterglow and dose-response metrics;
- LED/device metrics such as EQE, CRI and CCT;
- non-luminescent results when explicitly reported.

Numeric values are stored only when explicitly reported or transparently marked as derived with a documented derivation. Curves are never fabricated from peak values. Figure-only spectra are not converted into fake numerical traces; digitization, if later performed, must be a separate provenance-labelled workflow.

## Evidence contract

Every curated measurement or mechanism assignment requires a private evidence object containing source type and the best available locator (page, section, table and/or figure). Verbatim excerpts and private source filenames remain private. The public layer may expose normalized values, a compact citation/locator label and evidence confidence after QC, but never publisher PDFs/SI/CIF payloads or long copyrighted excerpts.

## Review status

Each article receives an explicit review state and completeness counters. `qc_passed` means the main article/SI available to the project were read, reported material identities were mapped at the finest defensible grain, measurements were normalized with units/conditions, and unresolved items were retained rather than inferred.

## Website target

The public interface will add a Photophysics/Spectra layer after the private audit reaches sufficient QC coverage. Planned capabilities:

- material-level property cards on article pages;
- structure pages show properties only for exact structure mappings, otherwise a clear material/article-level boundary note;
- filters for emission wavelength, PLQY, lifetime, mechanism, sample state, temperature, dimensionality, motif, halogen and application;
- comparisons such as emission vs PLQY, lifetime vs PLQY and scintillation light yield, using only QC-passed normalized measurements;
- material-specific Smart RAG queries with evidence-grain labels and DOI/locator citations;
- explicit `reported`, `derived`, `unresolved` and `not applicable` states.

## Publication gate

No new public photophysics endpoint/view should be enabled merely because the schema exists. Public exposure requires:

1. row-level scientific QC;
2. material-to-article/structure referential checks;
3. unit/range validation;
4. evidence-locator coverage checks;
5. privacy/copyright checks;
6. browser and API regression tests;
7. RAG unsupported-claim tests.

The current prepublication noindex and no-bulk-export governance remains unchanged.
