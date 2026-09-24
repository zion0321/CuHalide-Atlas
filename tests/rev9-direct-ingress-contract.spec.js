import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const CANONICAL='https://cuhalide-atlas-v3.vercel.app';
const currentHeaders=h=>{
  expect(h['x-cuhalide-current-curated-revision']).toBe('10');
  expect(h['x-cuhalide-site-version']).toBe('52');
  expect(h['x-cuhalide-ui-version']).toBe('52.0');
  expect(h['x-cuhalide-publication-state']).toBe('prepublication-review');
  expect(h['x-robots-tag']).toContain('noindex');
};

test('direct Motif compatibility ingress cannot bypass rev.10 adapter',async({request})=>{
  const r=await request.get(`${BASE}/api/motifs.js`);expect(r.status()).toBe(200);const body=await r.text();
  expect(body).toContain('<meta name="cuhalide-current-curated-revision" content="10">');expect(body).toContain('Source-resolved motifs');expect(body).toContain('>939<');expect(body).toContain('>677<');expect(body).not.toContain('Unresolved legacy mapping');expect(body).not.toContain('Current Curated rev.9');expect(body).not.toContain('· rev.9');currentHeaders(r.headers());
});

test('direct metadata compatibility ingress is rev.10 PASS rather than stale gateway',async({request})=>{
  const r=await request.get(`${BASE}/api/meta.js?action=health`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',current_curated_revision:10,site_version:'52',ui_version:'52.0',meta_version:'52.1',public_data_version:'2.18.0',photophysics_contract_version:'1.4.0',organic_components_contract_version:'1.2.0'});expect(x.cuxplore).toMatchObject({ok:true,version:'10.6.0',knowledge_contract:'1.3.0',semantic_index_version:'10.0.0',semantic_records:1322,semantic_embedded:1322});expect(x.cuxplore.source_index).toMatchObject({doi_records:403,documents:727,text_blocks:6275,indexed_through:'2026-09-24'});expect(x.cif_reconciliation).toMatchObject({registered_files:114,parsed_files:114,authority_overwritten:false});expect(x.smart_rag).toBeUndefined();expect(x.research_assistant).toBeUndefined();currentHeaders(r.headers());
});

test('legacy data ingress is minimized rev.10 public data with deprecation warning',async({request})=>{
  const r=await request.get(`${BASE}/api/data.js?action=organic-components-health`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,contract_version:'1.2.0',current_curated_revision:10,representation_rows:968,represented_structures:911,verified_connectivity_rows:61,unresolved_rows:897,not_applicable_rows:10});const h=r.headers();currentHeaders(h);expect(h['x-cuhalide-public-data-version']).toBe('2.18.0');expect(h['x-cuhalide-photophysics-contract']).toBe('1.4.0');expect(h['x-cuhalide-organic-components-contract']).toBe('1.2.0');expect(h.warning||'').toContain('Legacy /api/data route');
});

test('direct sitemap is rev.10, canonical, and remains non-enumerating',async({request})=>{
  const r=await request.get(`${BASE}/api/sitemap.js`);expect(r.status()).toBe(200);const xml=await r.text();
  expect(xml).toContain(`<loc>${CANONICAL}/</loc>`);expect(xml).toContain(`<loc>${CANONICAL}/motifs</loc>`);expect(xml).not.toContain(`http://127.0.0.1:4173`);expect(xml).not.toContain('/article/');expect(xml).not.toContain('/structure/');expect(xml).toContain('<lastmod>2026-09-24</lastmod>');expect((xml.match(/<url>/g)||[]).length).toBe(2);currentHeaders(r.headers());expect(r.headers()['x-cuhalide-sitemap-scope']).toBe('prepublication-non-enumerating');
});

test('direct public-data and record compatibility paths stay on rev.10 contracts',async({request})=>{
  const d=await request.get(`${BASE}/api/public-data.js?action=article&id=91`);expect(d.status()).toBe(200);const x=await d.json();expect(x.current_curated_revision).toBe(10);expect(x.item).toMatchObject({record_id:91,article_index_class:'0D',dimensionality_field_semantics:'article_index_class_not_structure_grain'});currentHeaders(d.headers());
  const r=await request.get(`${BASE}/api/record.js?kind=structure&id=CUH-091-S02`);expect(r.status()).toBe(200);const html=await r.text();expect(html).toContain('Curated through 14 Sep 2026');expect(html).toContain('<dt>Dimensionality</dt><dd>1D</dd>');currentHeaders(r.headers());
});
