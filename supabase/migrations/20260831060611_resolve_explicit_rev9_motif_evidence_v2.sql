-- Public-safe mirror of production migration 20260831060611.
-- Resolves only Cu-X motifs explicitly defined by primary-source titles/abstracts/member mappings.
-- No motif is inferred from empirical formula alone.

do $$
declare
  n integer;
begin
  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu4I6', motif_geometry='discrete Cu4I6 cluster',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | article-defined {Cu4I6} cluster family; member-specific structure rows/CCDC mappings retained',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: Cu4I6 is explicitly identified by the primary article as the cluster core for this member series. This is a source-defined local motif, not a formula-derived inference.',
      qc_status='passed', updated_at=now()
  where structure_id in ('CUH-227-S01','CUH-227-S02','CUH-227-S03','CUH-227-S04','CUH-227-S05') and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 5 then raise exception 'Expected 5 Record 227 motif repairs, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu4I8', motif_geometry='discrete gamma-[Cu4I8]4- cluster',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | gamma-[Cu4I8]4- explicitly named for the structure member',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: the member is explicitly identified as gamma-[Cu4I8]4- in the primary source; no formula-only inference is used.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-068-S02' and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-068-S02 motif repair, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu2I3', motif_geometry='1D {Cu2I3} infinity chain (source-defined repeat composition)',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | {Cu2I3-} infinity chain explicitly defined; repeat composition, not finite-cluster inference',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: Cu2I3 is the primary-source-defined inorganic chain repeat for each temperature-resolved determination. It is not represented as an isolated finite cluster.',
      qc_status='passed', updated_at=now()
  where structure_id in ('CUH-215-S01','CUH-215-S02','CUH-215-S03','CUH-215-S04') and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 4 then raise exception 'Expected 4 Record 215 motif repairs, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu10Cl10', motif_geometry='decanuclear Cu10Cl10 cluster core composed of two stairlike Cu5Cl5 fragments',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary abstract explicitly describes the Cu10Cl10 cluster core',
      normalization_confidence='High', normalization_note='Rev.9 evidence repair: exact cluster nuclearity and core description are explicitly stated in the primary abstract.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-307-S01' and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-307-S01 motif repair, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu4Br4', motif_geometry='stairlike Cu4Br4 cluster core',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary abstract explicitly describes the stairlike Cu4X4 cluster core',
      normalization_confidence='High', normalization_note='Rev.9 evidence repair: the Br member is explicitly identified as a tetranuclear stairlike Cu4Br4 cluster core.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-307-S02' and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-307-S02 motif repair, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='stairlike Cu4I4 cluster core',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary abstract explicitly describes the stairlike Cu4X4 cluster core',
      normalization_note='Rev.9 evidence repair: the I member is explicitly identified as a tetranuclear stairlike Cu4I4 cluster core.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-307-S03' and motif_formula='Cu4I4';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-307-S03 geometry repair, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu4Br6', motif_geometry='discrete [Cu4Br6]2- cluster',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | discrete [Cu4Br6]2- cluster explicitly identified in the source structure description',
      normalization_confidence='High', normalization_note='Rev.9 evidence repair: Cu4Br6 cluster identity is explicitly source-defined and is not inferred from empirical formula alone.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-181-S01' and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-181-S01 motif repair, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu2I6', motif_geometry='discrete dinuclear [Cu2I6]4- anion',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary source explicitly identifies a dinuclear [Cu2I6]4- anion',
      normalization_confidence='High', normalization_note='Rev.9 evidence repair: Cu2I6 and its dinuclear discrete-anion character are explicitly source-defined.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-337-S03' and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-337-S03 motif repair, got %', n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_formula='Cu2Cl2', motif_geometry='Cu-Cl/pyrazine-bridged 1D polymeric repeat',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | [Cu2Cl2(pyrazine)]n explicitly assigned to this member',
      normalization_confidence='High', normalization_note='Rev.9 evidence repair: Cu2Cl2 is the explicitly reported polymeric repeat for the chloride member; it is not represented as an isolated molecular dimer.',
      qc_status='passed', updated_at=now()
  where structure_id='CUH-184-S02' and motif_formula='Unresolved';
  get diagnostics n = row_count; if n <> 1 then raise exception 'Expected 1 CUH-184-S02 motif repair, got %', n; end if;
end $$;
