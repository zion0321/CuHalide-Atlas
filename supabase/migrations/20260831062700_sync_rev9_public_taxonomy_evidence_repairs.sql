-- Public-safe mirror of production migration 20260831062700.
-- Synchronizes only the explicitly adjudicated rev.9 motif/geometry repairs from
-- the internal authority into the public taxonomy projection. No new scientific
-- inference is performed in this migration.

do $$
declare
  n integer;
  r record;
begin
  update public.cuhalide_atlas_structure_taxonomy p
  set motif_formula=i.motif_formula,
      motif_geometry=i.motif_geometry,
      motif_basis=i.motif_basis,
      normalization_confidence=i.normalization_confidence,
      normalization_note=i.normalization_note,
      qc_status=i.qc_status,
      live_revision=i.live_revision,
      updated_at=i.updated_at
  from atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1 i
  where p.structure_id=i.structure_id
    and i.structure_id in (
      'CUH-227-S01','CUH-227-S02','CUH-227-S03','CUH-227-S04','CUH-227-S05',
      'CUH-068-S02','CUH-215-S01','CUH-215-S02','CUH-215-S03','CUH-215-S04',
      'CUH-307-S01','CUH-307-S02','CUH-307-S03','CUH-181-S01','CUH-337-S03','CUH-184-S02',
      'CUH-321-S01','CUH-321-S02','CUH-321-S03','CUH-052-S01','CUH-052-S02',
      'CUH-160-S01','CUH-160-S02','CUH-160-S03','CUH-160-S04','CUH-160-S05',
      'CUH-183-S01','CUH-323-S01','CUH-323-S02'
    );
  get diagnostics n=row_count;
  if n<>29 then raise exception 'Expected 29 public taxonomy rows synchronized, got %',n; end if;

  select count(*) as taxonomy_rows,
         count(*) filter (where motif_formula<>'Unresolved') as resolved,
         count(*) filter (where motif_formula='Unresolved') as unresolved,
         count(*) filter (where motif_geometry<>'Unresolved') as geometry_resolved
  into r
  from public.cuhalide_atlas_structure_taxonomy
  where qc_status='passed';

  if r.taxonomy_rows<>947 or r.resolved<>655 or r.unresolved<>292 or r.geometry_resolved<>206 then
    raise exception 'Unexpected public taxonomy state: rows %, resolved %, unresolved %, geometry %',r.taxonomy_rows,r.resolved,r.unresolved,r.geometry_resolved;
  end if;

  if exists (
    select 1
    from public.cuhalide_atlas_structure_taxonomy p
    join atlas_internal.cuhalide_structure_taxonomy_r9_candidate_v1 i using(structure_id)
    where p.structure_id in (
      'CUH-227-S01','CUH-227-S02','CUH-227-S03','CUH-227-S04','CUH-227-S05','CUH-068-S02',
      'CUH-215-S01','CUH-215-S02','CUH-215-S03','CUH-215-S04','CUH-307-S01','CUH-307-S02','CUH-307-S03',
      'CUH-181-S01','CUH-337-S03','CUH-184-S02','CUH-321-S01','CUH-321-S02','CUH-321-S03',
      'CUH-052-S01','CUH-052-S02','CUH-160-S01','CUH-160-S02','CUH-160-S03','CUH-160-S04','CUH-160-S05',
      'CUH-183-S01','CUH-323-S01','CUH-323-S02'
    )
    and (p.motif_formula,p.motif_geometry,p.motif_basis,p.normalization_confidence,p.qc_status)
        is distinct from
        (i.motif_formula,i.motif_geometry,i.motif_basis,i.normalization_confidence,i.qc_status)
  ) then
    raise exception 'Public taxonomy evidence repair differs from rev.9 authority';
  end if;
end $$;
