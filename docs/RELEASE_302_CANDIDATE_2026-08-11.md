# CuHalide Atlas 3.0.2 scientific hotfix candidate

Date prepared: 2026-08-11  
Status: **validated candidate — not yet published/current**  
Parent: **3.0.1**

## Purpose

Release 3.0.2 is a correction-only scientific hotfix. It formalizes the four already-confirmed Record 13 `Structural Dimensionality` corrections that release 3.0.1 currently applies only through an effective public erratum overlay.

It intentionally contains **no newly discovered literature**. New papers belong to the rolling current-curated layer and a later data-expansion release (for example 3.1.0), not to this correction patch.

## Accepted scientific amendments

| Structure | 3.0.1 archived value | 3.0.2 candidate value |
|---|---|---|
| CUH-013-S01 | `0D (pyrCu2Br3` | `Unresolved` |
| CUH-013-S02 | `pyr4Cu4I8)` | `0D` |
| CUH-013-S03 | `not assigned in article narrative for pip6Cu10I16` | `0D` |
| CUH-013-S04 | `pyr4Cu4Br8` | `0D` |

All four amendments are recorded as High-confidence accepted scientific corrections with source-level Record 13 evidence. This review is an AI expert-surrogate/source-evidence curation step and is not represented as independent-human validation.

## Candidate snapshot hashes

- normalized articles: `dd4b79e6f67e7dd29bccabc28bffff67ba9bee04da811803bf4dacc3091170b6`
- normalized structures: `7eac6680ef2800053f7d7b9f65222c4e4386328bd0a76eb66e6c0a067f432a93`
- verified structure set: `138440d8a8a59255673606fda7df13c6279a13e343933b3e1a57dcc2431f85ef`
- strict-polar set: `4cfd5456e50637c59408e93bd37a06aeb100b92c7219f8dc38459da3a375c0dc`

The article and strict-polar payloads are byte-identical to 3.0.1. The normalized-structure and verified-structure payloads change only through the four targeted dimensionality corrections above.

## Preserved denominators

- article audit: 346
- canonical verified articles: 332
- structure/phase rows: 878
- Core-Included structure rows: 816
- resolved space-group rows: 650
- verified one-to-one space-group mappings: 625
- verified polar rows: 87
- strict-polar rows: 67
- strict-polar articles: 42

No release denominator changes are authorized by this hotfix.

## Release-candidate public projection

Private release-specific candidate projections have been prepared:

- `cuhalide_atlas_public_articles_v302`
- `cuhalide_atlas_public_structures_v302`
- `cuhalide_atlas_public_projection_contract_v302`

Candidate query/bootstrap/health RPCs were cloned as versioned v302 functions. The v302 projection contract currently passes:

- row/count invariants;
- deterministic SHA-256 projection integrity;
- article-halogen semantics;
- structure-halogen-v6 semantics;
- bootstrap denominator checks;
- duplicate DOI = 0;
- orphan structures = 0;
- canonical scope consistency;
- polarity/point-group consistency;
- RLS/ACL least-privilege checks.

The v302 projection has zero active `known_erratum` rows because the four corrections are intrinsic to the candidate snapshot rather than runtime overlays.

## Publication gate

The candidate is deliberately **not marked published/current yet**. Formal publication requires one atomic release switch across:

1. release registry and public release manifest;
2. public-data v302 projection routing;
3. public website release/citation text;
4. Smart RAG public release identity and protected exact routes;
5. current-runtime RAG regression after the release-label switch;
6. production health and browser QA.

Only after all gates are green should 3.0.2 replace 3.0.1 as the current frozen release. The historical 3.0.1 payload remains immutable.
