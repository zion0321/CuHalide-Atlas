import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const PUBLIC='https://cuhalide-atlas-v3.vercel.app';
const STATE='prepublication-review';
const header=(response,name)=>response.headers()[String(name).toLowerCase()]||'';

function websiteJsonLd(html){
  for(const match of String(html).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    try{const x=JSON.parse(match[1]);if(x?.['@type']==='WebSite'&&x?.name==='CuHalide Atlas')return x}catch{}
  }
  return null;
}

function firstJsonLd(html,type,name){
  for(const match of String(html).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    try{const x=JSON.parse(match[1]);if((!type||x?.['@type']===type)&&(!name||x?.name===name))return x}catch{}
  }
  return null;
}

test.describe.configure({mode:'serial'});

test('all public site HTML entry points resolve to the current prepublication review UI',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');
  for(const path of ['/','/api/site','/api/ui-site','/api/ui-assistant']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status()).toBe(200);
    expect(header(r,'x-cuhalide-publication-state')).toBe(STATE);
    expect(header(r,'x-cuhalide-ui-version')).toBe('50.2');
    expect(header(r,'x-cuhalide-site-version')).toBe('50');
    const html=await r.text();
    expect(html).toContain('<meta name="cuhalide-publication-state" content="prepublication-review">');
    expect(html).toContain('prepublication review interface');
    expect(html).not.toContain('structure-resolved public knowledge portal');
    expect(html).toContain('data-route="photophysics" href="#photophysics">Photophysics');
    expect(html).toContain('data-route="rag" href="#rag">Research Assistant');
    expect(html).toContain('CUHALIDE_VISIBLE_PHOTOPHYSICS_UI_V1');
    expect(html).toContain('CUHALIDE_UI_V48_5_CONVERSATIONAL_RESEARCH_ASSISTANT');
    expect(html).toContain('CuHalide Research Assistant');
    expect(html).not.toContain('data-route="rag" href="#rag">Smart RAG');
    expect(html).not.toContain('<h1>Smart RAG</h1>');
    expect(html).not.toContain('>Ask Smart RAG<');
    const ld=websiteJsonLd(html);
    expect(ld).not.toBeNull();
    expect(ld.creativeWorkStatus).toBe('Prepublication review');
    expect(ld.description).toContain('prepublication review interface');
  }

  const root=await request.get(BASE),html=await root.text();
  expect(html).toContain('<summary>Prepublication review interface</summary>');
  expect(html).toContain('Prepublication attribution');
  expect(html).toContain('Review-access knowledge layer');
  expect(html).toContain('Review access is query-and-view.');
  expect(html).toContain('Copy attribution');
  expect(html).not.toContain('<summary>Public scientific interface</summary>');
  expect(html).not.toContain('<p class="eyebrow">Recommended citation</p>');
  expect(html).not.toContain('<h2>Public knowledge layer</h2>');
  expect(html).not.toContain('Public access is query-and-view.');
});

test('Motif Atlas is independently fail-closed for indexing and dataset review status',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');
  const r=await request.get(`${BASE}/motifs`);
  expect(r.status()).toBe(200);
  expect(header(r,'x-robots-tag')).toContain('noindex');
  expect(header(r,'x-cuhalide-publication-state')).toBe(STATE);
  const html=await r.text();
  expect(html).toContain('<meta name="robots" content="noindex,nofollow,noarchive">');
  expect(html).toContain('<meta name="cuhalide-publication-state" content="prepublication-review">');
  expect(html).toContain('Prepublication review · Curated through 19 Aug 2026 · rev.7');
  expect(html).toContain('review-access projection, not a formally released public dataset');
  expect(html).not.toContain('<meta name="robots" content="index,follow,max-image-preview:large">');
  const ld=firstJsonLd(html,'Dataset','CuHalide Atlas Motif Atlas');
  expect(ld).not.toBeNull();
  expect(ld.creativeWorkStatus).toBe('Prepublication review');
  expect(ld.version).toBe('current-r7');
  expect(ld.isPartOf?.version).toBe('current-r7');
});

