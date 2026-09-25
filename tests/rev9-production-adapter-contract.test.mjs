import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const has=(text,tokens,label='token')=>{for(const token of tokens)assert.ok(text.includes(token),`missing ${label}: ${token}`)};
const lacks=(text,tokens,label='stale token')=>{for(const token of tokens)assert.ok(!text.includes(token),`${label}: ${token}`)};

test('rev.10 production adapters expose the validated runtime identity',()=>{
  const vercel=JSON.parse(read('vercel.json'));
  const rewrites=new Map(vercel.rewrites.map(x=>[x.source,x.destination]));
  assert.equal(rewrites.get('/'),'/api/ui-r10');
  assert.equal(rewrites.get('/index.html'),'/api/ui-r10');
  assert.equal(rewrites.get('/api/public-data'),'/api/public-data-r9');
  assert.equal(rewrites.get('/motifs'),'/api/motifs-r9');
  assert.match(rewrites.get('/article/:id'),/record-r9/);
  assert.match(rewrites.get('/structure/:id'),/record-r9/);
  assert.equal(rewrites.get('/health.json'),'/api/meta-r9?asset=health');

  const middleware=read('middleware.js');
  has(middleware,["assistantTarget=new URL('/api/ui-r10'","publicDataTarget=new URL('/api/public-data-r9'","recordTarget=new URL('/api/record-r9'","REV='10'","UI='52.0'","SITE='52'","PUBLIC_DATA='2.18.0'","PH='1.4.0'","OC='1.2.0'"],'middleware token');
  lacks(middleware,["REV='9'","UI='51.0'","SITE='51'","PUBLIC_DATA='2.17.1'"],'stale middleware token');
});

test('UI 52 rev.10 wrapper patches all user-visible current-state denominators',()=>{
  const ui=read('api/ui-r10.js');
  has(ui,["REV='10'","UI='52.0'","SITE='52'",'Current Curated rev.10','S.boot.literature?.articles||410','cc.core_included_structure_rows||901','cc.verified_space_group_rows||734','cc.strict_polar_rows||94','cc.strict_polar_articles||60','cc.structure_phase_rows||939','cc.resolved_space_group_rows||761','2026-09-14'],'UI rev10 token');
  assert.match(ui,/replace\(\/Current Curated rev\\\.9\/gi,'Current Curated rev\.10'\)/);
  assert.match(ui,/unsafe-inline forbidden/);
  assert.ok(!ui.includes("throw new Error('stale rev.9 UI state after rev.10 patch')"),'compatibility wrapper must not turn harmless lexical remnants into a 500 response');
});

test('metadata manifest is synchronized to the rev.10 scientific counts',()=>{
  const meta=read('api/meta-r9.js');
  has(meta,["SITE='52'","UI='52.0'","META='52.1'","PUBLIC_DATA='2.18.0'","PH='1.4.0'","OC='1.2.0'","SEMANTIC='10.0.0'","CUXPLORE='10.6.0'","KNOWLEDGE='1.3.0'","REV='10'",'const LITERATURE={articles:410','publicCurrentCurated','structure_phase_rows:939','core_included_structure_rows:901','resolved_space_group_rows:761','verified_space_group_rows:734','verified_polar_rows:101','strict_polar_rows:94','strict_polar_articles:60','taxonomy_rows:939','motif_resolved_rows:677','motif_unresolved_rows:262','motif_geometry_resolved_rows:286','semantic_records:1322','doi_records:403','documents:727','text_blocks:6275','registered_files:114','parsed_files:114','cu_structure_blocks:237','authority_overwritten:false','publishable_samples:941','publishable_measurements:2278','representation_rows:968','represented_structures:911','unresolved_rows:897'],'meta token');
  lacks(meta,['canonical_verified_articles:370','article_audit_records:383,chemically_included_articles:372,canonical_verified_articles:372','structure_phase_rows:947','core_included_structure_rows:890','rag_documents:1330'],'stale meta count');
});

test('public-data, record, motif and assistant adapters agree on rev.10 contracts',()=>{
  const data=read('api/public-data-r9.js');
  has(data,["REV='10'","VERSION='2.18.0'","PH='1.4.0'","OC='1.2.0'","ARTICLE_DIMENSION_SEMANTICS='article_index_class_not_structure_grain'",'o.article_index_class=o.dimensionality_class',"o.structure_dimensionality_source='structure_phase_records'"],'public-data token');

  const record=read('api/record-r9.js');
  has(record,["REV='10'","SITE='52'","UI='52.0'","PUBLIC_DATA='2.18.0'","PH='1.4.0'","OC='1.2.0'",'/organic-components-v1.js?v=1.2.0','Not established from available evidence','stale rev.9 record browser state'],'record token');

  const motifs=read('api/motifs-r9.js');
  has(motifs,["REV='10'","SITE='52'","UI='52.0'",'939-row taxonomy','Source-resolved Cu–X motif families by material class','unresolved QA state remains promoted as a Motif Atlas category'],'motif token');

  const agent=read('api/agent.js');
  has(agent,["SITE_VERSION='52'","UI_VERSION='52.0'","PUBLIC_DATA_VERSION='2.18.0'","CUXPLORE_VERSION='10.6.0'","SEMANTIC_INDEX_VERSION='10.0.0'","KNOWLEDGE_CONTRACT='1.3.0'","PHOTOPHYSICS_CONTRACT='1.4.0'","ORGANIC_COMPONENTS_CONTRACT='1.2.0'","CURRENT_REVISION='10'",'service=\'CuXplore\'','knowledge_contract=KNOWLEDGE_CONTRACT'],'agent token');
});

