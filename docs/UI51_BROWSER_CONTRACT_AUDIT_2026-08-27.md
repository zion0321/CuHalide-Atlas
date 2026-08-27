# CuHalide Atlas UI 51 dynamic browser contract audit — 2026-08-27

## Scope

This audit was initiated after the server-side Current Curated rev.9 health, API and deployment contracts had passed while the live portal still exhibited user-visible inconsistencies. The audit therefore treated the browser runtime as an independent scientific presentation layer rather than assuming that correct server responses implied a correct rendered interface.

## Root cause

The rev.9 production adapter had upgraded server-rendered HTML strings and HTTP metadata, but the active page still loaded several browser assets inherited from older UI/data-contract generations. Those external JavaScript files were outside the string-rewrite boundary of `api/ui-r9.js` and were not exercised by the previous required browser contract.

The result was a split-brain presentation state: server/API metadata reported Current Curated rev.9, Structured Photophysics 1.4.0 and Organic Components 1.2.0, while some client-side augmentation code still enforced Photophysics 1.3.3 / Organic Components 1.1.0 semantics.

## Confirmed defects closed by this change

1. **Photophysics dynamic view contract mismatch**
   - The active browser asset required Photophysics 1.3.3 and rejected the correct 1.4.0 health response.
   - The resulting user-visible status could report that structured photophysics was temporarily unavailable even though the backend was healthy.
   - The old copy also exposed obsolete Pass A-only publication language.
   - The browser layer is now contract 1.4.0, requires Current Curated rev.9 and the `two_pass_verified_or_verified_no_reported_data` publication policy, and fails closed if a Pass A-only data-bearing state is encountered.

2. **Organic Components browser metadata and renderer drift**
   - Interactive/augmented records could display Contract 1.1.0 while the authoritative backend and server-rendered record were 1.2.0.
   - The old deterministic graph registry covered only 11 of the 46 canonical graph keys represented by the 61 current rev.9 verified-connectivity rows.
   - The browser layer now requires contract 1.2.0 and rev.9 on every organic-component API response.
   - Thirty-three rev.9 renderer additions were generated with RDKit 2025.09.4 and admitted only after molecular formula and formal charge matched the rev.9 authority exactly. Together with the 11 existing keys, 44/46 renderer-safe canonical keys are covered.
   - The two remaining canonical keys are the R/S Me3-3-AQ chiral quinuclidinium entries. They remain explicit renderer exceptions because the available renderer-level representation has not yet been adjudicated sufficiently to encode topology/protonation/stereochemistry without assumption. The authoritative connectivity status is not downgraded; the browser reports that deterministic 2D rendering is unavailable and does not infer a substitute graph.
   - Verified connectivity without a deterministic browser graph therefore no longer silently looks unresolved; it reports a renderer-asset boundary while never inferring a substitute molecular graph.

3. **Structure-modal photophysics stale fallback**
   - The structure augmentation layer retained 1.3.0 fallback copy and Pass A-era states.
   - It now requires 1.4.0 and preserves the parent-article verification / structure-mapping separation under the current publication gate.

4. **Citation body / header disagreement**
   - `/citation.cff` carried rev.9 HTTP headers while its body still identified Current Curated rev.8.
   - `CITATION.cff` and `codemeta.json` are now rev.9.
   - `api/meta-r9.js` now validates the citation body itself and rejects rev.8 drift rather than checking only the CFF syntax version.

5. **Legacy active UI identity and conflicting augmentation**
   - The Site 51 shell directly activated `ui-v48-2` and `ui-assistant-v48-5` assets.
   - Production now activates `ui-v51-core` and `ui-assistant-v51` assets. Historical v48 files remain available only as repository history/audit material.
   - The obsolete Research Assistant mobile-collapse injection that conflicted with the newer assistant responsive layer was removed from the active UI 51 presentation core.

6. **Platform-misleading search shortcut**
   - The visual shortcut always showed Command-K even though Windows/Linux use Control-K.
   - The label is now platform-aware while both keyboard paths remain supported.

## New required regression boundary

`tests/rev9-dynamic-browser-contract.spec.js` is part of both `qa:browser` and `qa:site-quality` and covers runtime behavior that the earlier static/server contracts did not:

- production shell activates only UI 51 browser assets;
- current CSS/JavaScript assets return browser-correct MIME types;
- citation response body is rev.9;
- `#photophysics` renders the 1.4.0 current publication state (329 two-pass verified data-bearing articles, 54 verified-no-data articles, 2,275 measurements, 3,002 normalized values, 280 analysis-eligible values and 478 mechanism claims) without a client-side unavailable state;
- Pass A-only public-data language is absent;
- browser `pageerror` and console-error channels remain clean on the exercised views;
- a representative verified Organic Components 1.2.0 record renders deterministic SVG connectivity;
- a representative terminal-unresolved record remains diagram-free/fail-closed;
- all 44 renderer-safe verified canonical keys are present, while only the two explicitly adjudicated Me3-3-AQ renderer exceptions may lack a browser graph.

`tests/rev9-organic-renderer-contract.test.mjs` independently executes all eleven graph chunks in an isolated JavaScript context and checks registry coverage. It also validates the molecular-formula and formal-charge metadata embedded in all 33 new rev.9 renderer additions.

The static rev.9 repository contract additionally locks the current browser asset versions and provenance files so a future server-only release cannot silently leave the browser augmentation layer behind.

## Scientific boundary

This change does **not** alter the curated scientific corpus, Frozen Release 3.0.2, Current Curated rev.9 denominators, RAG corpus, photophysics measurements, organic-component adjudications, or private evidence. It repairs presentation/runtime consistency and strengthens fail-closed behavior around already-authoritative server contracts.

The portal remains `prepublication-review`, query-and-view only, noindex/noarchive, with bulk normalized export and primary PDF/SI/CIF/evidence payloads withheld.
