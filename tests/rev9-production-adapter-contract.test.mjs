import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('rev.9 production adapters expose the validated scientific/runtime contract',()=>{
  const vercel=JSON.parse(read('vercel.json'));
  const rewrites=new Map(vercel.rewrites.map(x=>[x.source,x.destination]));
  assert.equal(rewrites.get('/'),'/api/ui-r9');
  assert.equal(rewrites.get('/api/public-data'),'/api/public-data-r9');
  assert.equal(rewrites.get('/motifs'),'/api/motifs-r9');
  assert.match(rewrites.get('/article/:id'),/record-r9/);
  assert.equal(rewrites.get('/health.json'),'/api/meta-r9?asset=health');

  const middleware=read('middleware.js');
  for(const token of ["assistantTarget=new URL('/api/ui-r9'","publicDataTarget=new URL('/api/public-data-r9'","recordTarget=new URL('/api/record-r9'","REV='9'","UI='51.0'","SITE='51'","PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'",'release-3.0.2-ui-v51.0-current-r9',"'/api/public-data'","'/api/public-data.js'"])assert.ok(middleware.includes(token),`missing middleware token: ${token}`);
  assert.doesNotMatch(middleware,/ui-v50\.2-current-r8/);
  assert.doesNotMatch(middleware,/new URL\('\/api\/ui-assistant-current'/);
  assert.doesNotMatch(middleware,/new URL\('\/api\/record-evidence-current'/);

  const ui=read('api/ui-r9.js');
  for(const token of ["REV='9'","UI='51.0'","SITE='51'",'Current Curated rev.9','947 atomic/context structure records','Core-Included · n=887','Smart RAG 9.20.0','Structured Photophysics 1.4.0','Organic Components 1.2.0','Article index class','Article index · ${esc(a.dimensionality_class)}','Article index classes are retrieval aids only','Article index classes are retrieval metadata, not structure-grain dimensionality'])assert.ok(ui.includes(token),`missing UI token: ${token}`);

  const meta=read('api/meta-r9.js');
  for(const token of ["PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'","RAG='9.20.0'","ASSISTANT='10.5.0'","REV='9'",'structure_phase_rows:947','core_included_structure_rows:887','resolved_space_group_rows:744','verified_space_group_rows:717','verified_polar_rows:101','strict_polar_rows:91','strict_polar_articles:57','rag_documents:1330','taxonomy_rows:947','motif_resolved_rows:640','motif_unresolved_rows:307'])assert.ok(meta.includes(token),`missing meta token: ${token}`);

  const data=read('api/public-data-r9.js');
  for(const token of ["REV='9'","VERSION='2.17.1'","PH='1.4.0'","OC='1.2.0'","ARTICLE_DIMENSION_SEMANTICS='article_index_class_not_structure_grain'",'o.article_index_class=o.dimensionality_class','o.dimensionality_field_semantics=ARTICLE_DIMENSION_SEMANTICS',"o.structure_dimensionality_source='structure_phase_records'","o.serving_context==='current_curated'","o.attached_photophysics_context==='current_curated'"])assert.ok(data.includes(token),`missing public-data token: ${token}`);

  const record=read('api/record-r9.js');
  for(const token of ["REV='9'","SITE='51'","UI='51.0'","PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'",'requestKind(req)','Article index class','literature-retrieval label','article dimension grain guard missing'])assert.ok(record.includes(token),`missing record token: ${token}`);
  assert.match(record,/if\(kind==='article'/);
  const motifs=read('api/motifs-r9.js');
  for(const token of ["REV='9'","SITE='51'","UI='51.0'",'stale current-curated revision in Motif Atlas'])assert.ok(motifs.includes(token),`missing motif token: ${token}`);

  const agent=read('api/agent.js');
  for(const token of ["SITE_VERSION='51'","UI_VERSION='51.0'","PUBLIC_DATA_VERSION='2.17.1'","ASSISTANT_VERSION='10.5.0'","EVIDENCE_VERSION='9.20.0'","PHOTOPHYSICS_CONTRACT='1.4.0'","ORGANIC_COMPONENTS_CONTRACT='1.2.0'","CURRENT_REVISION='9'",'cuhalide-v51-evidence-v10.5.0','cuhalide-v51-conversation-v10.5.0',"res.setHeader('X-CuHalide-Photophysics-Contract',PHOTOPHYSICS_CONTRACT)","res.setHeader('X-CuHalide-Organic-Components-Contract',ORGANIC_COMPONENTS_CONTRACT)",'x.photophysics_contract=PHOTOPHYSICS_CONTRACT','x.organic_components_contract=ORGANIC_COMPONENTS_CONTRACT'])assert.ok(agent.includes(token),`missing agent token: ${token}`);
  for(const stale of ["ASSISTANT_VERSION='10.4.1'","EVIDENCE_VERSION='9.19.0'","PHOTOPHYSICS_CONTRACT='1.3.3'","CURRENT_REVISION='8'",'cuhalide-v50-evidence-v10.4.1','cuhalide-v50-conversation-v10.4.1'])assert.ok(!agent.includes(stale),`stale agent token: ${stale}`);
});

test('rev.9 adapter preserves prepublication and privacy boundaries',()=>{
  const meta=read('api/meta-r9.js'),vercel=read('vercel.json');
  assert.match(meta,/prepublication-review/);
  assert.match(meta,/bulk_export:false/);
  assert.match(meta,/primary_pdf_si_cif:false/);
  assert.match(meta,/raw_evidence_locators:false/);
  assert.match(vercel,/noindex, nofollow, noarchive/);
  assert.doesNotMatch(vercel,/\/api\/export/);
});

test('historical rev.8 implementation remains available for audit but is not a production entry point',()=>{
  assert.ok(fs.existsSync('api/ui-assistant-current.js'));
  assert.ok(fs.existsSync('api/record-evidence-current.js'));
  const vercel=JSON.parse(read('vercel.json'));
  const destinations=vercel.rewrites.filter(x=>['/','/index.html','/api/public-data','/motifs','/health.json'].includes(x.source)).map(x=>x.destination);
  assert.ok(destinations.every(x=>!x.includes('ui-assistant-current')&&!x.includes('record-evidence-current')&&!x.includes('meta?asset=health')));
});
