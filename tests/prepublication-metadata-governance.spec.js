import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
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

test('root and site endpoint identify a prepublication review interface in HTML and machine metadata',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');
  for(const path of ['/','/api/site']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status()).toBe(200);
    expect(header(r,'x-cuhalide-publication-state')).toBe(STATE);
    const html=await r.text();
    expect(html).toContain('<meta name="cuhalide-publication-state" content="prepublication-review">');
    expect(html).toContain('prepublication review interface');
    expect(html).not.toContain('structure-resolved public knowledge portal');
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

test('standalone records expose review-access wording without changing source-article provenance',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');

  const article=await request.get(`${BASE}/article/46`);
  expect(article.status()).toBe(200);
  expect(header(article,'x-cuhalide-publication-state')).toBe(STATE);
  const ah=await article.text();
  expect(ah).toContain('<meta name="cuhalide-publication-state" content="prepublication-review">');
  expect(ah).toContain('Current Curated rev.7 context · core article record inherited from immutable Frozen Release 3.0.2 baseline');
  expect(ah).toContain('Pass A curated');
  expect(ah).toContain('latest curated review-access record');
  expect(ah).toContain('Review pages expose only field-whitelisted information');
  expect(ah).not.toContain('latest curated public record');
  const articleLd=[...ah.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(x=>x?.['@type']==='ScholarlyArticle');
  expect(articleLd?.isPartOf?.version).toBe('current-r7');
  expect(articleLd?.isBasedOn?.version).toBe('3.0.2');
  expect(articleLd?.creativeWorkStatus).toBeUndefined();

  const structure=await request.get(`${BASE}/structure/CUH-381-S01`);
  expect(structure.status()).toBe(200);
  expect(header(structure,'x-cuhalide-publication-state')).toBe(STATE);
  const sh=await structure.text();
  expect(sh).toContain('Parent article · Two-pass verified');
  expect(sh).toContain('PLQY: 89.84 %');
  expect(sh).toContain('latest curated review-access record');
  expect(sh).toContain('Review pages expose only field-whitelisted information');
});

test('manifest health data gateway and citation expose one governance state',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Governance metadata is viewport invariant; run once on desktop.');

  const manifestResponse=await request.get(`${BASE}/release-manifest.json`);
  expect(manifestResponse.status()).toBe(200);
  expect(header(manifestResponse,'x-cuhalide-publication-state')).toBe(STATE);
  expect(header(manifestResponse,'x-cuhalide-meta-version')).toBe('50.5');
  const manifest=await manifestResponse.json();
  expect(manifest.publication_state).toBe(STATE);
  expect(manifest.public_access).toMatchObject({mode:'query-and-view',release_state:'prepublication',governance_state:STATE,indexing:'disabled-prepublication',bulk_export:false});
  expect(manifest.runtime).toMatchObject({site_version:'50',ui_version:'50.2',meta_version:'50.5',public_data_version:'2.16.0',photophysics_contract_version:'1.3.0',organic_components_contract_version:'1.1.0'});
  expect(manifest.current_curated).toMatchObject({revision:7,article_audit_records:383,canonical_verified_articles:369,structure_phase_rows:946,core_included_structure_rows:886,verified_space_group_rows:684,strict_polar_rows:87,strict_polar_articles:54,rag_documents:1329,rag_embedded:1329});

  const healthResponse=await request.get(`${BASE}/health.json`);
  expect(healthResponse.status()).toBe(200);
  expect(header(healthResponse,'x-cuhalide-publication-state')).toBe(STATE);
  expect(header(healthResponse,'x-cuhalide-meta-version')).toBe('50.5');
  const health=await healthResponse.json();
  expect(health).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',meta_version:'50.5',gateway_meta_version:'50.5',publication_state:STATE,public_data_version:'2.16.0',photophysics_contract_version:'1.3.0',organic_components_contract_version:'1.1.0'});

  const dataResponse=await request.get(`${BASE}/api/public-data?action=article&id=46`);
  expect(dataResponse.status()).toBe(200);
  expect(header(dataResponse,'x-cuhalide-publication-state')).toBe(STATE);
  const data=await dataResponse.json();
  expect(data.data_scope).toBe('frozen_release');
  expect(data.record_context).toMatchObject({serving_context:'current_curated',serving_revision:7,core_record_origin:'frozen_release',core_record_origin_release:'3.0.2',attached_photophysics_context:'current_curated',attached_photophysics_contract:'1.3.0'});

  const cffResponse=await request.get(`${BASE}/citation.cff`);
  expect(cffResponse.status()).toBe(200);
  expect(header(cffResponse,'x-cuhalide-publication-state')).toBe(STATE);
  const cff=await cffResponse.text();
  expect(cff).toContain('prepublication review resource');
  expect(cff).toContain('Prepublication review interface');
  expect(cff).not.toMatch(/^date-released:/m);
});
