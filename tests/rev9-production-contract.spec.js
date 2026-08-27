import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

test('rev.9 deterministic health is ready',async({request})=>{
  const r=await request.get(`${BASE}/health.json`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',publication_state:'prepublication-review',current_curated_revision:9,site_version:'51',ui_version:'51.0',meta_version:'51.0',public_data_version:'2.17.1',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0',smart_rag_version:'9.20.0',research_assistant_version:'10.5.0'});
  expect(x.current_curated.live_revision).toBe(9);
  expect(x.current_curated.counts).toMatchObject({article_audit_records:383,chemically_included_articles:372,canonical_verified_articles:369,structure_phase_rows:947,core_included_structure_rows:887,resolved_space_group_rows:744,verified_space_group_rows:717,verified_polar_rows:101,strict_polar_rows:91,strict_polar_articles:57,rag_documents:1330,rag_embedded:1330,taxonomy_rows:947});
  expect(x.photophysics).toMatchObject({ok:true,version:'1.4.0',article_queue:383,pass_a_complete_articles:383,pass_a_pending_articles:0,pass_a_curated_articles:0,two_pass_verified_articles:329,verified_no_data_articles:54,publishable_samples:940,publishable_measurements:2275,publishable_values:3002,analysis_eligible_values:280,publishable_mechanism_claims:478,publication_policy:'two_pass_verified_or_verified_no_reported_data'});
  expect(x.organic_components).toMatchObject({ok:true,version:'1.2.0',database_authority:true});
  expect(x.checks).toMatchObject({frozen_release_contract:true,current_curated_contract:true,motif_taxonomy_contract:true,photophysics_contract:true,photophysics_all_data_bearing_two_pass:true,photophysics_conflicts_fail_closed:true,rag_embeddings_complete:true,organic_structure_state_closed:true,organic_component_connectivity_state_closed:true,mapping_terminal_boundaries_closed:true,space_group_terminal_boundaries_closed:true,dimensionality_terminal_boundaries_closed:true});
});

