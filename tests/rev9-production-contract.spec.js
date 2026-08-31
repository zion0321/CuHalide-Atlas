import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

test('rev.9 deterministic health is ready',async({request})=>{
  const r=await request.get(`${BASE}/health.json`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',publication_state:'prepublication-review',current_curated_revision:9,site_version:'51',ui_version:'51.0',meta_version:'51.0',public_data_version:'2.17.1',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0',smart_rag_version:'9.20.0',research_assistant_version:'10.5.0'});
  expect(x.current_curated.live_revision).toBe(9);
  expect(x.current_curated.counts).toMatchObject({article_audit_records:383,chemically_included_articles:372,canonical_verified_articles:370,structure_phase_rows:947,core_included_structure_rows:890,resolved_space_group_rows:747,verified_space_group_rows:720,verified_polar_rows:101,strict_polar_rows:91,strict_polar_articles:57,rag_documents:1330,rag_embedded:1330,taxonomy_rows:947});
  expect(x.motif_atlas).toMatchObject({ok:true,taxonomy_rows:947,resolved:663,unresolved:284,geometry_resolved:217});
  expect(x.photophysics).toMatchObject({ok:true,version:'1.4.0',article_queue:383,pass_a_complete_articles:383,pass_a_pending_articles:0,pass_a_curated_articles:0,two_pass_verified_articles:329,verified_no_data_articles:54,publishable_samples:940,publishable_measurements:2275,publishable_values:3002,analysis_eligible_values:280,publishable_mechanism_claims:478,publication_policy:'two_pass_verified_or_verified_no_reported_data'});
  expect(x.organic_components).toMatchObject({ok:true,version:'1.2.0',database_authority:true});
  expect(x.checks).toMatchObject({frozen_release_contract:true,current_curated_contract:true,motif_taxonomy_contract:true,photophysics_contract:true,photophysics_all_data_bearing_two_pass:true,photophysics_conflicts_fail_closed:true,rag_embeddings_complete:true,organic_structure_state_closed:true,organic_component_connectivity_state_closed:true,mapping_terminal_boundaries_closed:true,space_group_terminal_boundaries_closed:true,dimensionality_terminal_boundaries_closed:true});
});

