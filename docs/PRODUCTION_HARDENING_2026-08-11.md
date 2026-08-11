# Production hardening — 2026-08-11

This note records operational repairs applied after the release 3.0.1 scientific archive was frozen. These repairs do **not** rewrite the immutable release.

## Public portal

- Site contract: v47.
- Public data: 2.6.0.
- Literature cutoff: 2026-06.
- Accessibility contrast was corrected for the muted-text and teal UI tokens.
- Structure tables and structure details now expose halogen evidence scope/confidence; the detail view also exposes the halogen assignment basis.
- Pager containers use explicit `role="navigation"` semantics so their accessible names are valid.
- Temporary CSP/environment audit endpoints and the obsolete public reproducibility-export workflow were retired.

## Smart RAG evidence-grain repair

- Public Smart RAG contract: 9.10.0.
- Internal quota gateway: 9.9.5-public-internal.
- Final internal orchestrator: 9.11.3-final-internal.
- Evidence-grain-safe retrieval core: 9.11.0-safe-core-internal.
- Workers AI free capacity was re-verified as available; paid overage remains unauthorized.

Scientific-property concepts are retrieved at article grain unless an independent structure-grain mapping exists. Explicit structure/phase questions use a safe identity/crystallography projection. Article-grain photophysics, motif, stability, transport, and related scientific properties are not silently reassigned to a structure row. The underlying historical structure RAG documents have **not** yet been physically rebuilt/re-embedded, so this guarantee is enforced by the current runtime projection and guards rather than by claiming that the stored corpus is already clean.

## Validation boundary

The legacy `rag-benchmark-v1.3` 70/70 result remains a frozen prior baseline and is not attributed to the current runtime. A current-runtime benchmark must use evidence-grain-aware gold labels and be archived before a new full-score claim is made.