test('standalone records expose review-access wording while article-page provenance stays separate from the published source',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');

  const article=await request.get(`${BASE}/article/46`);
  expect(article.status()).toBe(200);
  expect(header(article,'x-cuhalide-publication-state')).toBe(STATE);
  const ah=await article.text();
  expect(ah).toContain('<meta name="cuhalide-publication-state" content="prepublication-review">');
  expect(ah).toContain('Current Curated rev.7 context · core article record inherited from immutable Frozen Release 3.0.2 baseline');
  expect(ah).toContain('Two-pass verified');
  expect(ah).toContain('Independent Pass A and Pass B review agree');
  expect(ah).not.toContain('Pass A curated');
  expect(ah).toContain('latest curated review-access record');
  expect(ah).toContain('Review pages expose only field-whitelisted information');
  expect(ah).not.toContain('latest curated public record');
  const recordLd=firstJsonLd(ah,'WebPage');
  expect(recordLd).not.toBeNull();
  expect(recordLd?.['@id']).toBe(`${PUBLIC}/article/46#record`);
  expect(recordLd?.url).toBe(`${PUBLIC}/article/46`);
  expect(recordLd?.dateModified).toBe('2026-08-19');
  expect(recordLd?.isPartOf?.version).toBe('current-r7');
  expect(recordLd?.isPartOf?.creativeWorkStatus).toBe('Prepublication review');
  expect(recordLd?.isBasedOn?.version).toBe('3.0.2');
  expect(recordLd?.isBasedOn?.creativeWorkStatus).toBeUndefined();
  const sourceArticle=recordLd?.mainEntity;
  expect(sourceArticle).toMatchObject({'@type':'ScholarlyArticle','@id':'https://doi.org/10.1038/s41377-025-01910-1',identifier:'10.1038/s41377-025-01910-1',url:'https://doi.org/10.1038/s41377-025-01910-1',sameAs:'https://doi.org/10.1038/s41377-025-01910-1',datePublished:'2025'});
  for(const field of ['dateModified','isPartOf','isBasedOn','creativeWorkStatus'])expect(sourceArticle).not.toHaveProperty(field);

  const structure=await request.get(`${BASE}/structure/CUH-381-S01`);
  expect(structure.status()).toBe(200);
  expect(header(structure,'x-cuhalide-publication-state')).toBe(STATE);
  const sh=await structure.text();
  expect(sh).toContain('Parent article · Two-pass verified');
  expect(sh).toContain('PLQY: 89.84 %');
  expect(sh).toContain('latest curated review-access record');
  expect(sh).toContain('Review pages expose only field-whitelisted information');
  const structureLd=firstJsonLd(sh,'Dataset');
  expect(structureLd?.identifier).toBe('CUH-381-S01');
  expect(structureLd?.creativeWorkStatus).toBe('Prepublication review');
  expect(structureLd?.isPartOf?.creativeWorkStatus).toBe('Prepublication review');
});

test('branded missing records remain 404 while carrying review-access governance',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');
  const r=await request.get(`${BASE}/article/999999`);
  expect(r.status()).toBe(404);
  expect(header(r,'x-robots-tag')).toContain('noindex');
  expect(header(r,'x-cuhalide-publication-state')).toBe(STATE);
  const html=await r.text();
  expect(html).toContain('<meta name="cuhalide-publication-state" content="prepublication-review">');
  expect(html).toContain('Record not found');
  expect(html).toContain('No current review-access CuHalide Atlas record matches this identifier.');
  expect(html).not.toContain('No current public CuHalide Atlas record matches this identifier.');
  expect(html).not.toContain('<script type="application/ld+json">');
});

