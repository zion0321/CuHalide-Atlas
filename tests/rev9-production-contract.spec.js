import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
test.describe.configure({mode:'serial'});

test('rev.10 deterministic health is ready',async({request})=>{
  const r=await request.get(`${BASE}/health.json`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',publication_state:'prepublication-review',current_curated_revision:10,site_version:'52',ui_version:'52.0',meta_version:'52.1',public_data_version:'2.18.0',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0'});
  expect(x.literature).toMatchObject({articles:410,catalog_searchable_v2_articles:384,fulltext_v2_doi_records:403,source_documents:727,text_blocks:6275,denominator:'DOI-deduplicated literature corpus'});
  expect(x.current_curated.live_revision).toBe(10);
  expect(x.current_curated.current_curated_through).toBe('2026-09-14');
  expect(x.current_curated.counts).toMatchObject({structure_phase_rows:939,core_included_structure_rows:901,resolved_space_group_rows:761,verified_space_group_rows:734,verified_polar_rows:101,strict_polar_rows:94,strict_polar_articles:60,rag_documents:1322,rag_embedded:1322,taxonomy_rows:939});
  expect(x.current_curated.counts.article_audit_records).toBeUndefined();expect(x.current_curated.counts.canonical_verified_articles).toBeUndefined();expect(x.current_curated.counts.chemically_included_articles).toBeUndefined();
  expect(x.cuxplore).toMatchObject({ok:true,version:'10.6.0',knowledge_contract:'1.3.0',semantic_index_version:'10.0.0',semantic_records:1322,semantic_embedded:1322});
  expect(x.cuxplore.source_index).toMatchObject({release:'cuxplore-fulltext-v2-20260924',indexed_through:'2026-09-24',doi_records:403,documents:727,characters:21421324,text_blocks:6275,native_text_files:664,sparse_text_files:6,empty_or_unreadable_files:57,catalog_searchable_v2_dois:384,catalog_searchable_v2_blocks:6175,raw_source_text_exposed:false,semantic_index_separate:true});
  expect(x.cif_reconciliation).toMatchObject({release:'cif-reconciliation-20260924',registered_files:114,parsed_files:114,cu_structure_blocks:237,identity_review_rows:29,identity_resolved_rows:26,quarantined_rows:3,dimensionality_flags:10,dimensionality_adjudicated:10,authority_rows:939,core_included_rows:901,authority_overwritten:false});
  expect(x.smart_rag).toBeUndefined();expect(x.research_assistant).toBeUndefined();
  expect(x.photophysics).toMatchObject({ok:true,version:'1.4.0',publication_policy:'two_pass_verified_or_verified_no_reported_data'});
  expect(x.organic_components).toMatchObject({ok:true,version:'1.2.0',database_authority:true});
  expect(x.checks).toMatchObject({current_curated_contract:true,rag_embeddings_complete:true,rag_content_hashes_valid:true,taxonomy_one_to_one:true,organic_structure_state_closed:true,component_connectivity_state_closed:true,photophysics_contract:true});
});

