# Structured Photophysics 1.3.2

**Activation date:** 2026-08-25  
**Scientific context:** Current Curated rev.7  
**Publication state:** prepublication review  
**Public access:** read-only query-and-view

## Purpose

Structured Photophysics 1.3.2 is a controlled evidence-correction release produced during independent Pass B review. It corrects source-explicit photophysical and thermal information that was supported by the primary literature and representable in the existing schema but was not fully captured in the previous structured projection.

The release does **not** change the scientific entity model, Current Curated rev.7 structure-truth denominators, Frozen Release 3.0.2, Organic Components 1.1.0, or the 1,329-document / 1,329-embedding Current Curated RAG corpus.

## Corrected structured-content baseline

The active 1.3.2 public projection contains:

| Structured-photophysics object | 1.3.2 baseline |
|---|---:|
| Publishable sample states | 940 |
| Publishable measurements | 2,262 |
| Publishable normalized values | 2,985 |
| Quantitative-analysis-eligible values | 281 |
| Publishable mechanism claims | 477 |
| Withheld conflict measurements | 9 |

The article review queue remains **383** records. Pass A is complete for all 383 records and no Pass A record is pending. Verification-stage counts are a living state as Pass B progresses, so the Pass A-curated and two-pass-verified counts are intentionally not frozen in this release note. Their required invariant is:

`Pass A curated + two-pass verified + verified-no-data = 383`

The verified-no-data denominator remains **54** unless a separately documented scientific correction changes it.

## Controlled evidence corrections

### Record 310

The structure-mapped crystalline material retains its 489 nm emission, PLQY, and Stokes-shift information. Version 1.3.2 additionally preserves a source-reported **291 nm photoluminescence-excitation maximum** as a separate excitation-spectrum measurement and a **14-day reagent-immersion photoluminescence-stability observation** as a separate stability measurement. Fourteen days are represented by the exact unit conversion **336 h**; the reported qualitative outcome is retained without inventing a numerical retention percentage.

The self-trapped-exciton assignment remains an explicitly **computationally supported source assignment**, rather than being upgraded into a stronger causal conclusion. The down-conversion WLED result, including **CRI 95**, remains a separate device-grain sample and is not structure-linked.

### Record 312

The existing source-reported orange-red emission at **625 nm** under **460 nm excitation** now includes the source-reported **180 nm FWHM**. The existing 60-day water-treatment stability observation remains a distinct stability measurement, represented by the exact conversion **1,440 h** plus the source-level qualitative outcome. The WLED result, including **CRI 91.4**, remains device-grain data. No structure mapping or mechanism assignment is invented.

### Record 313

The source-reported **302 nm** value is represented only as the excitation condition of the steady-state PL measurement; it is **not** reclassified as a photoluminescence-excitation maximum. The steady-state record preserves the **558 nm** emission maximum, **108 nm FWHM**, **15.17% PLQY**, and **254 nm Stokes shift**.

The source-reported room-temperature **84.63 μs** lifetime is stored as a separate time-resolved PL measurement monitored at 558 nm. The existing 24 h water-immersion observation retains the reported lower-bound PL-intensity retention of **>94%**. These data remain at compound/article grain because the reviewed evidence does not establish a defensible structure-specific mapping.

### Record 333

The crystalline material retains the approximately **3.40 eV** optical absorption edge, the distinct thermal events at **140 °C** and **250 °C**, the approximately **29.5%** high-temperature mass loss, and the reported decomposition outcome involving loss of `(MeNH3)I` and formation of CuI. Version 1.3.2 additionally preserves the source-reported statement that the material is stable up to approximately **260 °C** as a thermal-stability/decomposition-threshold value. The distinct thermal events are not collapsed into the stability threshold.

## Pass B closeout for the corrected records

For Records 310, 312, 313, and 333, the final retained public measurement, band, value, and mechanism objects were independently checked at their represented evidence grain before article-level promotion to `two_pass_verified`. No unresolved source-conflict blocker remains for these four corrected records.

Two-pass verification does not alter sample identity or evidence grain. In particular, article/compound-level values remain article/compound-level, device observations remain device-level, and structure identifiers are attached only where the evidence independently supports structure-exact mapping.

## Fail-closed and privacy guarantees

Structured Photophysics 1.3.2 preserves the existing fail-closed policy:

- unresolved or source-conflicted measurements are not silently harmonized;
- quantitative-analysis eligibility is independent of publication-stage eligibility;
- processed, composite, device, and crystal-intrinsic states remain distinct;
- article-grain evidence is not propagated to a crystallographic structure without explicit mapping;
- raw primary files, publisher source filenames, source hashes, raw evidence locators, internal sample identifiers, and private adjudication notes are not exposed by the public projection;
- bulk export remains disabled during prepublication review.

## Unchanged scientific baselines

Current Curated rev.7 remains curated through **2026-08-19** with **383 article-audit records, 369 canonical verified articles, 946 structure/phase rows, 886 Core-Included rows, 684 verified one-to-one space-group rows, 87 strict-polar rows, and 54 strict-polar articles**.

Frozen Release 3.0.2 remains an immutable historical snapshot and is not rewritten by the 1.3.2 photophysics correction.