test('rev.10 browser compatibility assets are patched at runtime without weakening fail-closed semantics',()=>{
  const assets=read('api/assets-r10.js');
  has(assets,['ui-photophysics-v1.js','ui-structure-photophysics-v1.js','organic-components-v1.js','CURRENT_REVISION=10',"SITE='52'","UI='52.0'"],'asset adapter token');
  const vercel=JSON.parse(read('vercel.json'));
  const rewrites=new Map(vercel.rewrites.map(x=>[x.source,x.destination]));
  assert.match(rewrites.get('/ui-photophysics-v1.js'),/assets-r10\?asset=photophysics/);
  assert.match(rewrites.get('/ui-structure-photophysics-v1.js'),/assets-r10\?asset=structure_photophysics/);
  assert.match(rewrites.get('/organic-components-v1.js'),/assets-r10\?asset=organic_components/);

  const ph=read('public/ui-photophysics-v1.js');
  has(ph,["PHOTOPHYSICS_CONTRACT='1.4.0'","CURRENT_REVISION=10",'Pass A-only articles must not be published','Sample-resolved photophysics','Reviewed · no reported data','Source discrepancy'],'Photophysics token');lacks(ph,['CURRENT_REVISION=9'],'stale Photophysics revision');
  const oc=read('public/organic-components-v1.js');
  has(oc,["CONTRACT='1.2.0'","CURRENT_REVISION=10",'Expected Organic Components','2D structures are shown only when molecular connectivity is uniquely established from source evidence.'],'Organic Components token');
  lacks(oc,['CURRENT_REVISION=9','Contract 1.1.0','Organic Components 1.1 projection','normalization_confidence'],'stale Organic Components token');
});

test('citation, CodeMeta and prepublication privacy boundaries are rev.10',()=>{
  const citation=read('CITATION.cff');
  has(citation,['Current Curated rev.10 (prepublication review)','2026-09-14','Structured Photophysics 1.4.0','Organic Components 1.2.0'],'citation token');
  const codemeta=read('codemeta.json');
  has(codemeta,['prepublication-current-r10','Current Curated rev.10','Structured Photophysics 1.4.0','Organic Components 1.2.0'],'CodeMeta token');

  const meta=read('api/meta-r9.js'),vercel=read('vercel.json');
  assert.match(meta,/prepublication-review/);
  assert.match(meta,/const LITERATURE=\{articles:410,fulltext_articles:403,source_documents:727,text_blocks:6275/);
  assert.match(meta,/bulk_export:false/);
  assert.match(meta,/primary_pdf_si_cif:false/);
  assert.match(meta,/raw_evidence_locators:false/);
  assert.match(vercel,/noindex, nofollow, noarchive/);
  assert.doesNotMatch(vercel,/\/api\/export/);
});

test('versioned Supabase public-safe sources mirror the deployed rev.10 services',()=>{
  const pd=read('supabase/functions/cuhalide-atlas-public-data-v3/index.ts');
  has(pd,["VERSION='2.18.0'","REV='10'",'current_curated_revision=10','Current Curated rev.10 resolution layer','2026-09-14'],'Public Data source token');
  const rag=read('supabase/functions/cuhalide-atlas-smart-rag-v302-current-public/index.ts');
  has(rag,["VERSION='10.0.0'","CURRENT_RELEASE='current-curated-r10'",'REV=10','DOCS=1322','cuhalide-atlas-current-rag-r10-unified-internal'],'RAG source token');
  const runtime=read('supabase/functions/cuhalide-atlas-runtime-contract-v1-public/index.ts');
  has(runtime,["PUBLIC_DATA_VERSION='2.18.0'","EVIDENCE_VERSION='10.0.0'","ASSISTANT_VERSION='10.6.0'",'REV=10',"SITE='52'","UI='52.0'",'structure_phase_rows)===939','rag_documents)===1322'],'runtime source token');
  const assistant=read('supabase/functions/cuhalide-atlas-research-assistant-v1-public/index.ts');
  has(assistant,["VERSION='10.6.0'","EVIDENCE_VERSION='10.0.0'","CURRENT_REVISION='10'",'DOCS=1322',"layer:'current-curated-r10'"],'assistant source token');
});

test('historical implementations remain available for audit but are not production entry points',()=>{
  assert.ok(fs.existsSync('api/ui-assistant-current.js'));
  assert.ok(fs.existsSync('api/record-evidence-current.js'));
  const vercel=JSON.parse(read('vercel.json'));
  const destinations=vercel.rewrites.filter(x=>['/','/index.html','/api/public-data','/motifs','/health.json'].includes(x.source)).map(x=>x.destination);
  assert.ok(destinations.every(x=>!x.includes('ui-assistant-current')&&!x.includes('record-evidence-current')&&!x.includes('meta?asset=health')));
});
