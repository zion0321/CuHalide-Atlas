# CuHalide Atlas public information architecture — 2026-08-14

## Decision

CuHalide Atlas is presented publicly as **one continuously curated scientific knowledge base**. The interface defaults to the latest primary-evidence-reviewed state. Internal release/revision mechanics remain available for provenance and reproducibility, but they are not exposed as competing user modes.

This is an information-architecture change only. It does not alter scientific data, scope decisions, frozen denominators, Current Curated denominators, RAG documents, access policy or the public/private evidence boundary.

## Three operational states

### 1. Latest curated knowledge — primary public experience

The public site, article browser, structure register, Motif Atlas and Smart RAG default to the latest QC-passed state.

Current governed identifier: `Current Curated rev.3`

Public wording: **Curated through 14 Aug 2026** / **latest reviewed corpus**.

The internal revision remains machine-readable and auditable, but ordinary users do not need to select or interpret it.

### 2. Literature Watch — discovery before evidence

Literature Watch contains newly indexed metadata before primary-evidence review. It is intentionally separate from curated scientific counts.

A candidate can become curated only after DOI deduplication, scope triage, primary article/SI/CIF review as appropriate, evidence extraction, structure/phase mapping and QC.

Public wording: **newly discovered candidates awaiting review**.

### 3. Archived scientific snapshot — reproducibility

Archived scientific snapshot `3.0.2` is the immutable historical baseline internally governed as Frozen Release 3.0.2.

Its coverage was verified through `2026-06-30`. This date is a **snapshot coverage boundary**, not a continuing literature cutoff for CuHalide Atlas.

The snapshot remains available in provenance, citation metadata, health contracts and scope-aware APIs so published denominators can be reproduced exactly.

## Public presentation rules

- Do not present Frozen and Current as two equally prominent databases.
- Do not require users to select an archived snapshot for ordinary browsing.
- Do not use a snapshot cutoff as the headline freshness date of the living portal.
- Show the latest reviewed curation date prominently.
- Keep archived snapshot identity in Data provenance / citation contexts.
- Keep exact machine identifiers (`release=3.0.2`, `current_revision=3`) in headers, APIs and health contracts.
- Keep Literature Watch visibly distinct from curated evidence.
- Preserve unresolved values instead of filling them by analogy.
- Keep structure-grain and article-grain evidence boundaries explicit.

## Navigation hierarchy

Primary navigation emphasizes research tasks:

1. Overview
2. Literature
3. Structures
4. Motifs
5. Polar
6. Smart RAG
7. About data

Methods, Literature Watch and detailed provenance remain accessible without crowding the primary task navigation.

## Home page hierarchy

The home page should answer, in order:

1. What is CuHalide Atlas?
2. How current is the reviewed knowledge?
3. What can I search?
4. What are the present scientific denominators?
5. How is evidence governed?

The principal status card therefore reports the latest curation date and current scientific counts, not a Frozen/Current comparison table.

## Stable record pages

Article and structure pages use the neutral label **Curated record**. Provenance is expressed in secondary text:

- base record: part of archived snapshot 3.0.2 and retained in the current corpus;
- rolling addition: curated after the archived snapshot and reviewed through the current date.

Raw internal status strings are not used as the main visual badge.

## Motif Atlas

Motif Atlas opens on the latest reviewed structure taxonomy. The primary view emphasizes:

- total structure/phase taxonomy coverage;
- motif-resolved rows;
- motif-unresolved rows;
- primary-evidence curated organic-component coverage;
- material classes and motif-family denominators.

Legacy label-derived component candidates remain accessible but collapsed by default because they are secondary hints, not normalized primary-evidence identities.

## Citation model

Living result:

> CuHalide Atlas. Continuously curated Cu(I) halide knowledge portal. Include access date and relevant primary literature.

Historical reproducibility:

> CuHalide Atlas archived scientific snapshot 3.0.2 (11 August 2026), snapshot coverage verified through 30 June 2026.

The internal term `Frozen Release 3.0.2` remains valid in governance and machine metadata.

## Non-negotiable scientific invariants

The presentation change must not alter:

- Archived/Frozen 3.0.2 counts;
- Current Curated rev.3 counts;
- Record 13 corrected dimensionalities;
- Motif Atlas 1.2 fractional/mixed-occupancy conservatism;
- strict-polar criteria;
- Current/Frozen API scope semantics;
- Smart RAG 9.15.0 evidence-grain and temporal-scope guards;
- `/api/export` HTTP 410;
- private PDF/SI/CIF and curation-evidence boundary.

The browser and repository contract tests enforce these requirements.