test('Site 52 portal exposes rev.10 scope while hiding internal curation controls',async({page,request})=>{
  const r=await request.get(`${BASE}/api/site`);expect(r.status()).toBe(200);const html=await r.text();
  expect(html).toContain('CUHALIDE_SITE_V52_CURRENT_CURATED_R10');
  expect(html).toContain('CUHALIDE_UI_V52_0_CURRENT_R10');
  expect(html).toContain('<meta name="cuhalide-site-version" content="52">');
  expect(html).toContain('<input type="hidden" id="arel" value="Current canonical">');
  expect(html).toContain('<input type="hidden" id="selig" value="Core - Included">');
  expect(html).toContain('S.boot.literature?.articles||410');
  expect(html).not.toContain('cc.canonical_verified_articles||372');
  expect(html).toContain('cc.core_included_structure_rows||901');
  expect(html).toContain('cc.resolved_space_group_rows||761');
  expect(html).toContain('cc.strict_polar_rows||94');
  expect(html).not.toContain('1,322-document Current Curated rev.10');
  expect(html).not.toContain('<span>Article index class</span><select id="adim">');
  expect(html).not.toContain('Article index · ${esc(a.dimensionality_class)}');
  for(const stale of ['Core-Included · n=890','cc.canonical_verified_articles||370','cc.core_included_structure_rows||890','cc.resolved_space_group_rows||747','cc.verified_space_group_rows||720','cc.structure_phase_rows||947','1,330-document Current Curated rev.10','Current Curated rev.9','CUHALIDE_SITE_V51_CURRENT_CURATED_R9'])expect(html).not.toContain(stale);
  expect(r.headers()['x-cuhalide-current-curated-revision']).toBe('10');
  expect(r.headers()['x-cuhalide-site-version']).toBe('52');
  expect(r.headers()['x-cuhalide-ui-version']).toBe('52.0');
  const nav=await page.goto(BASE,{waitUntil:'domcontentloaded'});expect(nav?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Updated collection');
  await expect(page.locator('body')).toContainText('Articles');
  await expect(page.locator('body')).toContainText('410');
  await expect(page.locator('body')).not.toContainText('Article audit');
  await expect(page.locator('body')).not.toContainText('Dataset eligibility');
  await expect(page.locator('body')).not.toContainText('Research Assistant');
  await expect(page.locator('body')).not.toContainText('Smart RAG');
  await expect(page.locator('body')).not.toContainText('Conversational LLM');
  await expect(page.locator('#nav [data-route="rag"]')).toHaveText('CuXplore');
});

test('manifest and public Motif Atlas agree with rev.10 without promoting unknowns',async({request,page})=>{
  const m=await request.get(`${BASE}/release-manifest.json`);expect(m.status()).toBe(200);const j=await m.json();
  expect(j.schema_version).toBe('2.6');
  expect(j.literature).toMatchObject({articles:410,catalog_searchable_v2_articles:384,fulltext_v2_doi_records:403,source_documents:727,text_blocks:6275,denominator:'DOI-deduplicated literature corpus'});
  expect(j.current_curated).toMatchObject({revision:10,structure_phase_rows:939,core_included_structure_rows:901,resolved_space_group_rows:761,verified_space_group_rows:734,verified_polar_rows:101,strict_polar_rows:94,strict_polar_articles:60,taxonomy_rows:939,motif_resolved_rows:677,motif_unresolved_rows:262,motif_geometry_resolved_rows:286});
  expect(j.current_curated.article_audit_records).toBeUndefined();expect(j.current_curated.canonical_verified_articles).toBeUndefined();expect(j.current_curated.chemically_included_articles).toBeUndefined();
  expect(j.cuxplore).toMatchObject({version:'10.6.0',knowledge_contract:'1.3.0',semantic_index_version:'10.0.0',semantic_records:1322,semantic_embedded:1322});
  expect(j.cuxplore.source_index).toMatchObject({doi_records:403,documents:727,characters:21421324,text_blocks:6275,indexed_through:'2026-09-24'});
  expect(j.cif_reconciliation).toMatchObject({registered_files:114,parsed_files:114,cu_structure_blocks:237,identity_review_rows:29,identity_resolved_rows:26,quarantined_rows:3,dimensionality_adjudicated:10,authority_overwritten:false});
  expect(j.runtime).toMatchObject({site_version:'52',ui_version:'52.0',meta_version:'52.1',public_data_version:'2.18.0',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0'});
  expect(j.runtime.smart_rag_version).toBeUndefined();expect(j.runtime.research_assistant_version).toBeUndefined();
  expect(j.frozen_release).toMatchObject({version:'3.0.2',immutable:true,structure_phase_rows:878});
  const raw=await request.get(`${BASE}/motifs`);expect(raw.status()).toBe(200);const motifHtml=await raw.text();
  expect(motifHtml).toContain('Source-resolved motifs');
  expect(motifHtml).toContain('>939<');
  expect(motifHtml).toContain('>677<');
  expect(motifHtml).not.toContain('Motif unresolved');
  expect(motifHtml).not.toContain('Legacy category unresolved');
  expect(motifHtml).not.toContain('Unresolved legacy mapping');
  const mh=raw.headers();
  expect(mh['x-cuhalide-current-curated-revision']).toBe('10');
  expect(mh['x-cuhalide-site-version']).toBe('52');
  expect(mh['x-cuhalide-ui-version']).toBe('52.0');
  const mr=await page.goto(`${BASE}/motifs`,{waitUntil:'domcontentloaded'});expect(mr?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Source-resolved motifs');
  await expect(page.locator('body')).toContainText('677');
  await expect(page.locator('body')).not.toContainText('Motif unresolved');
  await expect(page.locator('body')).not.toContainText('Legacy category unresolved');
});

test('public bootstrap exposes one article denominator',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=bootstrap`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x.literature).toMatchObject({articles:410,catalog_searchable_v2_articles:384,fulltext_v2_doi_records:403,source_documents:727,text_blocks:6275,denominator:'DOI-deduplicated literature corpus'});
  expect(x.overview.denominators).toMatchObject({article_distributions:{records:372,basis:'Current Curated structured-data article subset'},structure_dimensionality:{rows:901,basis:'Core-Included structure rows'},space_groups:{rows:761,basis:'resolved structure/phase rows'}});
  expect(x.current_curated.article_audit_records).toBeUndefined();
  expect(x.current_curated.canonical_verified_articles).toBeUndefined();
  expect(x.current_curated.chemically_included_articles).toBeUndefined();
});

test('public data and organic-component resolution are rev.10 fail-closed',async({request})=>{
  const h=await request.get(`${BASE}/api/public-data?action=organic-components-health`);expect(h.status()).toBe(200);const x=await h.json();
  expect(x).toMatchObject({ok:true,contract_version:'1.2.0',representation_rows:968,represented_structures:911,verified_connectivity_rows:61,unresolved_rows:897,not_applicable_rows:10,current_curated_revision:10});
  expect(x.checks).toMatchObject({database_organic_structure_state_closed:true,database_component_connectivity_state_closed:true,database_component_orphans_clear:true,raw_primary_files_exposed:false,raw_evidence_locators_exposed:false,private_evidence_fields_exposed:false});
  const hh=h.headers();
  expect(hh['x-cuhalide-current-curated-revision']).toBe('10');
  expect(hh['x-cuhalide-site-version']).toBe('52');
  expect(hh['x-cuhalide-ui-version']).toBe('52.0');
  expect(hh['x-cuhalide-public-data-version']).toBe('2.18.0');
  expect(hh['x-cuhalide-photophysics-contract']).toBe('1.4.0');
  expect(hh['x-cuhalide-organic-components-contract']).toBe('1.2.0');
});

test('machine-readable article grain remains explicit',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=article&id=91`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x.item).toMatchObject({record_id:91,dimensionality_class:'0D',article_index_class:'0D',dimensionality_field_semantics:'article_index_class_not_structure_grain',structure_dimensionality_source:'structure_phase_records'});
  expect(x.record_context).toMatchObject({serving_context:'current_curated',serving_revision:10,attached_photophysics_context:'current_curated',attached_photophysics_contract:'1.4.0'});
  expect(x.photophysics.version).toBe('1.4.0');
  expect(x.current_curated_revision).toBe(10);
});

test('standalone structure stays structure-grain while article hides internal retrieval-class metadata',async({request})=>{
  const r=await request.get(`${BASE}/structure/CUH-091-S02`);expect(r.status()).toBe(200);const structureHtml=await r.text();
  expect(structureHtml).toContain('P21/n');
  expect(structureHtml).toContain('<dt>Dimensionality</dt><dd>1D</dd>');
  expect(structureHtml).not.toContain('Machine-normalized identity key');
  expect(structureHtml).not.toContain('Motif adjudication confidence');
  expect(structureHtml).not.toContain('SG / mapping confidence');
  const rh=r.headers();
  expect(rh['x-cuhalide-current-curated-revision']).toBe('10');
  expect(rh['x-cuhalide-site-version']).toBe('52');
  expect(rh['x-cuhalide-ui-version']).toBe('52.0');
  expect(rh['x-cuhalide-public-data-version']).toBe('2.18.0');
  expect(rh['x-cuhalide-photophysics-contract']).toBe('1.4.0');
  expect(rh['x-cuhalide-organic-components-contract']).toBe('1.2.0');

  const a=await request.get(`${BASE}/article/91`);expect(a.status()).toBe(200);const articleHtml=await a.text();
  expect(articleHtml).not.toContain('<dt>Article index class</dt>');
  expect(articleHtml).not.toContain('<dt>Dimensionality</dt><dd>0D</dd>');
  const ah=a.headers();
  expect(ah['x-cuhalide-current-curated-revision']).toBe('10');
  expect(ah['x-cuhalide-site-version']).toBe('52');
  expect(ah['x-cuhalide-ui-version']).toBe('52.0');
  expect(ah['x-cuhalide-public-data-version']).toBe('2.18.0');
});

test('prepublication privacy and Frozen 3.0.2 boundary remain intact',async({request})=>{
  const root=await request.get(BASE);expect(root.headers()['x-robots-tag']).toContain('noindex');
  const manifest=await (await request.get(`${BASE}/release-manifest.json`)).json();
  expect(manifest.public_access).toMatchObject({bulk_export:false,primary_pdf_si_cif:false,raw_evidence_locators:false});
  expect(manifest.frozen_release).toMatchObject({version:'3.0.2',immutable:true});
  const ex=await request.get(`${BASE}/api/export`);expect([404,405,410]).toContain(ex.status());
});
