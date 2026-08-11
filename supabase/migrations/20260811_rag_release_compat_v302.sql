-- Release-aware RAG support introduced for frozen scientific release 3.0.2.
-- The 3.0.2 RAG index is a physical release-specific index. All article docs and
-- all unchanged structure docs are content-hash equivalent to 3.0.1; only the
-- four corrected Record 13 structure docs differ and were re-embedded.

create or replace function public.cuhalide_atlas_update_rag_embeddings_v2(
  p_release_version text,
  p_items jsonb,
  p_model text
) returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  item jsonb;
  updated_count integer := 0;
  item_id bigint;
begin
  if p_release_version is null or btrim(p_release_version) = '' then
    raise exception 'p_release_version is required';
  end if;
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array';
  end if;
  for item in select value from jsonb_array_elements(p_items)
  loop
    item_id := (item->>'id')::bigint;
    update public.cuhalide_atlas_rag_documents
       set embedding = (item->'embedding')::text::extensions.vector(1024),
           embedding_model = p_model,
           indexed_at = now(),
           updated_at = now()
     where id = item_id
       and release_version = p_release_version;
    if found then updated_count := updated_count + 1; end if;
  end loop;
  return updated_count;
end;
$$;
revoke all on function public.cuhalide_atlas_update_rag_embeddings_v2(text,jsonb,text) from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_update_rag_embeddings_v2(text,jsonb,text) to service_role;

create or replace function public.cuhalide_atlas_rag_release_compat_health_v302()
returns jsonb
language sql
security definer
set search_path = public, extensions
as $$
with
v302 as (
  select * from public.cuhalide_atlas_rag_documents where release_version='3.0.2'
),
article_cmp as (
  select count(*) filter (where a.content_sha256 is distinct from b.content_sha256) as mismatches
  from public.cuhalide_atlas_rag_documents a
  join public.cuhalide_atlas_rag_documents b using (document_key)
  where a.release_version='3.0.1' and b.release_version='3.0.2' and a.document_type='article'
),
structure_cmp as (
  select
    count(*) filter (where a.structure_id not in ('CUH-013-S01','CUH-013-S02','CUH-013-S03','CUH-013-S04') and a.content_sha256 is distinct from b.content_sha256) as unchanged_mismatches,
    count(*) filter (where a.structure_id in ('CUH-013-S01','CUH-013-S02','CUH-013-S03','CUH-013-S04') and a.content_sha256 is distinct from b.content_sha256) as record13_changed
  from public.cuhalide_atlas_rag_documents a
  join public.cuhalide_atlas_rag_documents b using (document_key)
  where a.release_version='3.0.1' and b.release_version='3.0.2' and a.document_type='structure'
),
record13 as (
  select
    count(*) as n,
    count(*) filter (where embedding is not null) as embedded,
    count(*) filter (where coalesce((metadata->>'known_erratum')::boolean,false)=false) as no_current_erratum,
    count(*) filter (where not (llm_context ? 'erratum_note')) as no_erratum_note,
    count(*) filter (where
      (structure_id='CUH-013-S01' and llm_context->>'dimension'='Unresolved') or
      (structure_id in ('CUH-013-S02','CUH-013-S03','CUH-013-S04') and llm_context->>'dimension'='0D')
    ) as correct_dimension
  from v302
  where structure_id in ('CUH-013-S01','CUH-013-S02','CUH-013-S03','CUH-013-S04')
),
structure_safety as (
  select
    count(*) filter (where llm_context ?| array['motif','emission_nm','emission_assignment','article_title']) as forbidden_context_keys,
    count(*) filter (where content ~* E'(^|\\n)(Article:|Structural motif:|Emission:|Emission assignment)') as explicit_leak_fields
  from v302 where document_type='structure'
),
counts as (
  select
    count(*) as documents,
    count(*) filter (where embedding is not null) as embedded,
    count(*) filter (where document_type='article') as articles,
    count(*) filter (where document_type='structure') as structures
  from v302
)
select jsonb_build_object(
  'ok', c.documents=1224 and c.embedded=1224 and c.articles=346 and c.structures=878
        and ac.mismatches=0 and sc.unchanged_mismatches=0 and sc.record13_changed=4
        and r.n=4 and r.embedded=4 and r.no_current_erratum=4 and r.no_erratum_note=4 and r.correct_dimension=4
        and ss.forbidden_context_keys=0 and ss.explicit_leak_fields=0,
  'release','3.0.2',
  'counts',jsonb_build_object('documents',c.documents,'embedded',c.embedded,'articles',c.articles,'structures',c.structures),
  'compatibility',jsonb_build_object('article_hash_mismatches',ac.mismatches,'unchanged_structure_hash_mismatches',sc.unchanged_mismatches,'record13_changed_structure_docs',sc.record13_changed),
  'record13',jsonb_build_object('rows',r.n,'embedded',r.embedded,'no_current_erratum',r.no_current_erratum,'no_erratum_note',r.no_erratum_note,'correct_dimension',r.correct_dimension),
  'structure_safety',jsonb_build_object('forbidden_context_keys',ss.forbidden_context_keys,'explicit_leak_fields',ss.explicit_leak_fields)
)
from counts c cross join article_cmp ac cross join structure_cmp sc cross join record13 r cross join structure_safety ss;
$$;
revoke all on function public.cuhalide_atlas_rag_release_compat_health_v302() from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_rag_release_compat_health_v302() to service_role;
