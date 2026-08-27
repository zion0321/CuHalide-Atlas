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
  for(const token of ["REV='9'","SITE='51'","UI='51.0'","PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'",'requestKind(req)','Article index class','literature-retrieval label','article dimension grain guard missing','/organic-components-v1.js?v=1.2.0'])assert.ok(record.includes(token),`missing record token: ${token}`);
  assert.match(record,/if\(kind==='article'/);
  const motifs=read('api/motifs-r9.js');
  for(const token of ["REV='9'","SITE='51'","UI='51.0'",'stale current-curated revision in Motif Atlas'])assert.ok(motifs.includes(token),`missing motif token: ${token}`);

  const agent=read('api/agent.js');
  for(const token of ["SITE_VERSION='51'","UI_VERSION='51.0'","PUBLIC_DATA_VERSION='2.17.1'","ASSISTANT_VERSION='10.5.0'","EVIDENCE_VERSION='9.20.0'","PHOTOPHYSICS_CONTRACT='1.4.0'","ORGANIC_COMPONENTS_CONTRACT='1.2.0'","CURRENT_REVISION='9'",'cuhalide-v51-evidence-v10.5.0','cuhalide-v51-conversation-v10.5.0',"res.setHeader('X-CuHalide-Photophysics-Contract',PHOTOPHYSICS_CONTRACT)","res.setHeader('X-CuHalide-Organic-Components-Contract',ORGANIC_COMPONENTS_CONTRACT)",'x.photophysics_contract=PHOTOPHYSICS_CONTRACT','x.organic_components_contract=ORGANIC_COMPONENTS_CONTRACT'])assert.ok(agent.includes(token),`missing agent token: ${token}`);
  for(const stale of ["ASSISTANT_VERSION='10.4.1'","EVIDENCE_VERSION='9.19.0'","PHOTOPHYSICS_CONTRACT='1.3.3'","CURRENT_REVISION='8'",'cuhalide-v50-evidence-v10.4.1','cuhalide-v50-conversation-v10.4.1'])assert.ok(!agent.includes(stale),`stale agent token: ${stale}`);
});

