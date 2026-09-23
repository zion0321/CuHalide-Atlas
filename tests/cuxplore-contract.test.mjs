import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {parameters} from '../api/knowledge.js';import {integrateKnowledge} from '../lib/integrated-ui.mjs';
test('text subset is bounded, not an unrestricted raw-text endpoint',()=>{const u=parameters('/?action=articles&scope=text&limit=20');assert.equal(u.searchParams.get('scope'),'text');for(const q of ['/?action=raw','/?scope=private','/?action=retrieve&q=a','/?limit=21','/?offset=1001'])assert.throws(()=>parameters(q));});
test('CuXplore names the assistant while retaining dataset identity',()=>{const out=integrateKnowledge('<html><head></head><body><strong>CuHalide Atlas</strong><h1>CuHalide Research Assistant</h1><h2>Filters</h2><div class="shell dashboard section"></div><div class="shell rag-grid"></div></body></html>');assert(out.includes('<h1>CuXplore</h1>'));assert(out.includes('<strong>CuHalide Atlas</strong>'));assert(out.includes('value="text"'));assert(out.includes('/cuxplore-v1.js'));assert.equal(integrateKnowledge(out),out)});
test('native extraction and scientific verification are distinct throughout UI',()=>{const s=fs.readFileSync('public/cuxplore-v1.js','utf8');for(const k of ['main_text_files','si_text_files','cif_text_files','sparse_scan_files','photophysics_status','prose_passages','standalone'])assert(s.includes(k));assert(!s.includes("method:'POST'"));assert(!s.includes('storage/v1'));assert(!s.includes('SUPABASE_SERVICE_ROLE_KEY'));assert(s.includes('not independently')||s.includes('does not establish'));});
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
 for(const state of ['not_published','not_applicable','registered_not_parsed','external_deposition_registered','source_inventory_conflict','text_index_updated_at'])assert(js.includes(state));
});
