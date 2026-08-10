-- CuHalide Atlas release 3.0.1 public query projection
-- Runtime hardening only. This migration does not rewrite the immutable scientific snapshot.
-- It assumes the private release payload and errata tables already exist.

begin;

create table if not exists public.cuhalide_atlas_public_articles_v301 (
  record_id integer primary key,
  title text not null default '',
  authors text not null default '',
  journal text not null default '',
  year integer,
  doi text not null default '',
  doi_url text not null default '',
  halogen text not null default '',
  dimensionality text not null default '',
  dimension_class text not null default '',
  category text not null default '',
  evidence_level text not null default '',
  scope_status text not null default '',
  release_status text not null default '',
  structure_summary text not null default '',
  compounds text not null default '',
  space_groups text not null default '',
  emission_nm text not null default '',
  emission_assignment text not null default '',
  article_type text not null default '',
  volume text not null default '',
  issue text not null default '',
  pages text not null default '',
  ccdc_cif text not null default '',
  last_verified text not null default '',
  search_safe text not null default ''
);

create table if not exists public.cuhalide_atlas_public_structures_v301 (
  structure_id text primary key,
  record_id integer not null,
  year integer,
  label text not null default '',
  formula text not null default '',
  phase text not null default '',
  halogen_fallback text not null default '',
  halogen_effective text not null default '',
  dimensionality text not null default '',
  dimension_class text not null default '',
  category text not null default '',
  space_group text not null default '',
  space_group_source_form text not null default '',
  it_number text not null default '',
  point_group text not null default '',
  crystal_system text not null default '',
  polar text not null default '',
  polar_basis text not null default '',
  sg_confidence text not null default '',
  mapping_confidence text not null default '',
  inclusion_status text not null default '',
  eligibility text not null default '',
  determination_method text not null default '',
  ccdc_cif text not null default '',
  evidence_level text not null default '',
  crystallographic_evidence_type text not null default '',
  last_verified text not null default '',
  doi text not null default '',
  doi_url text not null default '',
  article_title text not null default '',
  cell_a text not null default '',
  cell_b text not null default '',
  cell_c text not null default '',
  cell_alpha text not null default '',
  cell_beta text not null default '',
  cell_gamma text not null default '',
  cell_volume text not null default '',
  z_value text not null default '',
  known_erratum boolean not null default false,
  erratum_key text not null default '',
  erratum_note text not null default '',
  search_safe text not null default ''
);

