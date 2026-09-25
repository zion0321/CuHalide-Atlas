-- CuHalide Atlas / iPA-PIP final security closeout, 2026-09-25.
-- This migration mirrors changes already applied to the live project.

alter table public.cuhalide_atlas_primary_evidence_audit enable row level security;
alter table public.cuhalide_atlas_primary_evidence_files enable row level security;

-- These tables intentionally have no anon/authenticated policies.
-- Direct anon/authenticated table privileges are absent; service-role workflows retain access.

alter function ipa_pip_part1_final.retrieve_articles(text,text,text,text,integer)
  set search_path = pg_catalog, ipa_pip_part1_final;

alter function ipa_pip_part1_r3_20260919.baseline_retrieve_articles(text,text,text,text,integer)
  set search_path = pg_catalog, ipa_pip_part1_r3_20260919;
