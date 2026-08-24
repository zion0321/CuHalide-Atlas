import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const header=(response,name)=>response.headers()[String(name).toLowerCase()]||'';
const CURRENT_MIDDLEWARE='release-3.0.2-ui-v50.2-current-r7';

test.describe.configure({mode:'serial'});

test('stale UI function suffixes terminate at the current assistant renderer',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Suffix routing is viewport invariant; run once on desktop.');
  for(const path of ['/api/ui-site.js','/api/ui-assistant.js']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status(),path).toBe(200);
    expect(header(r,'x-cuhalide-middleware'),path).toBe(CURRENT_MIDDLEWARE);
    expect(header(r,'x-cuhalide-current-curated-revision'),path).toBe('7');
    expect(header(r,'x-cuhalide-ui-version'),path).toBe('50.2');
    expect(header(r,'x-cuhalide-publication-state'),path).toBe('prepublication-review');
    expect(header(r,'x-robots-tag'),path).toContain('noindex');
    const html=await r.text();
    expect(html,path).toContain('data-route="photophysics" href="#photophysics">Photophysics');
    expect(html,path).toContain('data-route="rag" href="#rag">Research Assistant');
    expect(html,path).toContain('CUHALIDE_VISIBLE_PHOTOPHYSICS_UI_V1');
    expect(html,path).toContain('CUHALIDE_UI_V48_5_CONVERSATIONAL_RESEARCH_ASSISTANT');
    expect(html,path).toContain('CuHalide Research Assistant');
    expect(html,path).not.toContain('data-route="rag" href="#rag">Smart RAG');
    expect(html,path).not.toContain('<h1>Smart RAG</h1>');
    expect(html,path).not.toContain('Current Curated rev.6');
    expect(html,path).not.toContain('content="6"');
  }
});

test('stale record function suffixes terminate at the evidence-grain wrapper',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Suffix routing is viewport invariant; run once on desktop.');
  for(const path of ['/api/record.js','/api/record-current.js']){
    const r=await request.get(`${BASE}${path}?kind=structure&id=CUH-006-S01`);
    expect(r.status(),path).toBe(200);
    expect(header(r,'x-cuhalide-middleware'),path).toBe(CURRENT_MIDDLEWARE);
    expect(header(r,'x-cuhalide-current-curated-revision'),path).toBe('7');
    expect(header(r,'x-cuhalide-publication-state'),path).toBe('prepublication-review');
    expect(header(r,'x-robots-tag'),path).toContain('noindex');
    const html=await r.text();
    expect(html,path).toContain('Current Curated rev.7 · primary-evidence reviewed through 19 Aug 2026');
    expect(html,path).toContain('No structure-mapped data');
    expect(html,path).toContain('without an explicit structure mapping');
    expect(html,path).toContain('latest curated review-access record');
    expect(html,path).not.toContain('0 curated sample states · 0 measurements · 0 normalized values');
    expect(html,path).not.toContain('Current Curated rev.6');
    expect(html,path).not.toContain('latest curated public record');
    expect(html,path).not.toContain('<meta name="robots" content="index,follow,max-image-preview:large">');
  }
});

test('legacy record suffix preserves current article provenance and staged photophysics',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Suffix routing is viewport invariant; run once on desktop.');
  const r=await request.get(`${BASE}/api/record.js?kind=article&id=46`);
  expect(r.status()).toBe(200);
  expect(header(r,'x-cuhalide-middleware')).toBe(CURRENT_MIDDLEWARE);
  const html=await r.text();
  expect(html).toContain('Current Curated rev.7 context · core article record inherited from immutable Frozen Release 3.0.2 baseline');
  expect(html).toContain('Pass A curated');
  expect(html).toContain('PLQY: 41.5 %');
  expect(html).toContain('"@type":"WebPage"');
  expect(html).toContain('"@type":"ScholarlyArticle"');
  expect(html).not.toContain('Part of archived scientific snapshot 3.0.2 · retained in the current corpus');
});

test('final wrapper function suffixes remain safe direct positive controls',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Suffix routing is viewport invariant; run once on desktop.');
  const ui=await request.get(`${BASE}/api/ui-assistant-current.js`);
  expect(ui.status()).toBe(200);
  expect(header(ui,'x-cuhalide-current-curated-revision')).toBe('7');
  const uiHtml=await ui.text();
  expect(uiHtml).toContain('data-route="photophysics" href="#photophysics">Photophysics');
  expect(uiHtml).toContain('CuHalide Research Assistant');
  expect(uiHtml).not.toContain('Current Curated rev.6');

  const record=await request.get(`${BASE}/api/record-evidence-current.js?kind=structure&id=CUH-006-S01`);
  expect(record.status()).toBe(200);
  expect(header(record,'x-cuhalide-current-curated-revision')).toBe('7');
  expect(header(record,'x-cuhalide-publication-state')).toBe('prepublication-review');
  const recordHtml=await record.text();
  expect(recordHtml).toContain('No structure-mapped data');
  expect(recordHtml).toContain('latest curated review-access record');
  expect(recordHtml).not.toContain('0 curated sample states · 0 measurements · 0 normalized values');
});