create or replace function public.cuhalide_formula_halogen_v1(p_formula text, p_fallback text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  f text := coalesce(p_formula, '');
  parts text[] := array[]::text[];
begin
  -- Remove oxidation-state notation before halide detection.
  f := regexp_replace(f, '(copper|cu)\s*\(\s*i\s*\)', 'Cu', 'gi');

  -- Accept explicit Cu-X stoichiometry and bridging-halide notation only.
  if f ~* 'Cu\s*[0-9]*\s*Cl\s*[0-9]*' or f ~* 'μ[0-9]*[-–—]?Cl([^A-Za-z]|$)' then
    parts := array_append(parts, 'Cl');
  end if;
  if f ~* 'Cu\s*[0-9]*\s*Br\s*[0-9]*' or f ~* 'μ[0-9]*[-–—]?Br([^A-Za-z]|$)' then
    parts := array_append(parts, 'Br');
  end if;
  if f ~* 'Cu\s*[0-9]*\s*I\s*[0-9]*' or f ~* 'μ[0-9]*[-–—]?I([^A-Za-z]|$)' then
    parts := array_append(parts, 'I');
  end if;

  if cardinality(parts) > 0 then
    return array_to_string(parts, '/');
  end if;
  return coalesce(nullif(trim(p_fallback), ''), 'Unresolved');
end;
$$;

create or replace function public.cuhalide_dimension_class_v1(p_value text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  s text := trim(coalesce(p_value, ''));
  n integer;
begin
  if s = '' then
    return 'Unresolved';
  end if;

  select count(distinct upper(m[2]))
  into n
  from regexp_matches(s, '(^|[^0-9])([0-3]D)([^0-9]|$)', 'gi') m;

  if n = 1 then
    if s ~* '(^|[^0-9])0D([^0-9]|$)' then return '0D'; end if;
    if s ~* '(^|[^0-9])1D([^0-9]|$)' then return '1D'; end if;
    if s ~* '(^|[^0-9])2D([^0-9]|$)' then return '2D'; end if;
    if s ~* '(^|[^0-9])3D([^0-9]|$)' then return '3D'; end if;
  elsif n > 1 then
    return 'Mixed / series-level';
  end if;

  if s ~* 'unresolved|not assigned|not reported|unknown|not determined|not available' then
    return 'Unresolved';
  end if;
  if s ~* 'low[- ]?dimensional' then
    return 'Low-dimensional (reported)';
  end if;
  if s ~* 'coordination polymer|framework|network|extended|chain|layered' then
    return 'Extended / reported';
  end if;
  return 'Unresolved / non-normalized';
end;
$$;

truncate public.cuhalide_atlas_public_articles_v301;
truncate public.cuhalide_atlas_public_structures_v301;

insert into public.cuhalide_atlas_public_articles_v301 (
  record_id, title, authors, journal, year, doi, doi_url, halogen,
  dimensionality, dimension_class, category, evidence_level, scope_status,
  release_status, structure_summary, compounds, space_groups, emission_nm,
  emission_assignment, article_type, volume, issue, pages, ccdc_cif,
  last_verified, search_safe
)
select
  (v->>'Record ID')::integer,
  coalesce(nullif(v->>'Title', ''), v->>'Article Title', ''),
  coalesce(v->>'Authors', ''),
  coalesce(v->>'Journal', ''),
  nullif(v->>'Year', '')::integer,
  coalesce(v->>'DOI', ''),
  coalesce(v->>'DOI URL', ''),
  coalesce(v->>'Halogen Type', ''),
  coalesce(v->>'Structural Dimensionality', ''),
  public.cuhalide_dimension_class_v1(coalesce(v->>'Structural Dimensionality', '')),
  coalesce(v->>'Category', ''),
  coalesce(v->>'Evidence Level', ''),
  coalesce(v->>'Scope Status', ''),
  coalesce(v->>'Canonical Release Status', ''),
  coalesce(v->>'Reported Structure', ''),
  coalesce(v->>'Reported Compound(s) / Formula(s)', ''),
  coalesce(v->>'Space Group(s)', ''),
  coalesce(v->>'Emission Wavelength(s) (nm)', ''),
  coalesce(v->>'Emission Assignment / Conditions', ''),
  coalesce(v->>'Article Type', ''),
  coalesce(v->>'Volume', ''),
  coalesce(v->>'Issue', ''),
  coalesce(v->>'Pages / Article Number', ''),
  coalesce(v->>'CCDC / CIF Information', ''),
  coalesce(v->>'Last Verified Date', ''),
  concat_ws(' ',
    coalesce(nullif(v->>'Title', ''), v->>'Article Title', ''),
    v->>'Authors', v->>'Journal', v->>'DOI',
    v->>'Reported Compound(s) / Formula(s)', v->>'Reported Structure',
    v->>'Space Group(s)', v->>'Emission Assignment / Conditions'
  )
from (
  select jsonb_array_elements(data::jsonb->'items') as v
  from public.cuhalide_atlas_payload_chunks
  where kind = 'web_norm_articles_v301'
    and release_version = '3.0.1'
    and chunk_index = 0
) q;

insert into public.cuhalide_atlas_public_structures_v301 (
  structure_id, record_id, year, label, formula, phase, halogen_fallback,
  halogen_effective, dimensionality, dimension_class, category, space_group,
  space_group_source_form, it_number, point_group, crystal_system, polar,
  polar_basis, sg_confidence, mapping_confidence, inclusion_status, eligibility,
  determination_method, ccdc_cif, evidence_level, crystallographic_evidence_type,
  last_verified, doi, doi_url, article_title, cell_a, cell_b, cell_c,
  cell_alpha, cell_beta, cell_gamma, cell_volume, z_value, known_erratum,
  erratum_key, erratum_note, search_safe
)
select
  v->>'Structure ID',
  (v->>'Record ID')::integer,
  nullif(v->>'Year', '')::integer,
  coalesce(v->>'Structure Label / Compound', ''),
  coalesce(v->>'Reported Formula', ''),
  coalesce(v->>'Phase / Polymorph / Temperature', ''),
  coalesce(v->>'Halogen', ''),
  public.cuhalide_formula_halogen_v1(
    coalesce(v->>'Reported Formula', ''),
    coalesce(v->>'Halogen', '')
  ),
  coalesce(e.corrected_value, v->>'Structural Dimensionality', ''),
  public.cuhalide_dimension_class_v1(
    coalesce(e.corrected_value, v->>'Structural Dimensionality', '')
  ),
  coalesce(v->>'Category', ''),
  coalesce(v->>'Space Group (Canonical)', ''),
  coalesce(v->>'Space Group (Source Form)', ''),
  coalesce(v->>'International Tables No.', ''),
  coalesce(v->>'Point Group', ''),
  coalesce(v->>'Crystal System', ''),
  coalesce(v->>'Polar Space Group?', ''),
  coalesce(v->>'Polar Classification Basis', ''),
  coalesce(v->>'Space-Group Evidence Confidence', ''),
  coalesce(v->>'Mapping Confidence', ''),
  coalesce(v->>'Structure Inclusion Status', ''),
  coalesce(v->>'Canonical Structure Dataset Eligibility', ''),
  coalesce(v->>'Space-Group Determination Method', ''),
  coalesce(v->>'CCDC / CIF ID', ''),
  coalesce(v->>'Evidence Level', ''),
  coalesce(v->>'Crystallographic Evidence Type', ''),
  coalesce(v->>'Last Verified Date', ''),
  coalesce(v->>'DOI', ''),
  coalesce(v->>'DOI URL', ''),
  coalesce(v->>'Article Title', ''),
  coalesce(v->>'Cell a (Å)', ''),
  coalesce(v->>'Cell b (Å)', ''),
  coalesce(v->>'Cell c (Å)', ''),
  coalesce(v->>'Cell α (°)', ''),
  coalesce(v->>'Cell β (°)', ''),
  coalesce(v->>'Cell γ (°)', ''),
  coalesce(v->>'Cell Volume (Å³)', ''),
  coalesce(v->>'Z', ''),
  (e.erratum_key is not null),
  coalesce(e.erratum_key, ''),
  case
    when e.erratum_key is null then ''
    else 'Release 3.0.1 immutable archive retains the published value '
      || quote_literal(e.published_value)
      || '. Effective display/query value is '
      || quote_literal(e.corrected_value)
      || '. Formal scientific hotfix planned for '
      || coalesce(e.planned_correction_release, 'a later release') || '.'
  end,
  concat_ws(' ',
    v->>'Structure ID', v->>'Structure Label / Compound', v->>'Reported Formula',
    v->>'Phase / Polymorph / Temperature', v->>'Space Group (Canonical)',
    v->>'Point Group', v->>'Crystal System', v->>'DOI', v->>'CCDC / CIF ID'
  )
from (
  select jsonb_array_elements(data::jsonb->'items') as v
  from public.cuhalide_atlas_payload_chunks
  where kind = 'web_norm_structures_v301'
    and release_version = '3.0.1'
    and chunk_index = 0
) q
left join public.cuhalide_atlas_release_errata e
  on e.release_version = '3.0.1'
 and e.display_overlay_enabled = true
 and e.field_name = 'Structural Dimensionality'
 and e.structure_id = v->>'Structure ID';

create index if not exists cuhalide_public_articles_release_idx
  on public.cuhalide_atlas_public_articles_v301(release_status);
create index if not exists cuhalide_public_articles_year_idx
  on public.cuhalide_atlas_public_articles_v301(year desc);
create index if not exists cuhalide_public_articles_halogen_idx
  on public.cuhalide_atlas_public_articles_v301(halogen);
create index if not exists cuhalide_public_articles_scope_idx
  on public.cuhalide_atlas_public_articles_v301(scope_status);
create index if not exists cuhalide_public_articles_dimension_class_idx
  on public.cuhalide_atlas_public_articles_v301(dimension_class);
create index if not exists cuhalide_public_articles_search_trgm_idx
  on public.cuhalide_atlas_public_articles_v301 using gin(search_safe gin_trgm_ops);

create index if not exists cuhalide_public_structures_record_idx
  on public.cuhalide_atlas_public_structures_v301(record_id);
create index if not exists cuhalide_public_structures_eligibility_idx
  on public.cuhalide_atlas_public_structures_v301(eligibility);
create index if not exists cuhalide_public_structures_space_group_idx
  on public.cuhalide_atlas_public_structures_v301(space_group);
create index if not exists cuhalide_public_structures_polar_idx
  on public.cuhalide_atlas_public_structures_v301(polar);
create index if not exists cuhalide_public_structures_confidence_idx
  on public.cuhalide_atlas_public_structures_v301(sg_confidence, mapping_confidence);
create index if not exists cuhalide_public_structures_halogen_effective_idx
  on public.cuhalide_atlas_public_structures_v301(halogen_effective);
create index if not exists cuhalide_public_structures_dimension_class_idx
  on public.cuhalide_atlas_public_structures_v301(dimension_class);
create index if not exists cuhalide_public_structures_search_trgm_idx
  on public.cuhalide_atlas_public_structures_v301 using gin(search_safe gin_trgm_ops);

create or replace function public.cuhalide_atlas_public_articles_query_v301(
  p_q text default '',
  p_page integer default 1,
  p_page_size integer default 18,
  p_year_from integer default null,
  p_year_to integer default null,
  p_halogen text default null,
  p_dimension text default null,
  p_category text default null,
  p_evidence text default null,
  p_scope text default null,
  p_release_status text default null,
  p_sort text default 'year_desc'
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_size integer := greatest(1, least(coalesce(p_page_size, 18), 24));
  v_pages integer;
  v_page integer;
  v_items jsonb;
begin
  with f as (
    select *
    from public.cuhalide_atlas_public_articles_v301 a
    where (p_year_from is null or a.year >= p_year_from)
      and (p_year_to is null or a.year <= p_year_to)
      and (p_halogen is null or p_halogen = '' or lower(a.halogen) = lower(p_halogen))
      and (p_dimension is null or p_dimension = '' or a.dimension_class = p_dimension)
      and (p_category is null or p_category = '' or a.category = p_category)
      and (p_evidence is null or p_evidence = '' or upper(a.evidence_level) like upper(p_evidence) || '%')
      and (p_scope is null or p_scope = '' or a.scope_status = p_scope)
      and (p_release_status is null or p_release_status = '' or a.release_status = p_release_status)
      and (
        coalesce(trim(p_q), '') = '' or
        case
          when lower(trim(p_q)) in ('cl', 'br', 'i') then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(a.halogen), '[^a-z]+'))
          when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(a.search_safe), '[^a-z0-9]+'))
          else a.search_safe ilike '%' || trim(p_q) || '%'
        end
      )
  )
  select count(*) into v_total from f;

  v_pages := greatest(1, ceil(v_total::numeric / v_size)::integer);
  v_page := least(greatest(1, coalesce(p_page, 1)), v_pages);

  with f as (
    select *
    from public.cuhalide_atlas_public_articles_v301 a
    where (p_year_from is null or a.year >= p_year_from)
      and (p_year_to is null or a.year <= p_year_to)
      and (p_halogen is null or p_halogen = '' or lower(a.halogen) = lower(p_halogen))
      and (p_dimension is null or p_dimension = '' or a.dimension_class = p_dimension)
      and (p_category is null or p_category = '' or a.category = p_category)
      and (p_evidence is null or p_evidence = '' or upper(a.evidence_level) like upper(p_evidence) || '%')
      and (p_scope is null or p_scope = '' or a.scope_status = p_scope)
      and (p_release_status is null or p_release_status = '' or a.release_status = p_release_status)
      and (
        coalesce(trim(p_q), '') = '' or
        case
          when lower(trim(p_q)) in ('cl', 'br', 'i') then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(a.halogen), '[^a-z]+'))
          when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(a.search_safe), '[^a-z0-9]+'))
          else a.search_safe ilike '%' || trim(p_q) || '%'
        end
      )
    order by
      case when p_sort = 'year_asc' then a.year end asc nulls last,
      case when p_sort = 'title' then lower(a.title) end asc nulls last,
      case when p_sort = 'evidence' then lower(a.evidence_level) end asc nulls last,
      case when p_sort not in ('year_asc', 'title', 'evidence') then a.year end desc nulls last,
      a.record_id asc
    offset (v_page - 1) * v_size
    limit v_size
  )
  select coalesce(jsonb_agg(to_jsonb(f)), '[]'::jsonb) into v_items from f;

  return jsonb_build_object(
    'items', v_items,
    'pagination', jsonb_build_object(
      'page', v_page,
      'page_size', v_size,
      'total', v_total,
      'total_pages', v_pages,
      'has_next', v_page < v_pages,
      'has_previous', v_page > 1
    )
  );