test('UI 51 dynamic browser assets and citation provenance are synchronized to rev.9',()=>{
  for(const p of ['public/ui-v51-core.js','public/ui-v51-core.css','public/ui-assistant-v51.css'])assert.ok(fs.existsSync(p),`missing current UI asset: ${p}`);
  const ui=read('api/ui-r9.js');
  for(const token of ['/ui-v51-core.css?v=51.0','/ui-v51-core.js?v=51.0','/ui-assistant-v51.css?v=51.0','/ui-photophysics-v1.js?v=1.4.0','/ui-ux-v1.js?v=51.0'])assert.ok(ui.includes(token),`missing current active asset rewrite: ${token}`);
  for(const stale of ['/ui-v48-2.','ui-assistant-v48-5','v=50.2','CUHALIDE_UI_V48_5'])assert.ok(!ui.split('for(const stale of')[0].includes(stale),`legacy asset remains active in UI patch body: ${stale}`);

  const ph=read('public/ui-photophysics-v1.js');
  for(const token of ["PHOTOPHYSICS_CONTRACT='1.4.0'","CURRENT_REVISION=9","PUBLICATION_POLICY='two_pass_verified_or_verified_no_reported_data'",'Pass A-only articles must not be published','Two-pass verified','Verified no reported data','Structured data withheld'])assert.ok(ph.includes(token),`missing Photophysics 1.4 browser token: ${token}`);
  for(const stale of ["PHOTOPHYSICS_CONTRACT='1.3.3'",'published at first-pass stage','Primary-evidence Pass A is complete; independent Pass B has not yet been completed.'])assert.ok(!ph.includes(stale),`stale Photophysics browser token: ${stale}`);

  const oc=read('public/organic-components-v1.js');
  for(const token of ["CONTRACT='1.2.0'","CURRENT_REVISION=9",'Expected Organic Components','Contract ${CONTRACT}','deterministic 2D renderer asset is unavailable'])assert.ok(oc.includes(token),`missing Organic Components 1.2 browser token: ${token}`);
  for(const stale of ['Contract 1.1.0','Organic Components 1.1 projection',"dataset.organicComponents='1.1.0'"])assert.ok(!oc.includes(stale),`stale Organic Components browser token: ${stale}`);

  const sph=read('public/ui-structure-photophysics-v1.js');
  for(const token of ["CONTRACT='1.4.0'","CURRENT_REVISION=9",'Withheld pending independent verification','does not satisfy the Photophysics 1.4.0 public-state gate'])assert.ok(sph.includes(token),`missing structure-photophysics 1.4 token: ${token}`);
  assert.ok(!sph.includes("ph.version||'1.3.0'"),'stale structure-photophysics 1.3 fallback');

  const bootstrap=read('public/ui-ux-v1.js');
  for(const token of ['/ui-ux-core-v1.js?v=51.0','/organic-components-v1.js?v=1.2.0','/ui-structure-photophysics-v1.js?v=1.4.0'])assert.ok(bootstrap.includes(token),`missing UI bootstrap token: ${token}`);
  const ux=read('public/ui-ux-core-v1.js');
  assert.ok(ux.includes("?'⌘ K':'Ctrl K'"),'platform-aware search shortcut missing');

  const citation=read('CITATION.cff');
  for(const token of ['Current Curated rev.9 (prepublication review)','Current Curated rev.9 is reviewed through 2026-08-19','Structured Photophysics 1.4.0','Organic Components 1.2.0'])assert.ok(citation.includes(token),`missing citation rev.9 token: ${token}`);
  assert.ok(!citation.includes('Current Curated rev.8'),'stale rev.8 citation metadata');
  const codemeta=read('codemeta.json');
  for(const token of ['prepublication-current-r9','Current Curated rev.9','Structured Photophysics 1.4.0','Organic Components 1.2.0'])assert.ok(codemeta.includes(token),`missing CodeMeta rev.9 token: ${token}`);
  assert.ok(!codemeta.includes('current-r8'),'stale rev.8 CodeMeta metadata');
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

test('Supabase public-safe mirror is synchronized to rev.9 and final DB hardening is versioned',()=>{
  const runtime=read('supabase/README.md');
  for(const token of ['Current Curated: **rev.9**','Site / UI: **51 / 51.0**','Metadata gateway: **51.0**','Public Data: **2.17.1**','Structured Photophysics: **1.4.0**','Organic Components: **1.2.0**','Research Assistant: **10.5.0**','Smart RAG evidence engine: **9.20.0**','**1,330 / 1,330** documents/embeddings','structure/phase: **947**','Core-Included: **887**','verified one-to-one space-group mappings: **717**'])assert.ok(runtime.includes(token),`stale Supabase runtime mirror; missing ${token}`);
  for(const stale of ['Current Curated: **rev.7**','Site / UI: **50 / 50.2**','Public Data: **2.16.0**','Structured Photophysics: **1.3.1**','Organic Components: **1.1.0**','**1,329 / 1,329** documents/embeddings'])assert.ok(!runtime.includes(stale),`stale current Supabase README token: ${stale}`);

  const acl=read('supabase/migrations/20260827152633_harden_cuhalide_function_execute_privileges.sql');
  for(const token of ['cuhalide_photophysics_public_conflict_warning_v1','cuhalide_photophysics_release_regression_v3','cuhalide_atlas_current_structure_search_safe_v1','from public, anon, authenticated','to service_role'])assert.ok(acl.includes(token),`missing ACL migration token: ${token}`);

  const keys=read('supabase/migrations/20260827152743_harden_rev9_current_keys_and_photophysics_fk_index.sql');
  for(const token of ['cuhalide_public_structures_current_r9_candidate_v1_pkey','primary key (structure_id)','idx_photo_mechanism_sample','cuhalide_photophysics_mechanism_v1(sample_id)'])assert.ok(keys.includes(token),`missing key/index migration token: ${token}`);

  const ledger=read('supabase/contracts/REMOTE_MIGRATION_INVENTORY_2026-08-27.md');
  for(const token of ['production migration-history entries: **323**','20260827093021','promote_cuhalide_current_curated_rev9','20260827152633','20260827152743'])assert.ok(ledger.includes(token),`missing remote-ledger token: ${token}`);

  const closeout=read('docs/CURRENT_CURATED_R9_PRODUCTION_CLOSEOUT_2026-08-27.md');
  for(const token of ['Current Curated rev.9 production closeout','prepublication-review','1,330 / 1,330','/api/export','HTTP 410 Gone','20260827152633_harden_cuhalide_function_execute_privileges.sql','20260827152743_harden_rev9_current_keys_and_photophysics_fk_index.sql'])assert.ok(closeout.includes(token),`missing rev.9 closeout token: ${token}`);
});
