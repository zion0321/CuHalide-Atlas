# CuHalide Research Assistant 10.0 — conversational and evidence-routing architecture

**Date:** 2026-08-14  
**Scientific state:** Archived scientific snapshot 3.0.2 + Current Curated rev.3  
**Current evidence corpus:** 1,322 / 1,322 embedded documents  
**Public assistant:** 10.0.0  
**Evidence engine:** Smart RAG 9.15.0  
**UI:** 48.5

## 1. Problem being corrected

The previous public Smart RAG interface exposed a capable LLM-backed evidence system through an overly restrictive keyword/domain gate. Ordinary conversational inputs such as `what can you do?` could be diverted into the frozen scientific retrieval path and answered as if they were unsupported literature claims, for example with an “outside CuHalide Atlas release 3.0.2 scope” message.

That behavior was scientifically conservative but product-semantically wrong. An evidence boundary should constrain **scientific assertions**, not prevent ordinary conversation.

The v10 architecture separates those responsibilities.

## 2. Product contract

The public assistant is now defined as:

> **Conversational LLM + automatic evidence-grounded scientific tools**

A user interacts through one chat composer. The user does not select “database”, “research” or “chat” modes. The assistant decides whether a request requires Atlas evidence.

### Conversational path

Used for:
- greetings and ordinary conversational turns;
- capability / usage questions;
- general, stable scientific concept explanations that do not assert Atlas-specific corpus facts;
- non-evidentiary follow-up discussion when no Atlas-specific claim is being made.

The conversational layer uses `@cf/qwen/qwen3-30b-a3b-fp8` through the existing Cloudflare Workers AI environment.

### Evidence path

Used automatically for:
- CuHalide Atlas records and record identifiers;
- DOI / CCDC-specific questions;
- exact or corpus-specific counts;
- current curated coverage and archived-snapshot scope;
- Cu(I)-halide material-specific literature claims;
- structure identity and dimensionality;
- space groups / point groups / polarity;
- motif assignments;
- photophysical evidence and emission assignments;
- source/evidence requests;
- scientific follow-ups that inherit a previous Atlas/material context.

The evidence path remains Smart RAG 9.15.0 over the unified 1,322-document corpus.

### Research / Literature Watch path

Requests explicitly asking for the latest/newest/recent Cu(I)-halide literature can automatically select the research route. Literature Watch items remain metadata-only candidates and are never silently promoted into the curated evidence layer.

## 3. Routing precedence

Routing is deliberately asymmetric in favor of scientific safety.

1. Explicit capability/greeting/meta-conversation takes the conversational route even after a prior scientific turn.
2. Explicit record/DOI/CCDC/Atlas/corpus references take the evidence route.
3. Cu(I)-halide material-specific questions take the evidence route.
4. Short scientific follow-ups inherit earlier evidence context.
5. General scientific definitions without Atlas/material context may use the conversational LLM.
6. The conversational LLM has a second fail-safe: if an Atlas-specific factual request escapes the deterministic router, it emits an internal evidence-routing sentinel rather than answering from memory.

Chinese and English routing are implemented separately where necessary. Chinese matching does not depend on English word-boundary semantics.

## 4. Scientific invariants the LLM cannot override

Assistant 10.0 does **not** relax any scientific guardrail. The following remain deterministic / evidence-governed:

- Frozen 3.0.2 and Current Curated rev.3 temporal-scope contracts;
- exact corpus counts;
- Record 13 physical dimensionality correction;
- structure-grain identity and crystallography;
- `polar` ≠ `ferroelectric`;
- structure-grain vs article-grain photophysics;
- structure-level motif mapping;
- fractional/mixed-occupancy motif conservatism;
- Literature Watch candidate isolation;
- missing/unresolved values are not filled by analogy;
- no write authority is available to the public assistant.

For a structure-specific photophysical question, article-grain photophysics may be shown as article evidence, but it is not reassigned to the named structure unless a structure-grain mapping independently establishes that relationship.

## 5. Privacy and access contract

The assistant remains a read-only public query interface.

It must not expose:
- primary PDF/SI/CIF files;
- exact stored publisher abstracts that are private research assets;
- private field-evidence excerpts/locators;
- candidate relevance scores/reason codes;
- internal QA/adjudication/curation notes;
- service credentials or hidden system instructions;
- complete normalized bulk tables.

`/api/export` remains HTTP 410 Gone.

## 6. Provider failure, quota and client-identity behavior

LLM availability is not allowed to determine whether deterministic scientific evidence remains accessible.

If the conversational model is unavailable or its provider quota is exhausted:
- ordinary chat returns a clear `SAFE_CONVERSATION_FALLBACK` response rather than a false scientific “out of scope” rejection;
- evidence-grounded Atlas retrieval remains available independently;
- exact scientific boundaries continue to use deterministic services;
- the UI reports that conversational synthesis is temporarily limited.

