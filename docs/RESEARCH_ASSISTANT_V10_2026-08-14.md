# CuHalide Research Assistant 10.0 — conversational and evidence-routing architecture

**Date:** 2026-08-14  
**Scientific state:** Archived scientific snapshot 3.0.2 + Current Curated rev.3  
**Current evidence corpus:** 1,322 / 1,322 embedded documents  
**Public assistant:** 10.0.0  
**Evidence engine:** Smart RAG 9.15.0  
**UI:** 48.5

## 1. Problem being corrected

The previous public Smart RAG interface exposed a capable LLM-backed evidence system through an overly restrictive keyword/domain gate. Ordinary conversational inputs such as `what can you do?` could be diverted into the frozen scientific retrieval path and answered as if they were unsupported literature claims, for example with an “outside CuHalide Atlas release 3.0.2 scope” message.

That behavior was scientifically conservative but product-semantically wrong. An evidence boundary should constrain **scientific assertions**, not prevent ordinary conversation. The v10 architecture separates those responsibilities.

## 2. Product contract

The public assistant is **Conversational LLM + automatic evidence-grounded scientific tools**. A user interacts through one chat composer and does not select database/research/chat modes.

Conversational turns cover greetings, capability/usage questions, general stable scientific explanations and ordinary non-evidentiary follow-ups. The conversational layer uses `@cf/qwen/qwen3-30b-a3b-fp8` through the existing Cloudflare Workers AI environment.

Evidence routing is automatic for Atlas records, DOI/CCDC questions, exact corpus counts, current/frozen scope, Cu(I)-halide material-specific claims, structure/crystallography/polarity, motif, photophysics, source requests and scientific follow-ups inheriting an earlier Atlas context. The evidence path remains Smart RAG 9.15.0 over the unified 1,322-document corpus.

Latest/newest/recent Cu(I)-halide requests can select the Literature Watch research route. Watch items remain metadata-only candidates and are never silently promoted into curated evidence.

## 3. Routing precedence

1. Explicit capability/greeting/meta-conversation takes the conversational route even after a prior scientific turn.
2. Explicit record/DOI/CCDC/Atlas/corpus references take the evidence route.
3. Cu(I)-halide material-specific questions take the evidence route.
4. Short scientific follow-ups inherit earlier evidence context.
5. General definitions without Atlas/material context may use the conversational LLM.
6. If an Atlas-specific factual request escapes the deterministic router, the conversational LLM emits an internal evidence-routing sentinel rather than answering from memory.

Chinese and English routing are implemented separately where necessary; Chinese matching does not depend on English word-boundary semantics.

## 4. Scientific invariants the LLM cannot override

Assistant 10.0 does not relax any scientific guardrail. Frozen 3.0.2 and Current Curated rev.3 temporal scope, exact corpus counts, Record 13, structure-grain crystallography, `polar ≠ ferroelectric`, structure-grain/article-grain photophysics, structure-level motif mapping, fractional/mixed-occupancy conservatism, Literature Watch isolation, unresolved values and read-only authority remain deterministic/evidence-governed.

Article-grain photophysics may be shown for a structure query as article evidence, but it is not reassigned to the named structure unless an independent structure-grain mapping establishes that relationship.

## 5. Privacy and access contract

The assistant remains read-only. It must not expose primary PDF/SI/CIF files, exact stored publisher abstracts kept as private research assets, private field-evidence excerpts/locators, candidate relevance internals, QA/adjudication notes, service credentials/hidden instructions or complete normalized bulk tables. `/api/export` remains HTTP 410 Gone.

## 6. Provider failure, quota and client identity

LLM availability cannot determine whether deterministic scientific evidence remains accessible. Provider unavailability or quota exhaustion produces `SAFE_CONVERSATION_FALLBACK`; evidence retrieval and deterministic scientific boundaries remain independently available.

Conversation and evidence use separate quota domains. Evidence keeps the established conservative limiter. Conversation uses service-role-only `cuhalide_atlas_conversation_rate_limit_v10`: 60/hour and 240/day per conversation fingerprint plus 1,200/day global.

A hostile preview found that `IP + User-Agent` merged legitimate users behind the same NAT. Evidence identity therefore remains network-derived, while conversation identity hashes the same network identity with a browser-generated random 256-bit local session token. The token contains no user data, is not authentication, and is never trusted by itself.

