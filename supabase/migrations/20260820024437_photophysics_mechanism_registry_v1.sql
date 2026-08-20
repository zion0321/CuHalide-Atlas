create table if not exists atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1 (
  mechanism_code text primary key,
  label text not null,
  mechanism_family text not null,
  definition text not null,
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1
(mechanism_code,label,mechanism_family,definition,notes)
values
('STE','Self-trapped exciton','exciton_localization','Emission or excited-state dynamics assigned to a self-trapped exciton.','Retain the source evidence basis; broad emission alone is not sufficient.'),
('metal_centered','Metal-centered transition','metal_centered','Transition assigned predominantly to a metal-centered excited state.','For Cu(I), distinguish author-assigned metal-centered emission from generic Cu-centered language.'),
('cluster_centered','Cluster-centered transition','cluster_centered','Transition assigned to an excited state localized predominantly on the inorganic metal-halide cluster.',''),
('MLCT','Metal-to-ligand charge transfer','charge_transfer','Metal-to-ligand charge-transfer excited state or emission.',''),
('LMCT','Ligand-to-metal charge transfer','charge_transfer','Ligand-to-metal charge-transfer excited state or emission.',''),
('XLCT','Halide-to-ligand charge transfer','charge_transfer','Halide-to-ligand charge-transfer excited state or emission.',''),
('LLCT','Ligand-to-ligand charge transfer','charge_transfer','Ligand-to-ligand charge-transfer excited state or emission.',''),
('charge_transfer','Charge-transfer state','charge_transfer','Charge-transfer assignment whose direction is not resolved more specifically.',''),
('TADF','Thermally activated delayed fluorescence','spin_kinetics','Emission assigned to thermally activated delayed fluorescence.','Require source-specific kinetic/temperature evidence for analysis use.'),
('phosphorescence','Phosphorescence','spin_kinetics','Emission assigned to phosphorescence.',''),
('fluorescence','Fluorescence','spin_kinetics','Emission assigned to prompt fluorescence.',''),
('triplet_charge_transfer','Triplet charge-transfer state','charge_transfer','Triplet charge-transfer excited state or emission.',''),
('cuprophilic_assisted','Cu(I)-Cu(I)-interaction-assisted excited state','metal_metal_interaction','Photophysics explicitly linked by the source to Cu(I)-Cu(I) interactions.','Short Cu-Cu distance alone does not establish this mechanism.'),
('ISC','Intersystem crossing','spin_kinetics','Intersystem crossing process between source-defined excited states.',''),
('RISC','Reverse intersystem crossing','spin_kinetics','Reverse intersystem crossing process between source-defined excited states.',''),
('spin_polarized_STE','Spin-polarized self-trapped exciton','spin_exciton','Self-trapped exciton explicitly reported to preserve or carry spin polarization.',''),
('defect_emission','Defect-related emission','defect','Emission assigned to a bulk/permanent defect state.','May also be recorded with claim_polarity=ruled_out when explicitly excluded.'),
('surface_defect_emission','Surface-defect emission','defect','Emission assigned to surface-related defect states.','May also be recorded with claim_polarity=ruled_out when explicitly excluded.'),
('mixed','Mixed mechanism','mixed','Source explicitly assigns more than one inseparable mechanism to the same observed channel.','Prefer multiple mechanism rows when individual contributions are separately identifiable.'),
('other','Other source-defined mechanism','other','Mechanism that is source-defined but not yet represented by a dedicated controlled term.','assignment_text is mandatory for useful interpretation.'),
('unresolved','Unresolved mechanism','unresolved','Mechanistic assignment remains unresolved.','')
on conflict (mechanism_code) do update set
  label=excluded.label,
  mechanism_family=excluded.mechanism_family,
  definition=excluded.definition,
  notes=excluded.notes,
  active=true;

create table if not exists atlas_internal.cuhalide_photophysics_mechanism_v1 (
  mechanism_id bigint generated always as identity primary key,
  record_id integer not null,
  structure_id text,
  sample_id bigint not null references atlas_internal.cuhalide_photophysics_sample_state_v1(sample_id) on delete cascade,
  measurement_id bigint not null references atlas_internal.cuhalide_photophysics_measurement_v1(measurement_id) on delete cascade,
  band_id bigint references atlas_internal.cuhalide_photophysics_band_v1(band_id) on delete cascade,
  mechanism_code text not null references atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1(mechanism_code),
  claim_scope text not null default 'measurement' check (claim_scope in ('emission_band','measurement','excited_state_process','sample','article_interpretation')),
  claim_polarity text not null default 'supported' check (claim_polarity in ('supported','consistent_with','ruled_out','unresolved')),
  claim_basis text not null default 'author_assignment' check (claim_basis in ('author_assignment','experimentally_supported','computationally_supported','author_inference','atlas_interpretation','unresolved')),
  assignment_text text not null default '',
  evidence_id bigint not null references atlas_internal.cuhalide_photophysics_evidence_v1(evidence_id) on delete restrict,
  evidence_confidence text not null default 'Unresolved' check (evidence_confidence in ('High','Medium','Low','Unresolved')),
  mapping_confidence text not null default 'Unresolved' check (mapping_confidence in ('High','Medium','Low','Unresolved')),
  analysis_eligible boolean not null default false,
  qc_status text not null default 'pending' check (qc_status in ('pending','passed','failed','unresolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1 is 'Private controlled vocabulary for source-resolved photophysical mechanism claims. Mechanism labels are not inferred from spectra without an explicit claim basis.';
comment on table atlas_internal.cuhalide_photophysics_mechanism_v1 is 'Private typed mechanism registry at measurement/band grain. Supports positive, consistent-with, ruled-out and unresolved claims while preserving author-vs-curator claim basis and direct evidence linkage.';

create index if not exists idx_photo_mechanism_record on atlas_internal.cuhalide_photophysics_mechanism_v1(record_id, mechanism_code);
create index if not exists idx_photo_mechanism_measurement on atlas_internal.cuhalide_photophysics_mechanism_v1(measurement_id);
create index if not exists idx_photo_mechanism_band on atlas_internal.cuhalide_photophysics_mechanism_v1(band_id) where band_id is not null;
create index if not exists idx_photo_mechanism_evidence on atlas_internal.cuhalide_photophysics_mechanism_v1(evidence_id);
create index if not exists idx_photo_mechanism_analysis on atlas_internal.cuhalide_photophysics_mechanism_v1(mechanism_code, analysis_eligible) where analysis_eligible;

alter table atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1 enable row level security;
alter table atlas_internal.cuhalide_photophysics_mechanism_v1 enable row level security;
revoke all on atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1 from public, anon, authenticated;
revoke all on atlas_internal.cuhalide_photophysics_mechanism_v1 from public, anon, authenticated;
grant select, insert, update, delete on atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1 to service_role;
grant select, insert, update, delete on atlas_internal.cuhalide_photophysics_mechanism_v1 to service_role;
grant usage, select on all sequences in schema atlas_internal to service_role;

alter function atlas_internal.cuhalide_photophysics_staging_health_v1() rename to cuhalide_photophysics_staging_health_core_v1;

create or replace function atlas_internal.cuhalide_photophysics_staging_health_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public, atlas_internal
as $function$
declare
  core jsonb;
  mechanism_checks jsonb;
  mechanism_ok boolean;
  mechanism_count integer;
begin
  core := atlas_internal.cuhalide_photophysics_staging_health_core_v1();

  select jsonb_build_object(
    'mechanism_sample_orphans', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 x left join atlas_internal.cuhalide_photophysics_sample_state_v1 s using(sample_id) where s.sample_id is null),
    'mechanism_measurement_orphans', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 x left join atlas_internal.cuhalide_photophysics_measurement_v1 m using(measurement_id) where m.measurement_id is null),
    'mechanism_band_mismatch', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 x join atlas_internal.cuhalide_photophysics_band_v1 b using(band_id) where x.band_id is not null and b.measurement_id<>x.measurement_id),
    'mechanism_evidence_orphans', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 x left join atlas_internal.cuhalide_photophysics_evidence_v1 e using(evidence_id) where e.evidence_id is null),
    'mechanism_evidence_mismatch', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 x join atlas_internal.cuhalide_photophysics_evidence_v1 e using(evidence_id) where e.record_id<>x.record_id or e.measurement_id is distinct from x.measurement_id or (e.sample_id is not null and e.sample_id<>x.sample_id)),
    'inactive_mechanism_codes', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 x join atlas_internal.cuhalide_photophysics_mechanism_dictionary_v1 d using(mechanism_code) where not d.active),
    'pending_mechanism_qc', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 where qc_status='pending'),
    'analysis_eligible_unresolved_mechanisms', (select count(*) from atlas_internal.cuhalide_photophysics_mechanism_v1 where analysis_eligible and (qc_status<>'passed' or claim_polarity='unresolved' or evidence_confidence<>'High' or mapping_confidence<>'High'))
  ) into mechanism_checks;

  select bool_and(value::int=0) into mechanism_ok from jsonb_each_text(mechanism_checks);
  select count(*) into mechanism_count from atlas_internal.cuhalide_photophysics_mechanism_v1;

  return jsonb_set(
    jsonb_set(
      core,
      '{ok}',
      to_jsonb(coalesce((core->>'ok')::boolean,false) and coalesce(mechanism_ok,false)),
      true
    ),
    '{mechanism}',
    jsonb_build_object('count',mechanism_count,'ok',coalesce(mechanism_ok,false),'checks',mechanism_checks),
    true
  );
end;
$function$;

revoke all on function atlas_internal.cuhalide_photophysics_staging_health_core_v1() from public, anon, authenticated;
revoke all on function atlas_internal.cuhalide_photophysics_staging_health_v1() from public, anon, authenticated;
grant execute on function atlas_internal.cuhalide_photophysics_staging_health_core_v1() to service_role;
grant execute on function atlas_internal.cuhalide_photophysics_staging_health_v1() to service_role;