end;
$$;

create or replace function public.cuhalide_atlas_public_structures_query_v301(
  p_q text default '',
  p_page integer default 1,
  p_page_size integer default 30,
  p_halogen text default null,
  p_dimension text default null,
  p_space_group text default null,
  p_confidence text default null,
  p_polar text default null,
  p_inclusion text default null,
  p_eligibility text default null,
  p_record_id integer default null,
  p_strict_polar boolean default false
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_size integer := greatest(1, least(coalesce(p_page_size, 30), 40));
  v_pages integer;
  v_page integer;
  v_items jsonb;
begin
  with f as (
    select *
    from public.cuhalide_atlas_public_structures_v301 s
    where (p_record_id is null or s.record_id = p_record_id)
      and (p_halogen is null or p_halogen = '' or s.halogen_effective = p_halogen)
      and (p_dimension is null or p_dimension = '' or s.dimension_class = p_dimension)
      and (p_space_group is null or p_space_group = '' or s.space_group = p_space_group)
      and (p_confidence is null or p_confidence = '' or s.sg_confidence = p_confidence)
      and (p_polar is null or p_polar = '' or s.polar = p_polar)
      and (p_inclusion is null or p_inclusion = '' or s.inclusion_status = p_inclusion)
      and (p_eligibility is null or p_eligibility = '' or s.eligibility = p_eligibility)
      and (
        not p_strict_polar or (
          s.eligibility = 'Core - Included' and
          s.polar = 'Yes' and
          s.sg_confidence = 'High' and
          s.mapping_confidence = 'High' and
          s.inclusion_status = 'Included'
        )
      )
      and (
        coalesce(trim(p_q), '') = '' or
        case
          when lower(trim(p_q)) in ('cl', 'br', 'i') then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(s.halogen_effective), '[^a-z]+'))
          when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(s.search_safe), '[^a-z0-9]+'))
          else s.search_safe ilike '%' || trim(p_q) || '%'
        end
      )
  )
  select count(*) into v_total from f;

  v_pages := greatest(1, ceil(v_total::numeric / v_size)::integer);
  v_page := least(greatest(1, coalesce(p_page, 1)), v_pages);

  with f as (
    select *
    from public.cuhalide_atlas_public_structures_v301 s
    where (p_record_id is null or s.record_id = p_record_id)
      and (p_halogen is null or p_halogen = '' or s.halogen_effective = p_halogen)
      and (p_dimension is null or p_dimension = '' or s.dimension_class = p_dimension)
      and (p_space_group is null or p_space_group = '' or s.space_group = p_space_group)
      and (p_confidence is null or p_confidence = '' or s.sg_confidence = p_confidence)
      and (p_polar is null or p_polar = '' or s.polar = p_polar)
      and (p_inclusion is null or p_inclusion = '' or s.inclusion_status = p_inclusion)
      and (p_eligibility is null or p_eligibility = '' or s.eligibility = p_eligibility)
      and (
        not p_strict_polar or (
          s.eligibility = 'Core - Included' and
          s.polar = 'Yes' and
          s.sg_confidence = 'High' and
          s.mapping_confidence = 'High' and
          s.inclusion_status = 'Included'
        )
      )
      and (
        coalesce(trim(p_q), '') = '' or
        case
          when lower(trim(p_q)) in ('cl', 'br', 'i') then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(s.halogen_effective), '[^a-z]+'))
          when lower(trim(p_q)) ~ '^[a-z0-9]{1,4}$' then
            lower(trim(p_q)) = any(regexp_split_to_array(lower(s.search_safe), '[^a-z0-9]+'))
          else s.search_safe ilike '%' || trim(p_q) || '%'
        end
      )
    order by s.year desc nulls last, s.structure_id asc
    offset (v_page - 1) * v_size
    limit v_size
  )
  select coalesce(jsonb_agg(to_jsonb(f)), '[]'::jsonb) into v_items from f;

  return jsonb_build_object(
    'items', v_items,
    'pagination', jsonb_build_object(
      'page', v_page,
      'page_size', v_size,
      'total', v_total,
      'total_pages', v_pages,
      'has_next', v_page < v_pages,
      'has_previous', v_page > 1
    )
  );
