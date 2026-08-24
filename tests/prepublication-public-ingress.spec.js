import { test, expect } from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'https://cuhalide-atlas-v3.vercel.app';
const PUBLIC='https://cuhalide-atlas-v3.vercel.app';
const PRIVATE_KEYS=['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path'];

function expectNoPrivatePayload(value){
  const raw=JSON.stringify(value);
  for(const key of PRIVATE_KEYS)expect(raw).not.toContain(`\"${key}\"`);
}

function desktopOnly(testInfo){
  test.skip(testInfo.project.name!=='desktop-chromium','Public API governance is viewport invariant; run once on desktop.');
}

test('prepublication sitemap is non-enumerating on canonical and direct filesystem routes',async({request})=>{
  for(const path of ['/sitemap.xml','/api/sitemap','/api/sitemap.js']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status(),path).toBe(200);
    expect(r.headers()['x-robots-tag'],path).toBe('noindex, nofollow, noarchive');
    expect(r.headers()['x-cuhalide-publication-state'],path).toBe('prepublication-review');
    expect(r.headers()['x-cuhalide-sitemap-urls'],path).toBe('2');
    const body=await r.text();
    expect(body,path).toContain(`${PUBLIC}/motifs`);
    expect(body,path).not.toContain('/article/');
    expect(body,path).not.toContain('/structure/');
  }
});

test('public data fails closed for unknown actions on canonical and direct filesystem routes',async({request})=>{
  for(const path of ['/api/public-data','/api/public-data.js','/api/data','/api/data.js']){
    const r=await request.get(`${BASE}${path}?action=definitely-not-public`);
    expect(r.status(),path).toBe(404);
    expect(r.headers()['x-robots-tag'],path).toBe('noindex, nofollow, noarchive');
    expect(r.headers()['x-cuhalide-publication-state'],path).toBe('prepublication-review');
    const x=await r.json();
    expect(x.error,path).toMatch(/unknown public action/i);
  }
});

test('read-only public data rejects write methods without weakening governance headers',async({request})=>{
  for(const method of ['post','put','patch','delete']){
    const r=await request[method](`${BASE}/api/public-data?action=status`,{data:{probe:true}});
    expect(r.status(),method).toBe(405);
    expect(r.headers()['x-robots-tag'],method).toBe('noindex, nofollow, noarchive');
    expect(r.headers()['x-cuhalide-publication-state'],method).toBe('prepublication-review');
  }
});

test('Motif Atlas remains browse-sized through deprecated compatibility route',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=motifs&limit=500`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.ok).toBeTruthy();
  expect(Array.isArray(x.atlas?.examples)).toBeTruthy();
  expect(x.atlas.examples.length).toBeLessThanOrEqual(24);
});

test('hostile page-size requests cannot turn article, structure, or polar browsing into one-shot export',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const articles=await request.get(`${BASE}/api/public-data?action=articles&page=1&page_size=9999`);
  expect(articles.status()).toBe(200);
  const a=await articles.json();
  expect(a.pagination).toMatchObject({page:1,page_size:24,total:383,total_pages:16});
  expect(Array.isArray(a.items)).toBeTruthy();
  expect(a.items.length).toBeLessThanOrEqual(24);
  expectNoPrivatePayload(a.items);

  const structures=await request.get(`${BASE}/api/public-data?action=structures&page=1&page_size=9999`);
  expect(structures.status()).toBe(200);
  const s=await structures.json();
  expect(s.pagination).toMatchObject({page:1,page_size:50,total:946,total_pages:19});
  expect(Array.isArray(s.items)).toBeTruthy();
  expect(s.items.length).toBeLessThanOrEqual(50);
  expectNoPrivatePayload(s.items);

  const polar=await request.get(`${BASE}/api/public-data?action=polar&page=1&page_size=9999&limit=9999`);
  expect(polar.status()).toBe(200);
  const p=await polar.json();
  expect(p.pagination).toMatchObject({page:1,page_size:50,total:87,total_pages:2});
  expect(Array.isArray(p.items)).toBeTruthy();
  expect(p.items.length).toBeLessThanOrEqual(50);
  expectNoPrivatePayload(p.items);
});

test('search ignores caller attempts to inflate result windows and stays on the public field whitelist',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const r=await request.get(`${BASE}/api/public-data?action=search&q=CuI&page_size=9999&limit=9999`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(Array.isArray(x.articles)).toBeTruthy();
  expect(Array.isArray(x.structures)).toBeTruthy();
  expect(x.articles.length).toBeLessThanOrEqual(8);
  expect(x.structures.length).toBeLessThanOrEqual(12);
  expectNoPrivatePayload(x);
});

test('organic-component batch lookup is capped and bulk-like public actions fail closed',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const ids=Array.from({length:41},(_,i)=>`CUH-${String(i+1).padStart(3,'0')}-S01`).join(',');
  const batch=await request.get(`${BASE}/api/public-data?action=organic-components&structure_ids=${encodeURIComponent(ids)}`);
  expect(batch.status()).toBe(400);
  expect((await batch.json()).error).toMatch(/1-40 valid structure ids required/i);

  for(const action of ['export','download','raw','payload','verified']){
    const r=await request.get(`${BASE}/api/public-data?action=${action}`);
    expect(r.status(),action).toBe(404);
    expect((await r.json()).error,action).toMatch(/unknown public action/i);
  }
  const exportRoute=await request.get(`${BASE}/api/export`);
  expect(exportRoute.status()).toBe(410);
});

test('Motif Atlas exposes aggregate taxonomy plus bounded examples, not component inventories',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const r=await request.get(`${BASE}/api/public-data?action=motifs&limit=9999`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.ok).toBeTruthy();
  expect(x.atlas?.public_projection).toBe('motif-atlas-aggregate-v1');
  expect(x.atlas?.component_inventory_public).toBe(false);
  expect(x.atlas).not.toHaveProperty('curated_components');
  expect(x.atlas).not.toHaveProperty('label_derived_component_candidates');
  expect(Array.isArray(x.atlas?.examples)).toBeTruthy();
  expect(x.atlas.examples.length).toBeLessThanOrEqual(24);
  for(const example of x.atlas.examples){
    expect(Object.keys(example).sort()).toEqual(['dimensionality','label','motif_formula','primary_category','structure_id'].sort());
  }
  expectNoPrivatePayload(x);
});
