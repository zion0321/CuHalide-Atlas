-- Production migration 20260831070622.
-- Refresh only RAG documents whose public scientific fields drifted after source-explicit rev.9 repairs.
-- The 42 affected documents were subsequently re-embedded with the existing BGE-M3 current-curated pipeline.
do $$
declare v_structures int; v_total int; v_null int;
begin
  with source_rows as (
    select ps.structure_id, ps.record_id, ps.year, ps.label, ps.formula, ps.phase,
           ps.halogen_effective, ps.dimensionality, ps.category, ps.space_group,
           ps.it_number, ps.point_group, ps.crystal_system, ps.polar,
           ps.sg_confidence, ps.mapping_confidence, ps.inclusion_status, ps.eligibility,
           ps.determination_method, ps.ccdc_cif, ps.evidence_level,
           ps.crystallographic_evidence_type, ps.last_verified, ps.doi, ps.doi_url,
           ps.cell_a, ps.cell_b, ps.cell_c, ps.cell_alpha, ps.cell_beta, ps.cell_gamma,
           ps.cell_volume, ps.z_value, ps.known_erratum, ps.erratum_key, ps.erratum_note,
           ps.coverage_class, ps.live_revision, ps.chemical_identity_status,
           t.motif_formula, t.motif_geometry, t.motif_basis
    from public.cuhalide_atlas_public_structures_current_v1 ps
    join public.cuhalide_atlas_structure_taxonomy t using(structure_id)
  ), mismatch as (
    select d.id,d.structure_id
    from public.cuhalide_atlas_rag_documents d
    join source_rows s using(structure_id)
    where d.release_version='current-curated-r9' and d.document_type='structure'
      and (
        (case when lower(coalesce(d.llm_context->>'dimension',d.metadata->>'dimension','')) in ('','unresolved','unknown','n/a','na') then '' else coalesce(d.llm_context->>'dimension',d.metadata->>'dimension','') end)
          is distinct from (case when lower(coalesce(s.dimensionality,'')) in ('','unresolved','unknown','n/a','na') then '' else s.dimensionality end)
        or (case when lower(coalesce(d.llm_context->>'space_group',d.metadata->>'space_group','')) in ('','unresolved','unknown','n/a','na') then '' else coalesce(d.llm_context->>'space_group',d.metadata->>'space_group','') end)
          is distinct from (case when lower(coalesce(s.space_group,'')) in ('','unresolved','unknown','n/a','na') then '' else s.space_group end)
        or (case when lower(coalesce(d.llm_context->>'point_group',d.metadata->>'point_group','')) in ('','unresolved','unknown','n/a','na') then '' else coalesce(d.llm_context->>'point_group',d.metadata->>'point_group','') end)
          is distinct from (case when lower(coalesce(s.point_group,'')) in ('','unresolved','unknown','n/a','na') then '' else s.point_group end)
        or (case when lower(coalesce(d.llm_context->>'polar',d.metadata->>'polar','')) in ('','unresolved','unknown','n/a','na') then '' else coalesce(d.llm_context->>'polar',d.metadata->>'polar','') end)
          is distinct from (case when lower(coalesce(s.polar,'')) in ('','unresolved','unknown','n/a','na') then '' else s.polar end)
        or (case when lower(coalesce(d.llm_context->>'motif_formula',d.metadata->>'motif_formula','')) in ('','unresolved','unknown','n/a','na') then '' else coalesce(d.llm_context->>'motif_formula',d.metadata->>'motif_formula','') end)
          is distinct from (case when lower(coalesce(s.motif_formula,'')) in ('','unresolved','unknown','n/a','na') then '' else s.motif_formula end)
        or (case when lower(coalesce(d.llm_context->>'motif_geometry',d.metadata->>'motif_geometry','')) in ('','unresolved','unknown','n/a','na') then '' else coalesce(d.llm_context->>'motif_geometry',d.metadata->>'motif_geometry','') end)
          is distinct from (case when lower(coalesce(s.motif_geometry,'')) in ('','unresolved','unknown','n/a','na') then '' else s.motif_geometry end)
      )
  ), built as (
    select d.id,
           concat_ws(E'\n',
             'Current Curated structure '||s.structure_id||': '||coalesce(nullif(s.label,''),s.structure_id),
             'Layer: Current Curated revision 9',
             'DOI: '||coalesce(nullif(s.doi,''),'Unresolved'),
             'Formula: '||coalesce(nullif(s.formula,''),'Unresolved'),
             case when nullif(s.phase,'') is not null then 'Phase / condition: '||s.phase end,
             'Halogen: '||coalesce(nullif(s.halogen_effective,''),'Unresolved'),
             'Dimensionality: '||coalesce(nullif(s.dimensionality,''),'Unresolved'),
             'Primary category: '||coalesce(nullif(s.category,''),'Unresolved'),
             'Motif formula: '||coalesce(nullif(s.motif_formula,''),'Unresolved'),
             'Motif geometry: '||coalesce(nullif(s.motif_geometry,''),'Unresolved'),
             'Motif evidence basis: '||coalesce(nullif(s.motif_basis,''),'Unresolved'),
             'Space group: '||coalesce(nullif(s.space_group,''),'Unresolved'),
             'IT number: '||coalesce(nullif(s.it_number,''),'Unresolved'),
             'Point group: '||coalesce(nullif(s.point_group,''),'Unresolved'),
             'Crystal system: '||coalesce(nullif(s.crystal_system,''),'Unresolved'),
             'Polar: '||coalesce(nullif(s.polar,''),'Unresolved'),
             'SG confidence: '||coalesce(nullif(s.sg_confidence,''),'Unresolved'),
             'Mapping confidence: '||coalesce(nullif(s.mapping_confidence,''),'Unresolved'),
             'Inclusion status: '||coalesce(nullif(s.inclusion_status,''),'Unresolved'),
             'Canonical eligibility: '||coalesce(nullif(s.eligibility,''),'Unresolved'),
             case when coalesce(s.cell_a,s.cell_b,s.cell_c,s.cell_alpha,s.cell_beta,s.cell_gamma,s.cell_volume,s.z_value,'')<>'' then
               'Cell: a='||coalesce(nullif(s.cell_a,''),'—')||'; b='||coalesce(nullif(s.cell_b,''),'—')||'; c='||coalesce(nullif(s.cell_c,''),'—')||'; alpha='||coalesce(nullif(s.cell_alpha,''),'—')||'; beta='||coalesce(nullif(s.cell_beta,''),'—')||'; gamma='||coalesce(nullif(s.cell_gamma,''),'—')||'; V='||coalesce(nullif(s.cell_volume,''),'—')||'; Z='||coalesce(nullif(s.z_value,''),'—') end,
             case when nullif(s.ccdc_cif,'') is not null then 'CCDC/CIF: '||s.ccdc_cif end,
             'Determination / evidence: '||coalesce(nullif(s.determination_method,''),'Unresolved')||'; '||coalesce(nullif(s.crystallographic_evidence_type,''),'Unresolved')||'; '||coalesce(nullif(s.evidence_level,''),'Unresolved'),
             'Chemical identity status: '||coalesce(nullif(s.chemical_identity_status,''),coalesce(d.llm_context->>'chemical_identity_status','Unresolved')),
             'Chemical identity key: '||coalesce(nullif(d.llm_context->>'chemical_identity_key',''),'Unresolved'),
             'Evidence boundary: structure-grain identity, crystallography, dimensionality and local motif are reported only where supported by member-specific evidence; missing fields remain explicitly bounded rather than inferred.'
           ) as new_content,
           d.llm_context || jsonb_build_object(
             'doi',coalesce(s.doi,''),'year',s.year,'phase',coalesce(s.phase,''),'polar',coalesce(s.polar,''),
             'title',coalesce(nullif(s.label,''),s.structure_id),'cell_a',coalesce(s.cell_a,''),'cell_b',coalesce(s.cell_b,''),'cell_c',coalesce(s.cell_c,''),
             'formula',coalesce(s.formula,''),'halogen',coalesce(s.halogen_effective,''),'z_value',coalesce(s.z_value,''),
             'category',coalesce(s.category,''),'ccdc_cif',coalesce(s.ccdc_cif,''),'cell_beta',coalesce(s.cell_beta,''),
             'dimension',coalesce(s.dimensionality,''),'it_number',coalesce(s.it_number,''),'record_id',s.record_id,
             'cell_alpha',coalesce(s.cell_alpha,''),'cell_gamma',coalesce(s.cell_gamma,''),'cell_volume',coalesce(s.cell_volume,''),
             'erratum_key',coalesce(s.erratum_key,''),'motif_basis',coalesce(s.motif_basis,''),'point_group',coalesce(s.point_group,''),
             'space_group',coalesce(s.space_group,''),'erratum_note',coalesce(s.erratum_note,''),'structure_id',s.structure_id,
             'known_erratum',coalesce(s.known_erratum,false),'live_revision',9,'motif_formula',coalesce(s.motif_formula,''),
             'sg_confidence',coalesce(s.sg_confidence,''),'coverage_class',coalesce(s.coverage_class,''),'crystal_system',coalesce(s.crystal_system,''),
             'curation_layer','Current Curated','motif_geometry',coalesce(s.motif_geometry,''),'inclusion_status',coalesce(s.inclusion_status,''),
             'mapping_confidence',coalesce(s.mapping_confidence,''),'determination_method',coalesce(s.determination_method,''),
             'canonical_eligibility',coalesce(s.eligibility,''),'chemical_identity_status',coalesce(nullif(s.chemical_identity_status,''),d.llm_context->>'chemical_identity_status'),
             'crystallographic_evidence_type',coalesce(s.crystallographic_evidence_type,'')
           ) as new_llm,
           d.metadata || jsonb_build_object(
             'polar',coalesce(s.polar,''),'halogen',coalesce(s.halogen_effective,''),'category',coalesce(s.category,''),
             'dimension',coalesce(s.dimensionality,''),'record_id',s.record_id,'point_group',coalesce(s.point_group,''),
             'space_group',coalesce(s.space_group,''),'structure_id',s.structure_id,'known_erratum',coalesce(s.known_erratum,false),
             'live_revision',9,'motif_formula',coalesce(s.motif_formula,''),'coverage_class',coalesce(s.coverage_class,''),
             'curation_layer','Current Curated','chemical_identity_status',coalesce(nullif(s.chemical_identity_status,''),d.metadata->>'chemical_identity_status'),
             'structure_science_projection','identity-crystallography-dimensionality-motif-only'
           ) as new_metadata,
           d.evidence || jsonb_build_object(
             'doi',coalesce(s.doi,''),'doi_url',coalesce(s.doi_url,''),'erratum_key',coalesce(s.erratum_key,''),
             'base_release','3.0.2','known_erratum',coalesce(s.known_erratum,false),'last_verified',coalesce(s.last_verified,''),
             'evidence_level',coalesce(s.evidence_level,''),'evidence_scope','structure-grain identity/crystallography/dimensionality/motif; no article-grain photophysics reassignment',
             'mapping_confidence',coalesce(s.mapping_confidence,''),'determination_method',coalesce(s.determination_method,''),
             'crystallographic_evidence_type',coalesce(s.crystallographic_evidence_type,'')
           ) as new_evidence
    from public.cuhalide_atlas_rag_documents d
    join mismatch m on m.id=d.id
    join source_rows s on s.structure_id=d.structure_id
  ), upd as (
    update public.cuhalide_atlas_rag_documents d
       set content=b.new_content,llm_context=b.new_llm,metadata=b.new_metadata,evidence=b.new_evidence,
           content_sha256=encode(digest(b.new_content,'sha256'),'hex'),embedding=null,indexed_at=null,updated_at=now()
      from built b where d.id=b.id returning d.id
  ) select count(*) into v_structures from upd;

  if v_structures <> 41 then raise exception 'expected 41 stale structure RAG docs, updated %',v_structures; end if;

  with a as (select * from public.cuhalide_atlas_public_articles_current_v1 where record_id=205),
       d as (select * from public.cuhalide_atlas_rag_documents where release_version='current-curated-r9' and document_key='article:205'),
       b as (
         select d.id,
           concat_ws(E'\n',
             'Current Curated article 205: '||a.title,'Layer: Current Curated revision 9','Coverage class: '||a.coverage_class,
             'DOI: '||a.doi,'Year: '||a.year,'Journal: '||a.journal,'Compounds/formulas: '||a.compounds,
             'Reported structure summary: '||a.structure_summary,'Article-level dimensionality: '||a.dimensionality,
             'Article-level category: '||a.category,'Halogen: '||a.halogen,
             case when nullif(a.space_groups,'') is not null then 'Space groups: '||a.space_groups end,
             coalesce(nullif(d.llm_context->>'photophysics_summary',''),'Structured Photophysics 1.4.0: independently verified no reportable target photophysical/scintillation data.'),
             'Photophysics publication stage: '||coalesce(nullif(d.llm_context->>'photophysics_stage',''),'verified_no_reported_data'),
             'Structure/article evidence level: '||a.evidence_level,'Scope status: '||a.scope_status,'Release status: '||a.release_status,
             'Evidence boundary: article-grain curated structure summary plus public Structured Photophysics 1.4.0 projection; no raw primary files, private evidence excerpts, or source locators are exposed in this retrieval document.'
           ) new_content,
           d.llm_context || jsonb_build_object('space_groups',coalesce(a.space_groups,''),'evidence_level',a.evidence_level,'release_status',a.release_status,'live_revision',9,'curation_layer','Current Curated') new_llm,
           d.metadata || jsonb_build_object('evidence_level',a.evidence_level,'release_status',a.release_status,'live_revision',9,'curation_layer','Current Curated') new_metadata,
           d.evidence || jsonb_build_object('last_verified',a.last_verified,'evidence_level',a.evidence_level) new_evidence
         from a,d
       )
  update public.cuhalide_atlas_rag_documents d
     set content=b.new_content,llm_context=b.new_llm,metadata=b.new_metadata,evidence=b.new_evidence,
         content_sha256=encode(digest(b.new_content,'sha256'),'hex'),embedding=null,indexed_at=null,updated_at=now()
    from b where d.id=b.id;

  select count(*) into v_total from public.cuhalide_atlas_rag_documents where release_version='current-curated-r9';
  select count(*) into v_null from public.cuhalide_atlas_rag_documents where release_version='current-curated-r9' and embedding is null;
  if v_total <> 1330 then raise exception 'RAG document total drifted: %',v_total; end if;
  if v_null <> 42 then raise exception 'expected exactly 42 documents queued for re-embedding, got %',v_null; end if;
end $$;