test('v51 portal keeps final rev.9 scope while hiding internal curation controls',async({page,request})=>{
  const r=await request.get(`${BASE}/api/site`);expect(r.status()).toBe(200);const html=await r.text();
  expect(html).toContain('CUHALIDE_SITE_V51_CURRENT_CURATED_R9');
  expect(html).toContain('CUHALIDE_UI_V51_0_CURRENT_R9');
  expect(html).toContain('<meta name="cuhalide-site-version" content="51">');
  expect(html).toContain('<input type="hidden" id="arel" value="Current canonical">');
  expect(html).toContain('<input type="hidden" id="selig" value="Core - Included">');
  expect(html).toContain('cc.canonical_verified_articles||370');
  expect(html).toContain('cc.core_included_structure_rows||890');
  expect(html).toContain('cc.resolved_space_group_rows||747');
  expect(html).toContain('cc.strict_polar_rows||91');
  expect(html).toContain('1,330-document Current Curated rev.9');
  expect(html).not.toContain('<span>Article index class</span><select id="adim">');
  expect(html).not.toContain('Article index · ${esc(a.dimensionality_class)}');
  for(const stale of ['Core-Included · n=887','Core-Included structure rows · n = 887','Core-Included structure rows · n = 886','cc.canonical_verified_articles||369','cc.core_included_structure_rows||887','cc.resolved_space_group_rows||744','cc.verified_space_group_rows||717','cc.structure_phase_rows||946','Audit view: all 946 structure/phase rows.','1,329-document Current Curated rev.9','<meta name="cuhalide-site-version" content="50">'])expect(html).not.toContain(stale);
  expect(r.headers()['x-cuhalide-current-curated-revision']).toBe('9');
  expect(r.headers()['x-cuhalide-site-version']).toBe('51');
  expect(r.headers()['x-cuhalide-ui-version']).toBe('51.0');
  const nav=await page.goto(BASE,{waitUntil:'domcontentloaded'});expect(nav?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Updated collection');
  await expect(page.locator('body')).toContainText('Publications');
  await expect(page.locator('body')).not.toContainText('Article audit');
  await expect(page.locator('body')).not.toContainText('Dataset eligibility');
});

test('manifest and public Motif Atlas agree with final rev.9 without promoting unknowns',async({request,page})=>{
  const m=await request.get(`${BASE}/release-manifest.json`);expect(m.status()).toBe(200);const j=await m.json();
  expect(j.current_curated).toMatchObject({revision:9,canonical_verified_articles:370,structure_phase_rows:947,core_included_structure_rows:890,resolved_space_group_rows:747,verified_space_group_rows:720,verified_polar_rows:101,strict_polar_rows:91,strict_polar_articles:57,rag_documents:1330,rag_embedded:1330,taxonomy_rows:947,motif_resolved_rows:663,motif_unresolved_rows:284,motif_geometry_resolved_rows:217});
  expect(j.runtime).toMatchObject({site_version:'51',ui_version:'51.0',meta_version:'51.0',public_data_version:'2.17.1',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0',smart_rag_version:'9.20.0',research_assistant_version:'10.5.0'});
  expect(j.frozen_release).toMatchObject({version:'3.0.2',immutable:true,structure_phase_rows:878});
  const raw=await request.get(`${BASE}/motifs`);expect(raw.status()).toBe(200);const motifHtml=await raw.text();
  expect(motifHtml).toContain('Source-resolved motifs');
  expect(motifHtml).toContain('>947<');
  expect(motifHtml).toContain('>663<');
  expect(motifHtml).not.toContain('Motif unresolved');
  expect(motifHtml).not.toContain('Legacy category unresolved');
  expect(motifHtml).not.toContain('Unresolved legacy mapping');
  const mh=raw.headers();
  expect(mh['x-cuhalide-current-curated-revision']).toBe('9');
  expect(mh['x-cuhalide-site-version']).toBe('51');
  expect(mh['x-cuhalide-ui-version']).toBe('51.0');
  const mr=await page.goto(`${BASE}/motifs`,{waitUntil:'domcontentloaded'});expect(mr?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Source-resolved motifs');
  await expect(page.locator('body')).toContainText('663');
  await expect(page.locator('body')).not.toContainText('Motif unresolved');
  await expect(page.locator('body')).not.toContainText('Legacy category unresolved');
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

test('machine-readable article grain remains explicit even though internal index labels are absent from the public page',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=article&id=91`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x.item).toMatchObject({record_id:91,dimensionality_class:'0D',article_index_class:'0D',dimensionality_field_semantics:'article_index_class_not_structure_grain',structure_dimensionality_source:'structure_phase_records'});
  expect(x.record_context).toMatchObject({serving_context:'current_curated',serving_revision:9,attached_photophysics_context:'current_curated',attached_photophysics_contract:'1.4.0'});
  expect(x.photophysics.version).toBe('1.4.0');
  expect(x.current_curated_revision).toBe(9);
});

test('standalone structure stays structure-grain while article hides internal retrieval-class metadata',async({request})=>{
  const r=await request.get(`${BASE}/structure/CUH-091-S02`);expect(r.status()).toBe(200);const structureHtml=await r.text();
  expect(structureHtml).toContain('P21/n');
  expect(structureHtml).toContain('<dt>Dimensionality</dt><dd>1D</dd>');
  expect(structureHtml).not.toContain('Machine-normalized identity key');
  expect(structureHtml).not.toContain('Motif adjudication confidence');
  expect(structureHtml).not.toContain('SG / mapping confidence');
  const rh=r.headers();
  expect(rh['x-cuhalide-current-curated-revision']).toBe('9');
  expect(rh['x-cuhalide-site-version']).toBe('51');
  expect(rh['x-cuhalide-ui-version']).toBe('51.0');
  expect(rh['x-cuhalide-public-data-version']).toBe('2.17.1');
  expect(rh['x-cuhalide-photophysics-contract']).toBe('1.4.0');
  expect(rh['x-cuhalide-organic-components-contract']).toBe('1.2.0');

  const a=await request.get(`${BASE}/article/91`);expect(a.status()).toBe(200);const articleHtml=await a.text();
  expect(articleHtml).not.toContain('<dt>Article index class</dt>');
  expect(articleHtml).not.toContain('<dt>Dimensionality</dt><dd>0D</dd>');
  expect(articleHtml).not.toContain('Article index class is a literature-retrieval label');
  expect(articleHtml).not.toContain('A single article may contain determinations with different dimensionalities');
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