end;
$$;

-- RLS + explicit deny policies for browser/API roles.
alter table public.cuhalide_atlas_public_articles_v301 enable row level security;
alter table public.cuhalide_atlas_public_structures_v301 enable row level security;

drop policy if exists cuhalide_public_articles_deny_untrusted
  on public.cuhalide_atlas_public_articles_v301;
create policy cuhalide_public_articles_deny_untrusted
  on public.cuhalide_atlas_public_articles_v301
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists cuhalide_public_structures_deny_untrusted
  on public.cuhalide_atlas_public_structures_v301;
create policy cuhalide_public_structures_deny_untrusted
  on public.cuhalide_atlas_public_structures_v301
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all privileges on public.cuhalide_atlas_public_articles_v301
  from anon, authenticated, service_role;
revoke all privileges on public.cuhalide_atlas_public_structures_v301
  from anon, authenticated, service_role;
grant select on public.cuhalide_atlas_public_articles_v301 to service_role;
grant select on public.cuhalide_atlas_public_structures_v301 to service_role;

revoke all on function public.cuhalide_formula_halogen_v1(text, text)
  from public, anon, authenticated;
revoke all on function public.cuhalide_dimension_class_v1(text)
  from public, anon, authenticated;
grant execute on function public.cuhalide_formula_halogen_v1(text, text) to service_role;
grant execute on function public.cuhalide_dimension_class_v1(text) to service_role;

revoke all on function public.cuhalide_atlas_public_articles_query_v301(
  text, integer, integer, integer, integer, text, text, text, text, text, text, text
) from public, anon, authenticated;
revoke all on function public.cuhalide_atlas_public_structures_query_v301(
  text, integer, integer, text, text, text, text, text, text, text, integer, boolean
) from public, anon, authenticated;
grant execute on function public.cuhalide_atlas_public_articles_query_v301(
  text, integer, integer, integer, integer, text, text, text, text, text, text, text
) to service_role;
grant execute on function public.cuhalide_atlas_public_structures_query_v301(
  text, integer, integer, text, text, text, text, text, text, text, integer, boolean
) to service_role;

commit;