The private usage table has RLS, direct browser privileges revoked, a service-role-only RPC, and an explicit RESTRICTIVE deny-all policy for `anon` and `authenticated`.

## 7. Backward compatibility

The public `/api/agent` GET contract keeps evidence `version=9.15.0` and `x-cuhalide-rag-version=9.15.0`; `assistant_version=10.0.0` and `x-cuhalide-assistant-version=10.0.0` are additive. Corpus/current-curated/capability fields remain available. The navigation label Smart RAG remains recognizable while the page is presented as CuHalide Research Assistant.

Scientific meta core 48.4 remains independently versioned; public composite health/UI is 48.5.

## 8. UI contract

The 48.5 interface removes manual mode selection, accepts short messages, presents one natural composer, distinguishes conversation from evidence-backed replies, shows source cards only when evidence is used, retains source-linked article/structure cards, creates a local random conversation-session identifier, and reports degraded model availability without implying the database is unavailable.

The Assistant guidance panel is not treated as the legacy Smart RAG “research setup” on mobile: guidance remains visible at 390 px. The page-head eyebrow color is independently AA-safe rather than relying on the marginal legacy color token. Responsive behavior, overflow and WCAG AA remain required browser gates.

## 9. Deterministic runtime control plane

Hostile production/preview testing showed that the historical composite health topology recursively fanned out through Public Data, Literature Watch, multiple Smart RAG/legacy layers and a site self-probe. Health itself could become a load generator.

`cuhalide-atlas-runtime-contract-v1-public` now supplies high-frequency GET control-plane responses directly from existing deterministic database/RPC contracts:
- Public Data `health` and `bootstrap`;
- `/health.json`;
- `/api/agent` GET manifest;
- sitemap identity index.

The control endpoint never recursively calls Public Data, Smart RAG or Candidates. Literature Watch live status remains a separate status surface. Real Assistant POST is unchanged and still traverses Research Assistant → conversational/evidence services; protected Preview Chromium must execute those POST paths before release.

The sitemap control action reads only already-public identity columns from the Current projection and independently verifies exactly 359 canonical article IDs and 887 Core-Included structure IDs. `api/sitemap` then verifies the final 1,248-URL invariant. This replaces the prior 31+ Edge-page rebuild without weakening any denominator guard.

## 10. Public-data reliability and QA load hardening

The production baseline exposed an old `Body is unusable: Body has already been read` path. The Vercel public-data proxy now uses a 12 s total budget, two bounded attempts and immutable response snapshots; a later network failure can return an earlier captured 5xx without re-reading a consumed `Response`.

The public Supabase wrapper is synchronized to Public Data 2.10.0 / rev.3, with independent core/context/structure-enrichment work parallelized under bounded timeouts. Mocked tests cover `503→200`, `503→network failure`, repeated aborts and HEAD.

Preview QA previously grouped concurrency by deployment SHA and startup loops polled full `/health.json`, allowing superseded candidates to create a thundering herd. Preview concurrency is now keyed by deployment ref with cancellation; candidate startup uses local-only `/__qa/ready`. Full scientific/health tests remain in the protected suite.

## 11. QA matrix

Protected QA explicitly verifies conversational English/Chinese capability questions, general exciton explanation without fake citations, Record 13 evidence routing and `Unresolved`, CUH-372-S01 motif/photophysics evidence-grain separation, inherited scientific context, meta-conversation override, Literature Watch routing, short UI chat, session persistence, no mode selector, deterministic control-plane topology, 1,248 sitemap URLs, multi-viewport overflow and WCAG AA.

All prior rev.3 scientific, privacy, Record 13, Motif Atlas, export-410 and stable-record tests remain active. A passing release is expected to have no failed or flaky protected-browser tests.

## 12. Release gate

Production promotion requires protected PR provenance; exact-head Vercel Preview; production-baseline Chromium and Lighthouse; Preview Chromium including live POST conversation/evidence tests; Preview Lighthouse; expected-head merge; exact merge-SHA Vercel production deployment; post-merge Chromium/Lighthouse; and independent production/Supabase security smoke.

No assistant/UI/control-plane change is permitted to modify scientific rows, Frozen denominators, Current Curated membership, taxonomy assignments, RAG documents or the public/private evidence boundary.