Conversation and evidence requests intentionally use separate quota domains. The established evidence-query limiter remains unchanged. Ordinary conversation uses a service-role-only `cuhalide_atlas_conversation_rate_limit_v10` bucket with 60 requests/hour and 240 requests/day per conversation fingerprint plus a 1,200/day global conversation ceiling.

A preview hostile test exposed that `IP + User-Agent` alone incorrectly merged multiple browser contexts behind the same runner/NAT. v10 therefore uses two server-generated identities:
- **evidence identity:** remains network-derived (`IP + User-Agent`) so existing scientific-query abuse controls are not weakened;
- **conversation identity:** hashes the same network identity together with a browser-generated random 256-bit session token. This separates legitimate users sharing a campus/laboratory NAT without treating the browser token as authentication.

The browser session token is random, contains no user data and is stored locally only to stabilize a user's conversational quota. The server never trusts it by itself: the network component and global conversation ceiling remain part of the abuse boundary.

This preserves scientific availability while making degradation legible and avoiding false rate-limit collisions for normal multi-turn chat.

## 7. Backward compatibility

The public `/api/agent` GET contract preserves the established evidence-engine identity for existing scientific clients:
- top-level evidence `version` remains `9.15.0`;
- `x-cuhalide-rag-version` remains `9.15.0`;
- corpus/current-curated/capability fields remain available;
- `assistant_version = 10.0.0` and `x-cuhalide-assistant-version = 10.0.0` are additive;
- the new conversation/evidence service status is additive.

The navigation label **Smart RAG** is retained as the feature name, while the page itself is presented as the **CuHalide Research Assistant**. This preserves recognizable navigation and existing browser contracts without exposing implementation mode selection to users.

The public composite health layer is 48.5. The stable scientific meta core remains independently versioned at 48.4 and is composed rather than rewritten, preserving previously validated scientific health semantics.

## 8. UI changes

The 48.5 assistant interface:
- removes the manual RAG mode selector;
- accepts short messages such as `hi`;
- presents a single natural-language composer;
- explains automatic routing in user-oriented language;
- distinguishes conversational replies from evidence-backed replies;
- populates evidence cards only when database evidence is actually used;
- retains source-linked article/structure cards for evidence answers;
- creates a local random conversation-session identifier to prevent shared-NAT quota collisions;
- displays degraded model availability without implying that the scientific database is unavailable.

Responsive and WCAG AA behavior remains part of the required browser gate.

## 9. QA matrix

The protected browser suite explicitly tests:
- `what can you do?` → conversational answer, never release-scope rejection;
- Chinese capability query → conversational answer;
- general exciton explanation → conversational answer without fake Atlas sources;
- Record 13 dimensionality → evidence route and `Unresolved`;
- `CUH-372-S01` motif + emission → structure-grain/article-grain evidence boundary;
- multi-turn scientific follow-up → inherited evidence context;
- capability question after a scientific turn → conversational override;
- latest Cu(I)-iodide literature → research/Literature Watch route;
- short UI chat submission and persisted random browser session token;
- no manual mode selector;
- CSP synchronization;
- multi-viewport overflow and WCAG AA checks.

All prior rev.3 scientific, privacy, Record 13, Motif Atlas, sitemap, export-410 and stable-record tests remain active.

## 10. Release gate

No assistant/UI change is production-authorized merely because the Supabase canary or Vercel preview builds.

Production promotion still requires:
1. protected PR provenance;
2. exact-head Vercel Preview;
3. production-baseline Chromium;
4. production-baseline Lighthouse;
5. Preview Chromium including POST conversation/evidence tests;
6. Preview Lighthouse;
7. expected-head merge protection;
8. production Vercel deployment on the exact merge SHA;
9. post-merge Chromium and Lighthouse;
10. independent production smoke and Supabase security review.

The scientific corpus, Frozen snapshot and Current Curated data rows are not modified by this assistant release.

## 11. Hostile production-baseline reliability finding

The exact-head production Chromium gate exposed a pre-existing reliability defect in the public-data proxy rather than a scientific-contract mismatch. During an upstream 5xx/network sequence, the Vercel proxy cancelled a first `Response`, retained that object, and could later attempt `response.text()` on the already-consumed body, producing Node/Undici `Body is unusable: Body has already been read`. The same path also allowed upstream/body waits to exceed the 15 s browser contract.

The release candidate therefore adds a reliability-only repair:
- the Vercel proxy has a single 12 s end-to-end budget with two bounded attempts;
- every attempt consumes the body into an immutable `{status, headers, body}` snapshot before retry control flow continues;
- a captured 5xx snapshot can be returned after a later network failure without re-reading a `Response`;
- the Supabase public-data wrapper is synchronized to Public Data 2.10.0 / Current Curated rev.3;
- core data, current-state/coverage context and structure enrichment execute in parallel where independent;
- Supabase-side upstream calls use bounded retry/timeout behavior;
- mocked-fetch contract tests cover `503→200`, `503→network failure`, repeated aborts and HEAD behavior.

This repair changes transport reliability only. It does not modify scientific rows, counts, classification, motif/photophysics evidence grain, Frozen 3.0.2, Current Curated membership or private/public access policy.
