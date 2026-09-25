import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {parameters} from '../api/knowledge.js';import {integrateKnowledge} from '../lib/integrated-ui.mjs';
test('text subset is bounded, not an unrestricted raw-text endpoint',()=>{const u=parameters('/?action=articles&scope=text&limit=20');assert.equal(u.searchParams.get('scope'),'text');for(const q of ['/?action=raw','/?scope=private','/?action=retrieve&q=a','/?limit=21','/?offset=1001'])assert.throws(()=>parameters(q));});
test('CuXplore names the assistant while retaining dataset identity',()=>{const out=integrateKnowledge('<html><head></head><body><strong>CuHalide Atlas</strong><h1>CuHalide Research Assistant</h1><h2>Filters</h2><div class="shell dashboard section"></div><div class="shell rag-grid"></div></body></html>');assert(out.includes('<h1>CuXplore</h1>'));assert(out.includes('<strong>CuHalide Atlas</strong>'));assert(out.includes('value="text"'));assert(out.includes('/cuxplore-v1.js'));assert.equal(integrateKnowledge(out),out)});
test('native extraction and scientific verification are distinct throughout UI',()=>{const s=fs.readFileSync('public/cuxplore-v1.js','utf8');for(const k of ['main_text_files','si_text_files','sparse_scan_files','photophysics_status','structure_records','standalone'])assert(s.includes(k));assert(!s.includes("method:'POST'"));assert(!s.includes('storage/v1'));assert(!s.includes('SUPABASE_SERVICE_ROLE_KEY'));assert(s.includes('do not replace')||s.includes('does not establish'));});
test('full selected metadata are retained without claiming generation',()=>{const s=fs.readFileSync('public/ui-knowledge-v1.js','utf8');assert(s.includes('processing,primary_match'));assert(s.includes('generation_performed:false'));assert(s.includes('Prepared all'));});
test('private native tables and queries have restricted grants',()=>{const s=fs.readFileSync('supabase/migrations/20260923_cuxplore_processing.sql','utf8');assert(s.includes('revoke all'));assert(s.includes('from public,anon,authenticated'));assert(!/grant\s+(?:select|execute)[^;]+to\s+anon/i.test(s));assert(s.includes('raw_source_text_exposed'));});

import {syncCsp} from '../api/record-r9.js';
test('standalone coverage keeps strict CSP while allowing same-origin fetch and assets',()=>{
 const h=new Map([['Content-Security-Policy',"default-src 'none'; script-src 'sha256-old'; style-src 'sha256-old'; frame-ancestors 'none'; object-src 'none'; form-action 'none'; base-uri 'none';"]]);
 const res={getHeader:k=>h.get(k),setHeader:(k,v)=>h.set(k,v)};
 syncCsp('<style>body{color:black}</style><script type="application/ld+json">{}</script>',res);
 const policy=h.get('Content-Security-Policy');
 assert(policy.includes("connect-src 'self'"));assert(policy.includes("style-src 'self' 'sha256-"));assert(policy.includes("script-src 'self' 'sha256-"));
 for(const d of ["default-src 'none'","frame-ancestors 'none'","object-src 'none'","form-action 'none'","base-uri 'none'"])assert(policy.includes(d));
 assert(!policy.includes('unsafe-inline'));assert(!policy.includes('https:'));
});
test('unpublished, inapplicable, registered and indexed source states are not collapsed',()=>{
 const js=fs.readFileSync('public/cuxplore-v1.js','utf8');
 for(const state of ['not_published','not_applicable','registered_not_parsed','external_deposition_registered'])assert(js.includes(state));
});

import {fetchReadOnlyJson} from '../supabase/functions/cuhalide-atlas-runtime-contract-v1-public/readonly-fetch.mjs';
test('read-only transport retries transient failure without changing data',async()=>{
 let calls=0;const output=await fetchReadOnlyJson('https://example.invalid',{}, {sleep:async()=>{},fetcher:async()=> ++calls===1?new Response('unavailable',{status:503}):new Response('{"ok":true,"count":372}')});
 assert.equal(calls,2);assert.deepEqual(output,{ok:true,count:372});
});
test('invalid credentials and invalid JSON fail without synthetic success',async()=>{
 for(const response of [()=>new Response('forbidden',{status:403}),()=>new Response('not-json')]){
  let calls=0;await assert.rejects(fetchReadOnlyJson('https://example.invalid',{}, {sleep:async()=>{},fetcher:async()=>{calls++;return response()}}));assert.equal(calls,1);
 }
});
test('read-only transport has a strict retry bound and no stale fallback',async()=>{
 let calls=0;await assert.rejects(fetchReadOnlyJson('https://example.invalid',{}, {sleep:async()=>{},fetcher:async()=>{calls++;return new Response('unavailable',{status:503})}}));assert.equal(calls,3);
});


test('full-text v2 UI uses character-range locators without exposing raw text',()=>{
 const js=fs.readFileSync('public/cuxplore-v1.js','utf8');
 for(const k of ['matchLocator','char_range','indexed text block','char_start','char_end'])assert(js.includes(k));
 assert(!js.includes('extracted_text'));
});
test('full-text v2 migration preserves separate semantic and lexical indexes',()=>{
 const s=fs.readFileSync('supabase/migrations/20260924_cuxplore_fulltext_v2_cutover.sql','utf8');
 for(const k of ['cuxplore_source_document_v2','cuxplore_text_chunk_v2','enable row level security','v2_fulltext_20260924','legacy_v1_fallback','cuxplore_fulltext_v2_health','semantic_index_separate','raw_source_text_exposed'])assert(s.includes(k));
 assert(s.includes('d.documents=727'));
 assert(s.includes('d.dois=403'));
 assert(s.includes('d.characters=21421324'));
 assert(s.includes('d.declared_chunks=6275'));
 assert(!/grant\s+(?:select|execute)[^;]+to\s+anon/i.test(s));
});


test('site synchronization exposes concise v2 coverage without page-locator regression',()=>{
 const ui=fs.readFileSync('public/ui-knowledge-v1.js','utf8');
 const cx=fs.readFileSync('public/cuxplore-v1.js','utf8');
 const retired=fs.readFileSync('public/research-design.html','utf8');
 const migration=fs.readFileSync('supabase/migrations/20260924_cuxplore_site_sync_coverage.sql','utf8');
 assert(ui.includes('Source matches locate indexed text'));
 assert(ui.includes('window.CuXplore?.locator'));
 assert(!ui.includes('PDF page ${hit.page_start'));
 for(const k of ['fulltext_v2','cif_reconciliation','source_indexed_through'])assert(migration.includes(k));
 for(const k of ['Coverage notes','Searchable source prose is available','full-text v2 source layer contains','Crystallographic source processing'])assert(cx.includes(k));
 assert(retired.includes('url=/#rag'));
 assert(!retired.includes('iPA'));
});
