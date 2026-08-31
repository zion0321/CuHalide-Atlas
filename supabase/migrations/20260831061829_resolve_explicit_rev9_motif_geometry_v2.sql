-- Public-safe mirror of production migration 20260831061829.
-- Resolves motif geometry only where primary-source wording/member identity is explicit.
-- Space group and other independent crystallographic fields are not inferred.

do $$
declare n integer;
begin
  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='bipyramidal Cu4I4 cluster',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article identifies the reported Cu4I4 members as bipyramids',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: the Cu4I4 bipyramidal geometry is explicitly source-defined for the DPPQ/CzDPPQ/PXZDPPQ member series; exact space group remains a separate evidence field.',
      qc_status='passed',updated_at=now()
  where structure_id in ('CUH-321-S01','CUH-321-S02','CUH-321-S03') and motif_formula='Cu4I4' and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>3 then raise exception 'Expected 3 Record 321 geometry repairs, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='cubane Cu4I4 molecular cluster',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | source-defined molecular Cu4I4 cubane cluster family',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: the source explicitly describes these designed molecular emitters as Cu4I4 cubane clusters.',
      qc_status='passed',updated_at=now()
  where structure_id in ('CUH-052-S01','CUH-052-S02') and motif_formula='Cu4I4' and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>2 then raise exception 'Expected 2 Record 52 geometry repairs, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='Cu4I4 cubane SBU in a 1D coordination polymer',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary article assigns compound 4 to the Cu4I4 cubane-node 1D family',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: local Cu4I4 cubane SBU and global 1D polymer connectivity are kept as separate properties.',
      qc_status='passed',updated_at=now()
  where structure_id in ('CUH-160-S01','CUH-160-S02','CUH-160-S03','CUH-160-S04','CUH-160-S05') and motif_formula='Cu4I4' and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>5 then raise exception 'Expected 5 Record 160 cubane geometry repairs, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='dimeric Cu2Br6 unit composed of two edge-shared tetrahedra',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | primary title explicitly defines two edge-shared tetrahedra',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: the Cu2Br6 dimer geometry is explicitly stated by the primary source.',
      qc_status='passed',updated_at=now()
  where structure_id='CUH-183-S01' and motif_formula='Cu2Br6' and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>1 then raise exception 'Expected 1 CUH-183-S01 geometry repair, got %',n; end if;

  update atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1
  set motif_geometry='discrete chiral binuclear Cu2I2 cluster',
      motif_basis='PRIMARY_SOURCE_EXPLICIT | member identity explicitly defines chiral binuclear Cu2I2 clusters',
      normalization_confidence='High',
      normalization_note='Rev.9 evidence repair: binuclear Cu2I2 cluster character is explicit for both enantiomeric members.',
      qc_status='passed',updated_at=now()
  where structure_id in ('CUH-323-S01','CUH-323-S02') and motif_formula='Cu2I2' and motif_geometry='Unresolved';
  get diagnostics n=row_count; if n<>2 then raise exception 'Expected 2 Record 323 geometry repairs, got %',n; end if;
end $$;
