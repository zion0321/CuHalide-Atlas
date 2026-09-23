-- Private original-text index. This does not promote scientific field values.
create table if not exists atlas_internal.cuxplore_import_batches_v1 (
 payload_sha256 text primary key check(payload_sha256 ~ '^[a-f0-9]{64}$'),
 imported_at timestamptz not null default now(), document_count integer not null,
 passage_count integer not null, source_note text not null
);
create table if not exists atlas_internal.cuxplore_documents_v1 (
 file_sha256 text primary key check(file_sha256 ~ '^[a-f0-9]{64}$'), doi text not null,
 title text, source_role text not null check(source_role in ('main_article','supporting_information','combined_main_and_si')),
 original_filename text not null, page_count integer not null check(page_count>0),
 text_pages integer not null, native_characters bigint not null, parser text not null,
 identity_basis text not null, extraction_status text not null check(extraction_status in ('native_text','scan_or_sparse_text')),
 field_review_performed boolean not null default false,
 batch_sha256 text not null references atlas_internal.cuxplore_import_batches_v1(payload_sha256), imported_at timestamptz not null default now()
);
create index if not exists cuxplore_documents_doi_idx on atlas_internal.cuxplore_documents_v1(doi);
create table if not exists atlas_internal.cuxplore_passages_v1 (
 file_sha256 text not null references atlas_internal.cuxplore_documents_v1(file_sha256),
 page integer not null check(page>0), part integer not null check(part>=0),
 content text not null check(length(content) between 80 and 4000), content_sha256 text not null,
 reference_page boolean not null default false,
 fts tsvector generated always as(to_tsvector('english',content)) stored,
 primary key(file_sha256,page,part)
);
create index if not exists cuxplore_passages_fts_idx on atlas_internal.cuxplore_passages_v1 using gin(fts);
alter table atlas_internal.cuxplore_import_batches_v1 enable row level security;
alter table atlas_internal.cuxplore_documents_v1 enable row level security;
alter table atlas_internal.cuxplore_passages_v1 enable row level security;
revoke all on atlas_internal.cuxplore_import_batches_v1,atlas_internal.cuxplore_documents_v1,atlas_internal.cuxplore_passages_v1 from public,anon,authenticated;
grant select,insert,update on atlas_internal.cuxplore_import_batches_v1,atlas_internal.cuxplore_documents_v1,atlas_internal.cuxplore_passages_v1 to service_role;

-- Server-side, authenticated import consumes a previously fetched private response.
-- Expiring source URLs, the response body, hashes of primary files and original texts
-- are not stored in this public source repository.
create or replace function atlas_internal.cuxplore_import_http_v1(p_request_id bigint,p_expected_sha text)
returns jsonb language plpgsql security definer set search_path='' as $f$
declare raw text; payload jsonb; d jsonb; p jsonb; sha text; n integer:=0; m integer:=0;
begin
 select content into raw from net._http_response where id=p_request_id and status_code=200 and not coalesce(timed_out,false);
 if raw is null then raise exception 'Successful transport response not available'; end if;
 sha:=encode(extensions.digest(convert_to(raw,'UTF8'),'sha256'),'hex');
 if sha<>p_expected_sha then raise exception 'Payload digest mismatch'; end if;
 payload:=raw::jsonb;
 if payload->>'schema'<>'cuxplore-native-import-1' or jsonb_array_length(payload->'documents')>1000 then raise exception 'Invalid source manifest'; end if;
 if exists(select 1 from atlas_internal.cuxplore_import_batches_v1 where payload_sha256=sha) then return jsonb_build_object('ok',true,'already_imported',true);end if;
 insert into atlas_internal.cuxplore_import_batches_v1(payload_sha256,document_count,passage_count,source_note) values(sha,jsonb_array_length(payload->'documents'),0,'User-provided originals; identity mapping and native text parsing; not field-level scientific validation.');
 for d in select value from jsonb_array_elements(payload->'documents') loop
  if not (d->>'doi' ~ '^10[.][0-9]{4,9}/[^[:space:]]+$') then raise exception 'Invalid DOI'; end if;
  if (d->>'field_review_performed')::boolean then raise exception 'Native import cannot assert field review';end if;
  insert into atlas_internal.cuxplore_documents_v1(file_sha256,doi,title,source_role,original_filename,page_count,text_pages,native_characters,parser,identity_basis,extraction_status,batch_sha256)
  values(d->>'file_sha256',lower(d->>'doi'),d->>'title',d->>'source_role',d->>'filename',(d->>'page_count')::int,(d->>'text_pages')::int,(d->>'native_characters')::bigint,d->>'parser',d->>'identity_basis',d->>'extraction_status',sha) on conflict(file_sha256) do nothing;
  for p in select value from jsonb_array_elements(d->'passages') loop
   if (p->>'page')::int > (d->>'page_count')::int or encode(extensions.digest(convert_to(p->>'content','UTF8'),'sha256'),'hex') <> p->>'sha256' then raise exception 'Passage identity failed';end if;
   insert into atlas_internal.cuxplore_passages_v1(file_sha256,page,part,content,content_sha256,reference_page) values(d->>'file_sha256',(p->>'page')::int,(p->>'part')::int,p->>'content',p->>'sha256',coalesce((p->>'reference_page')::boolean,false)) on conflict do nothing;m:=m+1;
  end loop;n:=n+1;
 end loop;
 update atlas_internal.cuxplore_import_batches_v1 set passage_count=m where payload_sha256=sha;
 return jsonb_build_object('ok',true,'documents',n,'passages',m,'payload_sha256',sha);
end;$f$;
revoke all on function atlas_internal.cuxplore_import_http_v1(bigint,text) from public,anon,authenticated;
grant execute on function atlas_internal.cuxplore_import_http_v1(bigint,text) to service_role;
