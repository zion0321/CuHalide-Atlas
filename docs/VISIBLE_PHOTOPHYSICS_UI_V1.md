# Visible Structured Photophysics UI v1

This additive public UI layer makes the Structured Photophysics 1.3.0 contract directly visible without changing the scientific publication gate or private-evidence boundary.

Visible changes:

- adds a first-class **Photophysics** navigation destination;
- adds a home-page structured-photophysics feature panel with live Pass A / measurement / value counts;
- adds a dedicated photophysics overview with verification-stage and evidence-grain explanations;
- enriches article dialogs with sample-resolved measurements, normalized values, band peaks, mechanism assignments, analysis-eligibility flags and explicit curated conflicts;
- keeps Pass A curated and two-pass verified states visually distinct;
- keeps raw primary files, raw evidence locators, internal sample IDs and unpublished adjudication private.

The layer is injected by `api/ui-assistant-current.js` as same-origin external CSS/JS, preserving the existing CSP model and the immutable Frozen Release 3.0.2 / Current Curated rev.7 scientific denominators.