test('v51 portal exposes rev.9 and article index classes are not presented as structure dimensionality',async({page,request})=>{
  const r=await request.get(`${BASE}/api/site`);expect(r.status()).toBe(200);const html=await r.text();
  expect(html).toContain('CUHALIDE_SITE_V51_CURRENT_CURATED_R9');
  expect(html).toContain('CUHALIDE_UI_V51_0_CURRENT_R9');
  expect(html).toContain('Current Curated rev.9');
  expect(html).toContain('<meta name="cuhalide-site-version" content="51">');
  expect(html).toContain('Core-Included · n=887');
  expect(html).toContain('Core-Included structure rows · n = 887');
  expect(html).toContain('All structure / phase rows · n=947');
  expect(html).toContain('1,330-document Current Curated rev.9');
  expect(html).toContain('<span>Article index class</span><select id="adim">');
  expect(html).toContain('Article index classes are retrieval aids only');
  expect(html).toContain('Article index · ${esc(a.dimensionality_class)}');
  expect(html).toContain('Article index classes are retrieval metadata, not structure-grain dimensionality');
  expect(html).not.toContain('<span>Dimensionality</span><select id="adim">');
  for(const stale of ['CUHALIDE_UI_V50_2_CURRENT_R8','Core-Included structure rows · n = 886','cc.core_included_structure_rows||886','cc.structure_phase_rows||946','Audit view: all 946 structure/phase rows.','1,329-document Current Curated rev.9','<meta name="cuhalide-site-version" content="50">'])expect(html).not.toContain(stale);
  expect(r.headers()['x-cuhalide-current-curated-revision']).toBe('9');
  expect(r.headers()['x-cuhalide-site-version']).toBe('51');
  expect(r.headers()['x-cuhalide-ui-version']).toBe('51.0');
  const nav=await page.goto(BASE,{waitUntil:'domcontentloaded'});expect(nav?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Current Curated rev.9');
});

test('manifest and Motif Atlas agree with rev.9',async({request,page})=>{
  const m=await request.get(`${BASE}/release-manifest.json`);expect(m.status()).toBe(200);const j=await m.json();
  expect(j.current_curated).toMatchObject({revision:9,structure_phase_rows:947,core_included_structure_rows:887,resolved_space_group_rows:744,verified_space_group_rows:717,verified_polar_rows:101,strict_polar_rows:91,strict_polar_articles:57,rag_documents:1330,rag_embedded:1330,taxonomy_rows:947,motif_resolved_rows:640,motif_unresolved_rows:307});
  expect(j.runtime).toMatchObject({site_version:'51',ui_version:'51.0',meta_version:'51.0',public_data_version:'2.17.1',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0',smart_rag_version:'9.20.0',research_assistant_version:'10.5.0'});
  expect(j.frozen_release).toMatchObject({version:'3.0.2',immutable:true,structure_phase_rows:878});
  const raw=await request.get(`${BASE}/motifs`);expect(raw.status()).toBe(200);const motifHtml=await raw.text();
  expect(motifHtml).toContain('Current Curated rev.9');
  expect(motifHtml).toContain('Curated through 19 Aug 2026 · rev.9');
  expect(motifHtml).not.toContain('· rev.8');
  const mh=raw.headers();
  expect(mh['x-cuhalide-current-curated-revision']).toBe('9');
  expect(mh['x-cuhalide-site-version']).toBe('51');
  expect(mh['x-cuhalide-ui-version']).toBe('51.0');
  const mr=await page.goto(`${BASE}/motifs`,{waitUntil:'domcontentloaded'});expect(mr?.status()).toBe(200);await expect(page.locator('body')).toContainText('Current Curated rev.9');await expect(page.locator('body')).toContainText('640');await expect(page.locator('body')).toContainText('307');
});

test('public data and organic-component resolution are rev.9 fail-closed',async({request})=>{
  const h=await request.get(`${BASE}/api/public-data?action=organic-components-health`);expect(h.status()).toBe(200);const x=await h.json();
  expect(x).toMatchObject({ok:true,contract_version:'1.2.0',representation_rows:965,represented_structures:908,verified_connectivity_rows:61,unresolved_rows:894,not_applicable_rows:10,current_curated_revision:9});
  expect(x.checks).toMatchObject({database_organic_structure_state_closed:true,database_component_connectivity_state_closed:true,database_component_orphans_clear:true,raw_primary_files_exposed:false,raw_evidence_locators_exposed:false,private_evidence_fields_exposed:false});
  const hh=h.headers();
  expect(hh['x-cuhalide-current-curated-revision']).toBe('9');
  expect(hh['x-cuhalide-site-version']).toBe('51');
  expect(hh['x-cuhalide-ui-version']).toBe('51.0');
  expect(hh['x-cuhalide-public-data-version']).toBe('2.17.1');
  expect(hh['x-cuhalide-photophysics-contract']).toBe('1.4.0');
  expect(hh['x-cuhalide-organic-components-contract']).toBe('1.2.0');
});

test('machine-readable article grain is explicit and current record context is rev.9',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=article&id=91`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x.item).toMatchObject({record_id:91,dimensionality_class:'0D',article_index_class:'0D',dimensionality_field_semantics:'article_index_class_not_structure_grain',structure_dimensionality_source:'structure_phase_records'});
  expect(x.record_context).toMatchObject({serving_context:'current_curated',serving_revision:9,attached_photophysics_context:'current_curated',attached_photophysics_contract:'1.4.0'});
  expect(x.photophysics.version).toBe('1.4.0');
  expect(x.current_curated_revision).toBe(9);
});

test('article index class and structure dimensionality remain separated at record grain',async({request})=>{
  const r=await request.get(`${BASE}/structure/CUH-091-S02`);expect(r.status()).toBe(200);const structureHtml=await r.text();
  expect(structureHtml).toContain('Current Curated rev.9');
  expect(structureHtml).toContain('P21/n');
  expect(structureHtml).toContain('<dt>Dimensionality</dt><dd>1D</dd>');
  expect(structureHtml).not.toContain('<dt>Article index class</dt>');
  const rh=r.headers();
  expect(rh['x-cuhalide-current-curated-revision']).toBe('9');
  expect(rh['x-cuhalide-site-version']).toBe('51');
  expect(rh['x-cuhalide-ui-version']).toBe('51.0');
  expect(rh['x-cuhalide-public-data-version']).toBe('2.17.1');
  expect(rh['x-cuhalide-photophysics-contract']).toBe('1.4.0');
  expect(rh['x-cuhalide-organic-components-contract']).toBe('1.2.0');

  const a=await request.get(`${BASE}/article/91`);expect(a.status()).toBe(200);const articleHtml=await a.text();
  expect(articleHtml).toContain('<dt>Article index class</dt><dd>0D</dd>');
  expect(articleHtml).toContain('Article index class is a literature-retrieval label, not a structure-grain connectivity assignment.');
  expect(articleHtml).toContain('A single article may contain determinations with different dimensionalities');
  expect(articleHtml).not.toContain('<dt>Dimensionality</dt><dd>0D</dd>');
  const ah=a.headers();
  expect(ah['x-cuhalide-current-curated-revision']).toBe('9');
  expect(ah['x-cuhalide-site-version']).toBe('51');
  expect(ah['x-cuhalide-ui-version']).toBe('51.0');
  expect(ah['x-cuhalide-public-data-version']).toBe('2.17.1');
  expect(ah['x-cuhalide-photophysics-contract']).toBe('1.4.0');
  expect(ah['x-cuhalide-organic-components-contract']).toBe('1.2.0');
});

test('prepublication privacy and Frozen 3.0.2 boundary remain intact',async({request})=>{
  const root=await request.get(BASE);expect(root.headers()['x-robots-tag']).toContain('noindex');
  const manifest=await (await request.get(`${BASE}/release-manifest.json`)).json();
  expect(manifest.public_access).toMatchObject({bulk_export:false,primary_pdf_si_cif:false,raw_evidence_locators:false});
  expect(manifest.frozen_release).toMatchObject({version:'3.0.2',immutable:true});
  const ex=await request.get(`${BASE}/api/export`);expect([404,405,410]).toContain(ex.status());
});
