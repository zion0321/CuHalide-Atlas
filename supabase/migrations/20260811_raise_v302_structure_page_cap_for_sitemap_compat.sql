-- Release 3.0.2 operational compatibility hotfix.
--
-- The public structure-query RPC remains bounded and query-and-view only.
-- This raises its maximum page size from 40 to 50 so the release sitemap can
-- enumerate all 816 Core-Included structure routes within its existing bounded
-- pagination safety window. Scientific data, filters, ordering, projections,
-- release denominators, and evidence-grain semantics are unchanged.

create or replace function public.cuhalide_atlas_public_structures_query_v302(
  p_q text default ''::text,
  p_page integer default 1,
  p_page_size integer default 30,
  p_halogen text default null::text,
  p_dimension text default null::text,
  p_space_group text default null::text,
  p_confidence text default null::text,
  p_polar text default null::text,
  p_inclusion text default null::text,
  p_eligibility text default null::text,
  p_record_id integer default null::integer,
  p_strict_polar boolean default false
)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  v_total integer;
  v_size integer := greatest(1,least(coalesce(p_page_size,30),50));
  v_pages integer;
  v_page integer;
  v_items jsonb;
begin
  with f as (
    select * from public.cuhalide_atlas_public_structures_v302 s where
      (p_record_id is null or s.record_id=p_record_id)
      and (p_halogen is null or p_halogen='' or s.halogen_effective=p_halogen)
      and (p_dimension is null or p_dimension='' or s.dimension_class=p_dimension)
      and (p_space_group is null or p_space_group='' or s.space_group=p_space_group)
      and (p_confidence is null or p_confidence='' or s.sg_confidence=p_confidence)
      and (p_polar is null or p_polar='' or s.polar=p_polar)
      and (p_inclusion is null or p_inclusion='' or s.inclusion_status=p_inclusion)
      and (p_eligibility is null or p_eligibility='' or s.eligibility=p_eligibility)
      and (not p_strict_polar or (s.eligibility='Core - Included' and s.polar='Yes' and s.sg_confidence='High' and s.mapping_confidence='High' and s.inclusion_status='Included'))
      and (coalesce(trim(p_q),'')='' or case
        when lower(trim(p_q)) in ('cl','br','i') then lower(trim(p_q))=any(regexp_split_to_array(lower(s.halogen_effective),'[^a-z]+'))
        when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then lower(trim(p_q))=any(regexp_split_to_array(lower(s.search_safe),'[^a-z0-9]+'))
        else s.search_safe ilike '%'||trim(p_q)||'%' end)
  ) select count(*) into v_total from f;

  v_pages:=greatest(1,ceil(v_total::numeric/v_size)::integer);
  v_page:=least(greatest(1,coalesce(p_page,1)),v_pages);

  with f as (
    select * from public.cuhalide_atlas_public_structures_v302 s where
      (p_record_id is null or s.record_id=p_record_id)
      and (p_halogen is null or p_halogen='' or s.halogen_effective=p_halogen)
      and (p_dimension is null or p_dimension='' or s.dimension_class=p_dimension)
      and (p_space_group is null or p_space_group='' or s.space_group=p_space_group)
      and (p_confidence is null or p_confidence='' or s.sg_confidence=p_confidence)
      and (p_polar is null or p_polar='' or s.polar=p_polar)
      and (p_inclusion is null or p_inclusion='' or s.inclusion_status=p_inclusion)
      and (p_eligibility is null or p_eligibility='' or s.eligibility=p_eligibility)
      and (not p_strict_polar or (s.eligibility='Core - Included' and s.polar='Yes' and s.sg_confidence='High' and s.mapping_confidence='High' and s.inclusion_status='Included'))
      and (coalesce(trim(p_q),'')='' or case
        when lower(trim(p_q)) in ('cl','br','i') then lower(trim(p_q))=any(regexp_split_to_array(lower(s.halogen_effective),'[^a-z]+'))
        when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then lower(trim(p_q))=any(regexp_split_to_array(lower(s.search_safe),'[^a-z0-9]+'))
        else s.search_safe ilike '%'||trim(p_q)||'%' end)
    order by s.year desc nulls last, s.structure_id asc
    offset (v_page-1)*v_size limit v_size
  ) select coalesce(jsonb_agg(to_jsonb(f)),'[]'::jsonb) into v_items from f;

  return jsonb_build_object(
    'items',v_items,
    'pagination',jsonb_build_object(
      'page',v_page,
      'page_size',v_size,
      'total',v_total,
      'total_pages',v_pages,
      'has_next',v_page<v_pages,
      'has_previous',v_page>1
    )
  );
end;
$function$;

comment on function public.cuhalide_atlas_public_structures_query_v302(text,integer,integer,text,text,text,text,text,text,text,integer,boolean)
is 'Release 3.0.2 public structure query. Page size is capped at 50 to preserve bounded query-and-view access while remaining compatible with the release sitemap crawler.';
