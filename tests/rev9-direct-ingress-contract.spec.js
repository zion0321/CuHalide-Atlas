import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const CANONICAL='https://cuhalide-atlas-v3.vercel.app';
const currentHeaders=h=>{
  expect(h['x-cuhalide-current-curated-revision']).toBe('9');
  expect(h['x-cuhalide-site-version']).toBe('51');
  expect(h['x-cuhalide-ui-version']).toBe('51.0');
  expect(h['x-cuhalide-publication-state']).toBe('prepublication-review');
  expect(h['x-robots-tag']).toContain('noindex');
};

test('direct Motif compatibility ingress cannot bypass rev.9 adapter',async({request})=>{
  const r=await request.get(`${BASE}/api/motifs.js`);expect(r.status()).toBe(200);const body=await r.text();
  expect(body).toContain('Current Curated rev.9');expect(body).toContain('947-row taxonomy');expect(body).not.toContain('Current Curated rev.8');expect(body).not.toContain('· rev.8');currentHeaders(r.headers());
});

test('direct metadata compatibility ingress is rev.9 PASS rather than stale gateway',async({request})=>{
  const r=await request.get(`${BASE}/api/meta.js?action=health`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',current_curated_revision:9,site_version:'51',ui_version:'51.0',meta_version:'51.0',public_data_version:'2.17.1',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0'});currentHeaders(r.headers());
});

test('legacy data ingress is minimized rev.9 public data with deprecation warning',async({request})=>{
  const r=await request.get(`${BASE}/api/data.js?action=organic-components-health`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,contract_version:'1.2.0',current_curated_revision:9,representation_rows:965,verified_connectivity_rows:61,unresolved_rows:894,not_applicable_rows:10});const h=r.headers();currentHeaders(h);expect(h['x-cuhalide-public-data-version']).toBe('2.17.1');expect(h['x-cuhalide-photophysics-contract']).toBe('1.4.0');expect(h['x-cuhalide-organic-components-contract']).toBe('1.2.0');expect(h.warning||'').toContain('Legacy /api/data route');
});

test('direct sitemap is rev.9, canonical, and remains non-enumerating',async({request})=>{
  const r=await request.get(`${BASE}/api/sitemap.js`);expect(r.status()).toBe(200);const xml=await r.text();
  expect(xml).toContain(`<loc>${CANONICAL}/</loc>`);expect(xml).toContain(`<loc>${CANONICAL}/motifs</loc>`);expect(xml).not.toContain(`http://127.0.0.1:4173`);expect(xml).not.toContain('/article/');expect(xml).not.toContain('/structure/');expect((xml.match(/<url>/g)||[]).length).toBe(2);currentHeaders(r.headers());expect(r.headers()['x-cuhalide-sitemap-scope']).toBe('prepublication-non-enumerating');
});

test('direct public-data and record compatibility paths stay on current contracts',async({request})=>{
  const d=await request.get(`${BASE}/api/public-data.js?action=article&id=91`);expect(d.status()).toBe(200);const x=await d.json();expect(x.current_curated_revision).toBe(9);expect(x.item).toMatchObject({record_id:91,article_index_class:'0D',dimensionality_field_semantics:'article_index_class_not_structure_grain'});currentHeaders(d.headers());
  const r=await request.get(`${BASE}/api/record.js?kind=structure&id=CUH-091-S02`);expect(r.status()).toBe(200);const html=await r.text();expect(html).toContain('Current Curated rev.9');expect(html).toContain('<dt>Dimensionality</dt><dd>1D</dd>');currentHeaders(r.headers());
});
