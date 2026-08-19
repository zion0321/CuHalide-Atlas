import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

// Temporary compatibility bridge for deployment_status runs whose workflow
// definition is still read from pre-merge main (rev.6). The historical grep
// titles are intentionally retained, but every assertion below requires the
// final rev.7 scientific/runtime contract. Remove after rev.7 is on main.

test('v50 living portal exposes Current Curated rev.6',async({request})=>{
  const r=await request.get(`${BASE}/api/site`);
  expect(r.status()).toBe(200);
  const html=await r.text();
  expect(html).toContain('CUHALIDE_SITE_V50_CURRENT_CURATED_R7');
  expect(html).toContain('Current Curated rev.7');
  expect(html).toContain('All structure / phase rows · n=946');
});

test('runtime health is exact rev.6 contract',async({request})=>{
  const r=await request.get(`${BASE}/health.json`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS'});
  expect(x.current_curated.live_revision).toBe(7);
  expect(x.current_curated.current_curated_through).toBe('2026-08-19');
  expect(x.current_curated.counts).toMatchObject({structure_phase_rows:946,core_included_structure_rows:886,verified_space_group_rows:684,strict_polar_rows:87,rag_documents:1329,rag_embedded:1329});
  expect(x.motif_atlas).toMatchObject({taxonomy_rows:946,resolved:628,unresolved:318,unresolved_legacy_category_rows:35});
});

test('manifest, sitemap and Motif Atlas agree with rev.6',async({request})=>{
  const r=await request.get(`${BASE}/release-manifest.json`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.current_curated).toMatchObject({revision:7,curated_through:'2026-08-19',structure_phase_rows:946,motif_resolved_rows:628,motif_unresolved_rows:318});
  expect(x.runtime).toMatchObject({public_data_version:'2.14.0',smart_rag_version:'9.19.0',research_assistant_version:'10.4.0'});
});

test('Research Assistant reports 10.3 / 9.18 and rev.6 full-current RAG',async({request})=>{
  const r=await request.get(`${BASE}/api/agent`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.assistant_version).toBe('10.4.0');
  expect(x.version).toBe('9.19.0');
  expect(x.current_curated).toMatchObject({layer:'current-curated-r7',live_revision:7,curated_through:'2026-08-19',documents:1329,embedded:1329});
});

test('new structure-truth boundaries are live',async({request})=>{
  const get=async id=>{const r=await request.get(`${BASE}/api/public-data?action=structure&id=${encodeURIComponent(id)}`);expect(r.status()).toBe(200);return(await r.json()).item};
  const pzacn=await get('CUH-328-S01');
  expect(pzacn).toMatchObject({label:'PZ-ACN',formula:'C4H12Cu2I4N2',dimensionality:'1D',ccdc_cif:'2444174'});
  expect(pzacn.motif_details?.formula).toBe('Cu2I4');
  const pzhi=await get('CUH-328-S02');
  expect(pzhi).toMatchObject({label:'PZ-HI',formula:'C8H26Cu2I6N4O',dimensionality:'0D',ccdc_cif:'2402042'});
  expect(pzhi.motif_details?.formula).toBe('Cu2I6');
});

test('rev.6 primary-evidence boundaries remain deterministic',async({request})=>{
  const get=async id=>{const r=await request.get(`${BASE}/api/public-data?action=structure&id=${encodeURIComponent(id)}`);expect(r.status()).toBe(200);return(await r.json()).item};
  const low=await get('CUH-006-S01');
  expect(low).toMatchObject({dimensionality:'0D',space_group:'P-1'});
  expect(low.motif_details?.formula).toBe('Cu2I4');
  const mixed=await get('CUH-165-S02');
  expect(mixed.dimensionality).toBe('0D');
  expect(mixed.motif_details?.formula).toBe('Unresolved');
});
