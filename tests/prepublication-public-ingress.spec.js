import { test, expect } from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'https://cuhalide-atlas-v3.vercel.app';
const PUBLIC='https://cuhalide-atlas-v3.vercel.app';

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
