-- Production migration 20260831064506.
-- Living Current Curated rev.9 only; Frozen Release 3.0.2 remains immutable.
do $$
declare n integer; r record;
begin
  update atlas_internal.cuhalide_public_articles_current_r9_candidate_v1
  set evidence_level='B — Main article only',release_status='Core - Verified',space_groups='P21/c; Pnma; Pnna',last_verified='2026-08-31',curated_at=now(),live_revision=9
  where record_id=205 and release_status='Pending - Primary Evidence Unavailable';
  get diagnostics n=row_count; if n<>1 then raise exception 'Expected one Record 205 article promotion, got %',n; end if;

  update atlas_internal.cuhalide_public_structures_current_r9_candidate_v1
  set dimensionality='1D',dimension_class='1D',
      space_group=case structure_id when 'CUH-205-S01' then 'P21/c' when 'CUH-205-S02' then 'Pnma' when 'CUH-205-S03' then 'Pnna' end,
      space_group_source_form=case structure_id when 'CUH-205-S01' then 'P 21/c' when 'CUH-205-S02' then 'Pnma' when 'CUH-205-S03' then 'Pnna' end,
      it_number=case structure_id when 'CUH-205-S01' then '14' when 'CUH-205-S02' then '62' when 'CUH-205-S03' then '52' end,
      point_group=case structure_id when 'CUH-205-S01' then '2/m' else 'mmm' end,
      crystal_system=case structure_id when 'CUH-205-S01' then 'Monoclinic' else 'Orthorhombic' end,
      polar='No',polar_basis='Centrosymmetric crystallographic point group derived from the primary-source space group.',sg_confidence='High',mapping_confidence='High',
      inclusion_status='Included',eligibility='Core - Included',determination_method='Primary article single-crystal X-ray diffraction; crystal data and structural tables directly verified 2026-08-31.',
      evidence_level='B — Main article only',crystallographic_evidence_type='Primary article crystal data and structure tables',last_verified='2026-08-31',live_revision=9,curated_at=now()
  where structure_id in ('CUH-205-S01','CUH-205-S02','CUH-205-S03');
  get diagnostics n=row_count; if n<>3 then raise exception 'Expected three Record 205 structure repairs, got %',n; end if;

  update atlas_internal.cuhalide_public_structures_current_r9_candidate_v1
  set search_safe=btrim(concat_ws(' ',nullif(structure_id,''),nullif(label,''),nullif(formula,''),nullif(phase,''),nullif(space_group,''),nullif(point_group,''),nullif(crystal_system,''),nullif(doi,''),nullif(ccdc_cif,'')))
  where structure_id in ('CUH-205-S01','CUH-205-S02','CUH-205-S03');

  insert into atlas_internal.cuhalide_organic_component_resolution_r9_candidate_v1
    (structure_id,component_key,display_name,role,prior_status,prior_reason,candidate_status,canonical_key,canonical_name,molecular_formula,formal_charge,resolution_basis,confidence,public_reason,source_reference,reviewed_at)
  values
    ('CUH-205-S01','methyltriphenylphosphonium','Methyltriphenylphosphonium','counter_cation','missing','record was previously outside Core-Included','terminal_unresolved',null,null,null,null,'Primary full text uniquely names methyltriphenylphosphonium, but a deterministic canonical graph has not been independently encoded and verified in the Atlas renderer registry.','High','Methyltriphenylphosphonium is explicitly reported; a 2D graph is withheld until its canonical renderer entry is independently verified.','10.1515/znb-1984-0206',now()),
    ('CUH-205-S02','n-methylpyridinium','N-methylpyridinium','counter_cation','missing','record was previously outside Core-Included','terminal_unresolved',null,null,null,null,'Primary full text uniquely names N-methylpyridinium; the structure identity is retained while graph-level publication remains independently gated.','High','N-methylpyridinium is explicitly reported; graph-level publication remains independently gated.','10.1515/znb-1984-0206',now()),
    ('CUH-205-S03','tetrapropylammonium','Tetrapropylammonium','counter_cation','missing','record was previously outside Core-Included','terminal_unresolved',null,null,null,null,'Primary full text uniquely names tetrapropylammonium; the structure identity is retained while graph-level publication remains independently gated.','High','Tetrapropylammonium is explicitly reported; graph-level publication remains independently gated.','10.1515/znb-1984-0206',now())
  on conflict (structure_id,component_key) do nothing;
  get diagnostics n=row_count; if n<>3 then raise exception 'Expected three Record 205 organic-component states, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu4I6',motif_geometry='1D Cu4I6 chain repeat (source-defined; not a finite cluster)',motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article defines a one-dimensional ionic Cu4I6 copper-iodine chain for the temperature-resolved member',normalization_confidence='High',normalization_note='Rev.9 evidence repair: Cu4I6 is retained as the source-defined chain repeat for this 1D member; no finite-cluster interpretation is imposed.',qc_status='passed',updated_at=now()
  where structure_id in ('CUH-127-S01','CUH-127-S02','CUH-127-S03') and motif_formula='Unresolved';
  get diagnostics n=row_count; if n<>3 then raise exception 'Expected three Record 127 motif repairs, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu3I7',motif_geometry='triangular tricopper Cu3I7 SBU linked by shared iodide into a 1D Cu3I6 chain',motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article describes triangular tricopper Cu3I7 SBUs linked through shared iodide to form the Cu3I6 chain',normalization_confidence='High',normalization_note='Rev.9 evidence repair: local SBU Cu3I7 is distinguished from the global chain repeat composition Cu3I6.',qc_status='passed',updated_at=now()
  where structure_id='CUH-150-S04' and motif_formula='Unresolved';
  get diagnostics n=row_count; if n<>1 then raise exception 'Expected one CUH-150-S04 motif repair, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='cubane Cu4X4 cluster family (X = Cl, Br, I)',motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article explicitly describes the Cu4X4 units as cubane clusters; aggregate halogen identity remains intentionally generic',normalization_confidence='High',normalization_note='Rev.9 evidence repair: cubane geometry is explicit, but the aggregate row is not forced to a single halogen-specific motif formula.',qc_status='passed',updated_at=now()
  where structure_id in ('CUH-202-S01','CUH-202-S02','CUH-202-S03') and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>3 then raise exception 'Expected three Record 202 geometry repairs, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula=case structure_id when 'CUH-205-S02' then 'Cu2I3' else 'Cu3I4' end,
      motif_geometry=case structure_id when 'CUH-205-S01' then '1D Cu3I4 iodocuprate chain built from linked CuI4 coordination units' when 'CUH-205-S02' then '1D Cu2I3 chain of edge-linked CuI4 tetrahedra' when 'CUH-205-S03' then '1D Cu3I4 chain: three face-sharing CuI4 tetrahedra form boat-shaped units that are edge-linked along the chain' end,
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary full text directly defines the isolated iodocuprate chain composition and tetrahedral linkage',normalization_confidence='High',normalization_note='Rev.9 evidence repair: primary full text and crystal-structure discussion verified directly on 2026-08-31.',qc_status='passed',updated_at=now()
  where structure_id in ('CUH-205-S01','CUH-205-S02','CUH-205-S03') and motif_formula='Unresolved';
  get diagnostics n=row_count; if n<>3 then raise exception 'Expected three Record 205 motif repairs, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu4Cl4',motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article identifies the chloride member as a tetranuclear Cu4Cl4 complex with a Cu4X4 core',normalization_confidence='High',normalization_note='Rev.9 evidence repair: Cu4Cl4 nuclearity/core identity is explicit; exact core geometry remains separately unresolved.',qc_status='passed',updated_at=now()
  where structure_id='CUH-263-S01' and motif_formula='Unresolved';
  get diagnostics n=row_count; if n<>1 then raise exception 'Expected one CUH-263-S01 motif repair, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='planar rhombic Cu2(mu-X)2 unit family (X = Br or I)',motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article defines planar rhombic Cu2(mu-X)2 units linked into coordination-polymer chains',normalization_confidence='High',normalization_note='Rev.9 evidence repair: local rhombic Cu2X2 geometry is explicit; the aggregate Br/I row is not forced to one halogen-specific motif formula.',qc_status='passed',updated_at=now()
  where structure_id='CUH-345-S01' and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>1 then raise exception 'Expected one CUH-345-S01 geometry repair, got %',n; end if;

  update public.cuhalide_atlas_structure_taxonomy p
  set motif_formula=i.motif_formula,motif_geometry=i.motif_geometry,motif_basis=i.motif_basis,normalization_confidence=i.normalization_confidence,normalization_note=i.normalization_note,qc_status=i.qc_status,live_revision=i.live_revision,updated_at=i.updated_at
  from atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1 i
  where p.structure_id=i.structure_id and i.structure_id in ('CUH-127-S01','CUH-127-S02','CUH-127-S03','CUH-150-S04','CUH-202-S01','CUH-202-S02','CUH-202-S03','CUH-205-S01','CUH-205-S02','CUH-205-S03','CUH-263-S01','CUH-345-S01');
  get diagnostics n=row_count; if n<>12 then raise exception 'Expected 12 final public taxonomy rows synchronized, got %',n; end if;

  update atlas_internal.cuhalide_r9_resolution_audit_v1 a
  set candidate_value=case when a.field_name='motif_formula' then t.motif_formula else t.motif_geometry end,resolution_status='resolved_primary',evidence_basis=t.motif_basis,confidence=t.normalization_confidence,reviewer_note='Superseded by source-explicit rev.9 evidence repair verified on 2026-08-31; current taxonomy authority controls.'
  from atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1 t
  where a.structure_id=t.structure_id and a.resolution_status='terminal_unresolved' and ((a.field_name='motif_formula' and t.motif_formula<>'Unresolved') or (a.field_name='motif_geometry' and t.motif_geometry<>'Unresolved'));

  insert into atlas_internal.cuhalide_r9_resolution_audit_v1(structure_id,record_id,field_name,prior_value,candidate_value,resolution_status,evidence_basis,source_reference,confidence,mapping_confidence,reviewer_note)
  select structure_id,205,field_name,prior_value,candidate_value,'resolved_primary',evidence_basis,'10.1515/znb-1984-0206','High','High','Primary full text directly verified 2026-08-31.'
  from (values
    ('CUH-205-S01','space_group','Unresolved','P21/c','Primary article crystal data explicitly report monoclinic P 21/c.'),
    ('CUH-205-S02','space_group','Unresolved','Pnma','Primary article crystal data explicitly report orthorhombic Pnma.'),
    ('CUH-205-S03','space_group','Unresolved','Pnna','Primary article crystal data explicitly report orthorhombic Pnna.'),
    ('CUH-205-S01','structural_dimensionality','Unresolved','1D','Primary article explicitly describes an isolated Cu3I4 iodocuprate chain.'),
    ('CUH-205-S03','structural_dimensionality','Unresolved','1D','Primary article explicitly describes an isolated Cu3I4 iodocuprate chain.')
  ) v(structure_id,field_name,prior_value,candidate_value,evidence_basis);

  select
    (select count(*) from public.cuhalide_atlas_public_articles_current_v1) article_audit,
    (select count(*) from public.cuhalide_atlas_public_articles_current_v1 where scope_status='Included') included,
    (select count(*) from public.cuhalide_atlas_public_articles_current_v1 where scope_status='Included' and release_status in('Core - Verified','Current Curated - Verified')) canonical,
    (select count(*) from public.cuhalide_atlas_public_structures_current_v1) structures,
    (select count(*) from public.cuhalide_atlas_public_structures_current_v1 where eligibility='Core - Included') core,
    (select count(*) from public.cuhalide_atlas_public_structures_current_v1 where nullif(trim(space_group),'') is not null) resolved_sg,
    (select count(*) from public.cuhalide_atlas_public_structures_current_v1 where eligibility='Core - Included' and nullif(trim(space_group),'') is not null) verified_sg,
    (select count(*) from public.cuhalide_atlas_structure_taxonomy where qc_status='passed' and motif_formula<>'Unresolved') motif_resolved,
    (select count(*) from public.cuhalide_atlas_structure_taxonomy where qc_status='passed' and motif_formula='Unresolved') motif_unresolved,
    (select count(*) from public.cuhalide_atlas_structure_taxonomy where qc_status='passed' and motif_geometry<>'Unresolved') geometry_resolved
  into r;

  if r.article_audit<>383 or r.included<>372 or r.canonical<>370 or r.structures<>947 or r.core<>890 or r.resolved_sg<>747 or r.verified_sg<>720 or r.motif_resolved<>663 or r.motif_unresolved<>284 or r.geometry_resolved<>217 then raise exception 'Unexpected final derived state: %',row_to_json(r); end if;

  update public.cuhalide_atlas_current_curated_state
  set canonical_verified_articles=r.canonical,core_included_structure_rows=r.core,resolved_space_group_rows=r.resolved_sg,verified_space_group_rows=r.verified_sg,last_qc_at=now(),updated_at=now(),note='Current Curated rev.9 ready: source-explicit evidence repairs through 2026-08-31 promote Record 205 from pending primary evidence, resolve additional crystallographic/motif fields, preserve terminal unknowns elsewhere, retain PH 1.4.0 / OC 1.2.0, and keep Frozen Release 3.0.2 immutable.'
  where state_key='current';

  if exists(select 1 from public.cuhalide_atlas_public_structures_current_v1 p join atlas_internal.cuhalide_public_structures_current_r9_candidate_v1 i using(structure_id) where p.record_id=205 and (p.dimensionality,p.space_group,p.point_group,p.crystal_system,p.polar,p.eligibility,p.evidence_level) is distinct from (i.dimensionality,i.space_group,i.point_group,i.crystal_system,i.polar,i.eligibility,i.evidence_level)) then raise exception 'Record 205 public/internal structure projection mismatch'; end if;
end $$;