test('manifest health data gateway citation assistant export and sitemap expose one governance state',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');

  const manifestResponse=await request.get(`${BASE}/release-manifest.json`);
  expect(manifestResponse.status()).toBe(200);
  expect(header(manifestResponse,'x-cuhalide-publication-state')).toBe(STATE);
  expect(header(manifestResponse,'x-cuhalide-meta-version')).toBe('50.5');
  const manifest=await manifestResponse.json();
  expect(manifest.publication_state).toBe(STATE);
  expect(manifest.public_access).toMatchObject({mode:'query-and-view',release_state:'prepublication',governance_state:STATE,indexing:'disabled-prepublication',bulk_export:false});
  expect(manifest.runtime).toMatchObject({site_version:'50',ui_version:'50.2',meta_version:'50.5',public_data_version:'2.16.0',photophysics_contract_version:'1.3.2',organic_components_contract_version:'1.1.0'});
  expect(manifest.current_curated).toMatchObject({revision:7,article_audit_records:383,canonical_verified_articles:369,structure_phase_rows:946,core_included_structure_rows:886,verified_space_group_rows:684,strict_polar_rows:87,strict_polar_articles:54,rag_documents:1329,rag_embedded:1329});

  const healthResponse=await request.get(`${BASE}/health.json`);
  expect(healthResponse.status()).toBe(200);
  expect(header(healthResponse,'x-cuhalide-publication-state')).toBe(STATE);
  expect(header(healthResponse,'x-cuhalide-meta-version')).toBe('50.5');
  const health=await healthResponse.json();
  expect(health).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',meta_version:'50.5',gateway_meta_version:'50.5',publication_state:STATE,public_data_version:'2.16.0',photophysics_contract_version:'1.3.2',organic_components_contract_version:'1.1.0'});

  const dataResponse=await request.get(`${BASE}/api/public-data?action=article&id=46`);
  expect(dataResponse.status()).toBe(200);
  expect(header(dataResponse,'x-cuhalide-publication-state')).toBe(STATE);
  const data=await dataResponse.json();
  expect(data.data_scope).toBe('frozen_release');
  expect(data.record_context).toMatchObject({serving_context:'current_curated',serving_revision:7,core_record_origin:'frozen_release',core_record_origin_release:'3.0.2',attached_photophysics_context:'current_curated',attached_photophysics_contract:'1.3.2'});

  const assistantResponse=await request.get(`${BASE}/api/agent`);
  expect(assistantResponse.status()).toBe(200);
  expect(header(assistantResponse,'x-cuhalide-publication-state')).toBe(STATE);
  const assistant=await assistantResponse.json();
  expect(assistant.publication_state).toBe(STATE);
  expect(assistant.assistant_version).toBe('10.4.1');
  expect(assistant.version).toBe('9.19.0');
  expect(assistant.current_curated?.live_revision).toBe(7);

  const exportResponse=await request.get(`${BASE}/api/export`);
  expect(exportResponse.status()).toBe(410);
  expect(header(exportResponse,'x-cuhalide-publication-state')).toBe(STATE);
  const exportBody=await exportResponse.json();
  expect(exportBody).toMatchObject({release:'3.0.2',publication_state:STATE,release_state:'prepublication',public_access:'query-and-view'});
  expect(exportBody.error).toContain('prepublication review');

  const sitemapResponse=await request.get(`${BASE}/sitemap.xml`);
  expect(sitemapResponse.status()).toBe(200);
  expect(header(sitemapResponse,'x-robots-tag')).toContain('noindex');
  expect(header(sitemapResponse,'x-cuhalide-publication-state')).toBe(STATE);
  expect(header(sitemapResponse,'x-cuhalide-sitemap-urls')).toBe('2');
  const sitemap=await sitemapResponse.text();
  expect(sitemap).toContain('CuHalide Atlas prepublication-review sitemap');
  expect((sitemap.match(/<url>/g)||[]).length).toBe(2);
  expect(sitemap).toContain(`${PUBLIC}/motifs`);
  expect(sitemap).not.toContain('/article/');
  expect(sitemap).not.toContain('/structure/');

  const cffResponse=await request.get(`${BASE}/citation.cff`);
  expect(cffResponse.status()).toBe(200);
  expect(header(cffResponse,'x-cuhalide-publication-state')).toBe(STATE);
  expect(header(cffResponse,'x-cuhalide-meta-version')).toBe('50.5');
  const cff=await cffResponse.text();
  expect(cff).toContain('prepublication review resource');
  expect(cff).toContain('not a formally deposited public dataset');
  expect(cff).toContain('Current Curated rev.7 (prepublication review)');
  expect(cff).toContain('name: "CuHalide Atlas Project"');
  expect(cff).not.toMatch(/^date-released:/m);
  expect(cff).not.toMatch(/\bdoi:\s*\S+/im);
});