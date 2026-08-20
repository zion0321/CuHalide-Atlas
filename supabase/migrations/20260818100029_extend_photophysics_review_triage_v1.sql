alter table atlas_internal.cuhalide_photophysics_article_review_v1
  add column if not exists triage_priority integer not null default 100,
  add column if not exists risk_flags text[] not null default '{}',
  add column if not exists structure_row_count integer not null default 0,
  add column if not exists legacy_emission_hint text not null default '',
  add column if not exists legacy_assignment_hint text not null default '',
  add column if not exists legacy_hint_is_evidence boolean not null default false;

comment on column atlas_internal.cuhalide_photophysics_article_review_v1.legacy_emission_hint is 'Legacy article-grain emission text used only to prioritize primary-source reading. Never treated as photophysics evidence.';
comment on column atlas_internal.cuhalide_photophysics_article_review_v1.legacy_hint_is_evidence is 'Hard guard: must remain false; old article-level emission fields are triage hints only.';

alter table atlas_internal.cuhalide_photophysics_article_review_v1
  add constraint photophysics_legacy_hint_not_evidence check (legacy_hint_is_evidence = false);