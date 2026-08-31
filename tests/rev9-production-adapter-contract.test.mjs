import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const has=(text,tokens,label='token')=>{for(const token of tokens)assert.ok(text.includes(token),`missing ${label}: ${token}`)};
const lacks=(text,tokens,label='stale token')=>{for(const token of tokens)assert.ok(!text.includes(token),`${label}: ${token}`)};

test('rev.9 production adapters expose the validated scientific/runtime contract',()=>{
  const vercel=JSON.parse(read('vercel.json'));
  const rewrites=new Map(vercel.rewrites.map(x=>[x.source,x.destination]));
  assert.equal(rewrites.get('/'),'/api/ui-r9');
  assert.equal(rewrites.get('/api/public-data'),'/api/public-data-r9');
  assert.equal(rewrites.get('/motifs'),'/api/motifs-r9');
  assert.match(rewrites.get('/article/:id'),/record-r9/);
  assert.equal(rewrites.get('/health.json'),'/api/meta-r9?asset=health');

  const middleware=read('middleware.js');
  has(middleware,["assistantTarget=new URL('/api/ui-r9'","publicDataTarget=new URL('/api/public-data-r9'","recordTarget=new URL('/api/record-r9'","REV='9'","UI='51.0'","SITE='51'","PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'",'release-3.0.2-ui-v51.0-current-r9',"'/api/public-data'","'/api/public-data.js'"],'middleware token');
  assert.doesNotMatch(middleware,/ui-v50\.2-current-r8/);
  assert.doesNotMatch(middleware,/new URL\('\/api\/ui-assistant-current'/);
  assert.doesNotMatch(middleware,/new URL\('\/api\/record-evidence-current'/);

  const ui=read('api/ui-r9.js');
  has(ui,["REV='9'","UI='51.0'","SITE='51'",'Current Curated rev.9','947 atomic/context structure records','Core-Included · n=890','Smart RAG 9.20.0','Structured Photophysics 1.4.0','Organic Components 1.2.0','simplifyPublicUi','<input type="hidden" id="arel" value="Current canonical">','<input type="hidden" id="selig" value="Core - Included">','const shown=v=>','Not established from available evidence'],'UI token');

  const meta=read('api/meta-r9.js');
  has(meta,["PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'","RAG='9.20.0'","ASSISTANT='10.5.0'","REV='9'",'canonical_verified_articles:370','structure_phase_rows:947','core_included_structure_rows:890','resolved_space_group_rows:747','verified_space_group_rows:720','verified_polar_rows:101','strict_polar_rows:91','strict_polar_articles:57','rag_documents:1330','taxonomy_rows:947','motif_resolved_rows:663','motif_unresolved_rows:284','motif_geometry_resolved_rows:217'],'meta token');
  lacks(meta,['canonical_verified_articles:369','core_included_structure_rows:887','resolved_space_group_rows:744','verified_space_group_rows:717','motif_resolved_rows:655','motif_unresolved_rows:292','motif_geometry_resolved_rows:206'],'stale meta token');

  const data=read('api/public-data-r9.js');
  has(data,["REV='9'","VERSION='2.17.1'","PH='1.4.0'","OC='1.2.0'","ARTICLE_DIMENSION_SEMANTICS='article_index_class_not_structure_grain'",'o.article_index_class=o.dimensionality_class','o.dimensionality_field_semantics=ARTICLE_DIMENSION_SEMANTICS',"o.structure_dimensionality_source='structure_phase_records'","o.serving_context==='current_curated'","o.attached_photophysics_context==='current_curated'"],'public-data token');

  const record=read('api/record-r9.js');
  has(record,["REV='9'","SITE='51'","UI='51.0'","PUBLIC_DATA='2.17.1'","PH='1.4.0'","OC='1.2.0'",'requestKind(req)','/organic-components-v1.js?v=1.2.0','internal standalone structure field remains visible','Not established from available evidence'],'record token');
  assert.match(record,/if\(kind==='article'/);

  const motifs=read('api/motifs-r9.js');
  has(motifs,["REV='9'","SITE='51'","UI='51.0'",'Source-resolved motifs','unresolved QA state remains promoted as a Motif Atlas category'],'motif token');

  const agent=read('api/agent.js');
  has(agent,["SITE_VERSION='51'","UI_VERSION='51.0'","PUBLIC_DATA_VERSION='2.17.1'","ASSISTANT_VERSION='10.5.0'","EVIDENCE_VERSION='9.20.0'","PHOTOPHYSICS_CONTRACT='1.4.0'","ORGANIC_COMPONENTS_CONTRACT='1.2.0'","CURRENT_REVISION='9'",'cuhalide-v51-evidence-v10.5.0','cuhalide-v51-conversation-v10.5.0',"res.setHeader('X-CuHalide-Photophysics-Contract',PHOTOPHYSICS_CONTRACT)","res.setHeader('X-CuHalide-Organic-Components-Contract',ORGANIC_COMPONENTS_CONTRACT)",'x.photophysics_contract=PHOTOPHYSICS_CONTRACT','x.organic_components_contract=ORGANIC_COMPONENTS_CONTRACT'],'agent token');
  lacks(agent,["ASSISTANT_VERSION='10.4.1'","EVIDENCE_VERSION='9.19.0'","PHOTOPHYSICS_CONTRACT='1.3.3'","CURRENT_REVISION='8'",'cuhalide-v50-evidence-v10.4.1','cuhalide-v50-conversation-v10.4.1'],'stale agent token');
});

test('UI 51 browser assets keep strict backend gates while public copy is researcher-facing',()=>{
  for(const p of ['public/ui-v51-core.js','public/ui-v51-core.css','public/ui-assistant-v51.css'])assert.ok(fs.existsSync(p),`missing current UI asset: ${p}`);
  const ui=read('api/ui-r9.js');
  has(ui,["x=all(x,'/ui-v48-2.css?v=50.2','/ui-v51-core.css?v=51.0')","x=all(x,'/ui-v48-2.js?v=50.2','/ui-v51-core.js?v=51.0')","x=all(x,'/ui-assistant-v48-5.css?v=20260818','/ui-assistant-v51.css?v=51.0')","x=all(x,'/ui-photophysics-v1.js?v=1.0.0','/ui-photophysics-v1.js?v=1.4.0')","x=all(x,'/ui-ux-v1.js?v=1.0.0','/ui-ux-v1.js?v=51.0')",'stale rev.9 display/browser token'],'asset migration token');

  const ph=read('public/ui-photophysics-v1.js');
  has(ph,["PHOTOPHYSICS_CONTRACT='1.4.0'","CURRENT_REVISION=9","PUBLICATION_POLICY='two_pass_verified_or_verified_no_reported_data'",'Pass A-only articles must not be published','Sample-resolved photophysics','Reviewed · no reported data','Data not available','Source discrepancy'],'Photophysics internal/public token');
  lacks(ph,["PHOTOPHYSICS_CONTRACT='1.3.3'",'published at first-pass stage','Primary-evidence Pass A is complete; independent Pass B has not yet been completed.','<span class="photo-stage verified">Two-pass verified</span>'],'stale/public-internal Photophysics token');

  const oc=read('public/organic-components-v1.js');
  has(oc,["CONTRACT='1.2.0'","CURRENT_REVISION=9",'Expected Organic Components','2D structures are shown only when molecular connectivity is uniquely established from source evidence.',"if(!first)return ''"],'Organic Components token');
  lacks(oc,['Contract 1.1.0','Organic Components 1.1 projection',"dataset.organicComponents='1.1.0'",'normalization_confidence','deterministic 2D renderer asset is unavailable'],'stale/internal Organic Components token');

  const sph=read('public/ui-structure-photophysics-v1.js');
  has(sph,["CONTRACT='1.4.0'","CURRENT_REVISION=9",'Withheld pending independent verification','does not satisfy the Photophysics 1.4.0 public-state gate'],'structure-photophysics token');
  assert.ok(!sph.includes("ph.version||'1.3.0'"),'stale structure-photophysics 1.3 fallback');

  const bootstrap=read('public/ui-ux-v1.js');
  has(bootstrap,['/ui-ux-core-v1.js?v=51.0','/organic-components-v1.js?v=1.2.0','/ui-structure-photophysics-v1.js?v=1.4.0'],'UI bootstrap token');
  assert.ok(read('public/ui-ux-core-v1.js').includes("?'⌘ K':'Ctrl K'"),'platform-aware search shortcut missing');
});

test('public browsing hides internal curation controls but fixed scientific scope remains enforced',()=>{
  const ui=read('api/ui-r9.js'),record=read('api/record-r9.js'),motifs=read('api/motifs-r9.js'),ph=read('public/ui-photophysics-v1.js'),oc=read('public/organic-components-v1.js');
  has(ui,['<input type="hidden" id="arel" value="Current canonical">','<input type="hidden" id="selig" value="Core - Included">','Curated literature.','Curated structure records.','Browse and cite the Atlas'],'public minimality guard');
  for(const token of ['Machine-normalized identity key','Motif adjudication confidence','SG / mapping confidence'])assert.ok(record.includes(token),`standalone field-removal rule missing: ${token}`);
  assert.ok(record.includes('internal standalone structure field remains visible'),'standalone hidden-field fail-closed guard missing');
  assert.ok(motifs.includes("x.includes('<td>Unresolved</td>')"),'Motif Atlas unresolved-family guard missing');
  assert.ok(ph.includes('PUBLICATION_POLICY'),'Photophysics publication gate must remain internal');
  assert.ok(!ph.includes('<p class="eyebrow">Structured photophysics · contract'),'Photophysics contract leaked into public heading');
  assert.ok(!ph.includes('<span class="photo-stage verified">Two-pass verified</span>'),'two-pass engineering label leaked into public UI');
  assert.ok(!oc.includes('normalization_confidence'),'Organic normalization confidence leaked into public UI renderer');
});

test('citation and prepublication privacy boundaries remain intact',()=>{
  const citation=read('CITATION.cff');
  has(citation,['Current Curated rev.9 (prepublication review)','Current Curated rev.9 is reviewed through 2026-08-19','Structured Photophysics 1.4.0','Organic Components 1.2.0'],'citation token');
  assert.ok(!citation.includes('Current Curated rev.8'),'stale rev.8 citation metadata');
  const codemeta=read('codemeta.json');
  has(codemeta,['prepublication-current-r9','Current Curated rev.9','Structured Photophysics 1.4.0','Organic Components 1.2.0'],'CodeMeta token');
  assert.ok(!codemeta.includes('current-r8'),'stale rev.8 CodeMeta metadata');

  const meta=read('api/meta-r9.js'),vercel=read('vercel.json');
  assert.match(meta,/prepublication-review/);
  assert.match(meta,/bulk_export:false/);
  assert.match(meta,/primary_pdf_si_cif:false/);
  assert.match(meta,/raw_evidence_locators:false/);
  assert.match(vercel,/noindex, nofollow, noarchive/);
  assert.doesNotMatch(vercel,/\/api\/export/);
});

test('historical implementations remain audit-only and never production entry points',()=>{
  assert.ok(fs.existsSync('api/ui-assistant-current.js'));
  assert.ok(fs.existsSync('api/record-evidence-current.js'));
  const vercel=JSON.parse(read('vercel.json'));
  const destinations=vercel.rewrites.filter(x=>['/','/index.html','/api/public-data','/motifs','/health.json'].includes(x.source)).map(x=>x.destination);
  assert.ok(destinations.every(x=>!x.includes('ui-assistant-current')&&!x.includes('record-evidence-current')&&!x.includes('meta?asset=health')));
});

test('Supabase public-safe mirror includes current evidence repairs and hardening',()=>{
  const runtime=read('supabase/README.md');
  has(runtime,['Current Curated: **rev.9**','Site / UI: **51 / 51.0**','Metadata gateway: **51.0**','Public Data: **2.17.1**','Structured Photophysics: **1.4.0**','Organic Components: **1.2.0**','Research Assistant: **10.5.0**','Smart RAG evidence engine: **9.20.0**','**1,330 / 1,330** documents/embeddings','canonical verified: **370**','structure/phase: **947**','Core-Included: **890**','resolved space-group rows: **747**','verified one-to-one space-group mappings: **720**','resolved local Cu–X motifs: **663**','explicitly unresolved local motifs: **284**','structure rows with resolved motif geometry: **217**','zero current structure/RAG scientific-field mismatches'],'Supabase runtime token');
  lacks(runtime,['canonical verified: **369**','Core-Included: **887**','resolved space-group rows: **744**','verified one-to-one space-group mappings: **717**','resolved local Cu–X motifs: **655**','explicitly unresolved local motifs: **292**','structure rows with resolved motif geometry: **206**','Current Curated: **rev.7**','Site / UI: **50 / 50.2**','Public Data: **2.16.0**','Structured Photophysics: **1.3.1**','Organic Components: **1.1.0**','**1,329 / 1,329** documents/embeddings'],'stale Supabase runtime token');

  const acl=read('supabase/migrations/20260827152633_harden_cuhalide_function_execute_privileges.sql');
  has(acl,['cuhalide_photophysics_public_conflict_warning_v1','cuhalide_photophysics_release_regression_v3','cuhalide_atlas_current_structure_search_safe_v1','from public, anon, authenticated','to service_role'],'ACL migration token');
  const keys=read('supabase/migrations/20260827152743_harden_rev9_current_keys_and_photophysics_fk_index.sql');
  has(keys,['cuhalide_public_structures_current_r9_candidate_v1_pkey','primary key (structure_id)','idx_photo_mechanism_sample','cuhalide_photophysics_mechanism_v1(sample_id)'],'key/index migration token');

  const motif=read('supabase/migrations/20260831060611_resolve_explicit_rev9_motif_evidence_v2.sql');
  has(motif,['CUH-227-S01','CUH-068-S02','CUH-215-S01','CUH-307-S01','CUH-181-S01','CUH-337-S03','CUH-184-S02','PRIMARY_SOURCE_EXPLICIT'],'explicit motif repair token');
  const geometry=read('supabase/migrations/20260831061829_resolve_explicit_rev9_motif_geometry_v2.sql');
  has(geometry,['CUH-321-S01','bipyramidal Cu4I4 cluster','CUH-052-S01','cubane Cu4I4 molecular cluster','CUH-160-S01','edge-shared tetrahedra','CUH-323-S01'],'explicit geometry repair token');
  const finalRepair=read('supabase/migrations/20260831064506_resolve_final_source_explicit_rev9_batch_v3.sql');
  has(finalRepair,['record_id=205','P21/c; Pnma; Pnna','r.canonical<>370','r.core<>890','r.motif_resolved<>663'],'final source-explicit repair token');
  const ragRefresh=read('supabase/migrations/20260831070622_refresh_rev9_rag_after_evidence_repairs.sql');
  has(ragRefresh,['expected 41 stale structure RAG docs','expected exactly 42 documents queued for re-embedding'],'RAG repair token');

  const ledger=read('supabase/contracts/REMOTE_MIGRATION_INVENTORY_2026-08-27.md');
  has(ledger,['production migration-history entries: **323**','20260827093021','promote_cuhalide_current_curated_rev9','20260827152633','20260827152743'],'dated remote-ledger token');
  const closeout=read('docs/CURRENT_CURATED_R9_PRODUCTION_CLOSEOUT_2026-08-27.md');
  has(closeout,['Current Curated rev.9 production closeout','prepublication-review','1,330 / 1,330','/api/export','HTTP 410 Gone','20260827152633_harden_cuhalide_function_execute_privileges.sql','20260827152743_harden_rev9_current_keys_and_photophysics_fk_index.sql'],'rev.9 closeout token');
});
