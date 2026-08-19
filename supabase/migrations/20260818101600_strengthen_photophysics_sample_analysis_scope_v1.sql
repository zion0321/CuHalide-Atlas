alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  add column if not exists structure_property_scope text not null default 'unresolved',
  add column if not exists intrinsic_structure_property_eligible boolean not null default false,
  add column if not exists within_article_state_comparison_eligible boolean not null default false;

alter table atlas_internal.cuhalide_photophysics_sample_state_v1
  add constraint photophysics_structure_property_scope_check
  check (structure_property_scope in ('intrinsic_bulk','processed_same_phase','modified_same_phase','composite','amorphous_derivative','device','article_level','unresolved'));

comment on column atlas_internal.cuhalide_photophysics_sample_state_v1.structure_property_scope is 'Analysis scope separating intrinsic crystalline/bulk properties from processed, chemically modified, composite, amorphous and device states.';
comment on column atlas_internal.cuhalide_photophysics_sample_state_v1.intrinsic_structure_property_eligible is 'True only when the datum can participate in direct crystallographic structure-property correlation without a processing/additive/composite/device confounder.';
comment on column atlas_internal.cuhalide_photophysics_sample_state_v1.within_article_state_comparison_eligible is 'Allows controlled paired comparisons (e.g. control vs additive film; crystal vs glass) without treating those states as intrinsic structure-property observations.';

create table if not exists atlas_internal.cuhalide_photophysics_property_dictionary_v1 (
  property_key text primary key,
  domain text not null,
  canonical_unit text not null default '',
  definition text not null,
  structure_property_default boolean not null default false,
  condition_sensitive boolean not null default true,
  allow_text_value boolean not null default false,
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table atlas_internal.cuhalide_photophysics_property_dictionary_v1 enable row level security;
revoke all on atlas_internal.cuhalide_photophysics_property_dictionary_v1 from anon, authenticated;
grant all on atlas_internal.cuhalide_photophysics_property_dictionary_v1 to service_role;

insert into atlas_internal.cuhalide_photophysics_property_dictionary_v1
(property_key,domain,canonical_unit,definition,structure_property_default,condition_sensitive,allow_text_value,notes)
values
('plqy','photoluminescence','%','Photoluminescence quantum yield under the stated sample state and measurement conditions.',true,true,false,'Absolute/relative method must be retained when source provides it.'),
('average_lifetime','dynamics','us','Source-reported or explicitly derived average emission lifetime; definition is mandatory when ambiguous.',true,true,false,'Do not silently normalize distinct averaging conventions.'),
('tau_s1','dynamics','ns','Lifetime parameter assigned to an S1 state by the source/model.',true,true,false,''),
('tau_t1','dynamics','us','Lifetime parameter assigned to a T1 state by the source/model.',true,true,false,''),
('delta_est','excited_state','eV','Singlet-triplet energy gap DeltaE_ST.',true,true,false,''),
('stokes_shift','spectral','nm','Stokes shift with an explicit reference basis (absorption max, excitation max, edge, or author-reported basis).',true,true,false,'Never calculate from excitation wavelength unless that is the defined reference.'),
('g_lum','chiroptical','','Signed luminescence dissymmetry factor.',true,true,false,'Retain sign and wavelength.'),
('light_yield','scintillation','photons MeV-1','Scintillation/radioluminescence light yield with reference/calibration basis.',true,true,false,'Relative and absolute methods are not interchangeable.'),
('xray_lod','scintillation','nGy s-1','X-ray detection limit; air-kerma notation and calculation criterion should be preserved.',false,true,false,''),
('linear_dose_response_range','scintillation','','Dose-rate interval over which response is reported as linear.',false,true,true,'Store lower/upper bounds and original unit.'),
('scintillation_decay_time','scintillation','us','Decay time under ionizing-radiation excitation.',true,true,false,'Keep separate from optical PL lifetime.'),
('spatial_resolution','imaging','lp mm-1','X-ray imaging spatial resolution with evaluation method/MTF threshold.',false,true,false,''),
('peak_eqe','device','%','Peak external quantum efficiency of a device.',false,true,false,''),
('max_luminance','device','cd m-2','Maximum device luminance.',false,true,false,''),
('t50','device','h','Operational half-lifetime with initial-luminance or extrapolation basis.',false,true,false,''),
('radiative_rate','dynamics','s-1','Radiative recombination rate as reported/derived.',true,true,false,'Requires formula/definition and consistency audit.'),
('nonradiative_rate','dynamics','s-1','Non-radiative recombination rate as reported/derived.',true,true,false,'Requires formula/definition and consistency audit.'),
('tadf_fraction','mechanism','%','Source-assigned fraction of emission attributed to TADF.',false,true,false,''),
('phosphorescence_fraction','mechanism','%','Source-assigned fraction of emission attributed to phosphorescence.',false,true,false,''),
('effective_density_for_attenuation','scintillation','g cm-3','Sample bulk/effective density used in attenuation calculation; not crystallographic density unless explicitly identical.',false,true,false,''),
('xray_attenuation_efficiency','scintillation','%','X-ray attenuation efficiency at stated photon energy and thickness.',false,true,false,'Energy and thickness are mandatory context for comparison.')
on conflict (property_key) do update set
 domain=excluded.domain, canonical_unit=excluded.canonical_unit, definition=excluded.definition,
 structure_property_default=excluded.structure_property_default, condition_sensitive=excluded.condition_sensitive,
 allow_text_value=excluded.allow_text_value, notes=excluded.notes, active=true;