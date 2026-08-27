import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const API_ONLY_PROJECT='desktop-chromium';
test.describe.configure({mode:'serial'});

async function getStructure(request,id){
  const r=await request.get(`${BASE}/api/public-data?action=structure&id=${encodeURIComponent(id)}`);
  expect(r.status()).toBe(200);
  return (await r.json()).item;
}
async function getArticle(request,id){
  const r=await request.get(`${BASE}/api/public-data?action=article&id=${encodeURIComponent(id)}`);
  expect(r.status()).toBe(200);
  return (await r.json()).item;
}
async function askAgent(request,content){
  const r=await request.post(`${BASE}/api/agent`,{data:{messages:[{role:'user',content}]},timeout:90000});
  expect(r.status()).toBe(200);
  return r.json();
}
function once(testInfo,reason){test.skip(testInfo.project.name!==API_ONLY_PROJECT,reason)}

test('production backend rev.8 and activated Photophysics 1.3.3 are ready',async({request})=>{
  const r=await request.get(`${BASE}/health.json`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,status:'PASS',site_readiness:'PASS',publication_state:'prepublication-review'});
  expect(x.current_curated.live_revision).toBe(8);
  expect(x.current_curated.counts).toMatchObject({article_audit_records:383,chemically_included_articles:372,canonical_verified_articles:369,structure_phase_rows:946,core_included_structure_rows:886,resolved_space_group_rows:710,verified_space_group_rows:684,verified_polar_rows:97,strict_polar_rows:87,strict_polar_articles:54,rag_documents:1329,rag_embedded:1329});
  expect(x.photophysics).toMatchObject({ok:true,version:'1.3.3',article_queue:383,pass_a_complete_articles:383,pass_a_pending_articles:0,verified_no_data_articles:54,pass_a_curated_articles:237,two_pass_verified_articles:92,publishable_samples:940,publishable_measurements:2267,publishable_values:2988,analysis_eligible_values:281,publishable_mechanism_claims:477,publication_policy:'pass_a_curated_or_two_pass_verified'});
  expect(x.photophysics.pass_a_curated_articles+x.photophysics.two_pass_verified_articles+x.photophysics.verified_no_data_articles).toBe(383);
  expect(x.photophysics_contract_version).toBe('1.3.3');
  expect(x.smart_rag?.photophysics_contract).toBe('1.3.3');
  expect(x.research_assistant?.photophysics_contract).toBe('1.3.3');
  expect(x.checks).toMatchObject({frozen_release_contract:true,current_curated_contract:true,motif_taxonomy_contract:true,photophysics_contract:true,photophysics_staged_publication:true,photophysics_private_evidence_guard:true,rag_embeddings_complete:true,local_motif_global_dimension_separation:true});
});

test('v50 living portal exposes Current Curated rev.8',async({page,request})=>{
  const r=await request.get(`${BASE}/api/site`);expect(r.status()).toBe(200);const html=await r.text();
  expect(html).toContain('CUHALIDE_SITE_V50_CURRENT_CURATED_R8');
  expect(html).toContain('Current Curated rev.8');
  expect(html).not.toContain('Latest curated state</span><dl id="releaseDl"><div><dt>Status</dt><dd>Loading…</dd></div></dl><p class="release-note">Current Curated rev.7');
  expect(html).toContain('Curated literature · n=369');
  expect(html).toContain('Core-Included · n=886');
  expect(html).toContain('All structure / phase rows · n=946');
  const nav=await page.goto(BASE,{waitUntil:'domcontentloaded'});expect(nav?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('Current Curated rev.8');
  await expect(page.locator('body')).toContainText('946');
  await expect(page.locator('body')).toContainText('886');
});

test('manifest sitemap and Motif Atlas agree with final rev.8',async({request,page})=>{
  const m=await request.get(`${BASE}/release-manifest.json`);expect(m.status()).toBe(200);const j=await m.json();
  expect(j.publication_state).toBe('prepublication-review');
  expect(j.current_curated).toMatchObject({revision:8,curated_through:'2026-08-19',structure_phase_rows:946,core_included_structure_rows:886,resolved_space_group_rows:710,verified_space_group_rows:684,strict_polar_rows:87,strict_polar_articles:54,rag_documents:1329,motif_resolved_rows:628,motif_unresolved_rows:318});
  expect(j.runtime).toMatchObject({meta_version:'50.5',public_data_version:'2.16.0',photophysics_contract_version:'1.3.3',smart_rag_version:'9.19.0',research_assistant_version:'10.4.1'});
  expect(j.frozen_release).toMatchObject({version:'3.0.2',structure_phase_rows:878,immutable:true});
  const s=await request.get(`${BASE}/sitemap.xml`);expect(s.status()).toBe(200);expect(s.headers()['x-cuhalide-sitemap-urls']).toBe('2');
  const xml=await s.text();expect((xml.match(/<url>/g)||[]).length).toBe(2);expect(xml).not.toContain('/article/');expect(xml).not.toContain('/structure/');
  const mr=await page.goto(`${BASE}/motifs`,{waitUntil:'domcontentloaded'});expect(mr?.status()).toBe(200);await expect(page.locator('body')).toContainText('Current Curated rev.8');await expect(page.locator('body')).toContainText('628');await expect(page.locator('body')).toContainText('318');
});

test('Research Assistant reports 10.4 / 9.19 and complete rev.8 RAG',async({request})=>{
  const r=await request.get(`${BASE}/api/agent`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x.assistant_version).toBe('10.4.1');expect(x.version).toBe('9.19.0');expect(x.photophysics_contract).toBe('1.3.3');
  expect(x.current_curated).toMatchObject({layer:'current-curated-r8',live_revision:8,curated_through:'2026-08-19',documents:1329,embedded:1329});
});

test('rev.8 targeted primary-source corrections are exposed at structure and article grain',async({request},testInfo)=>{
  once(testInfo,'Structure-grain API contract is viewport invariant; run once on desktop.');
  const r285=await getStructure(request,'CUH-285-S04');
  expect(r285.dimensionality).toBe('0D');expect(r285.motif_details?.formula).toBe('Cu6I9 + Cu7I11');
  const a=await getStructure(request,'CUH-294-S01');expect(a.dimensionality).toBe('0D');expect(a.motif_details?.formula).toBe('Cu4I6');
  const b=await getStructure(request,'CUH-294-S02');expect(b.dimensionality).toBe('0D');expect(b.motif_details?.formula).toBe('Cu4I8');
  const c=await getStructure(request,'CUH-294-S03');expect(c.dimensionality).toBe('1D');expect(c.motif_details?.formula).toBe('Cu5I7');
  const article=await getArticle(request,294);const summary=String(article.structure_summary||'');
  expect(article.dimensionality_class).toBe('Mixed / series-level');
  expect(summary).toMatch(/Cu4I6/i);expect(summary).toMatch(/Cu4I8/i);expect(summary).toMatch(/Cu5I7/i);expect(summary).toMatch(/0D/i);expect(summary).toMatch(/1D/i);
});

test('Rev.7 hostile-audit corrections inherited by rev.8 remain stable',async({request},testInfo)=>{
  once(testInfo,'Structure-grain regression is viewport invariant; run once on desktop.');
  const checks=[
    ['CUH-006-S01','0D','P-1','Cu2I4'],['CUH-006-S02','0D','P2/c','Cu2I4'],
    ['CUH-060-S01','0D',null,'Cu3Br7'],['CUH-060-S03','1D',null,'Cu2Br4'],
    ['CUH-091-S02','1D','P21/n','Cu3I6'],['CUH-104-S04','1D',null,'Cu6I8'],['CUH-104-S05','2D',null,'Cu4I6'],
    ['CUH-128-S01','0D','Pna21','CuCl4'],['CUH-154-S02','0D',null,'Cu3I5'],['CUH-154-S09','0D',null,'Cu6I8'],
    ['CUH-170-S01','1D','P-1','CuBr'],['CUH-170-S02','2D','P21/c','CuBr'],['CUH-185-S04','0D',null,'Cu2Br2'],
    ['CUH-246-S01','2D','Aba2',null],['CUH-246-S03','0D',null,'Cu4I8'],['CUH-246-S05','1D',null,'Cu2I4'],
    ['CUH-328-S01','1D',null,'Cu2I4'],['CUH-328-S02','0D',null,'Cu2I6']
  ];
  for(const [id,dim,sg,motif] of checks){const x=await getStructure(request,id);expect(x.dimensionality,id).toBe(dim);if(sg)expect(x.space_group,id).toBe(sg);if(motif)expect(x.motif_details?.formula,id).toBe(motif)}
});

test('local motif versus global dimensionality boundaries remain live',async({request},testInfo)=>{
  once(testInfo,'Deterministic structure-grain boundary is viewport invariant; run once on desktop.');
  const r377=await getStructure(request,'CUH-377-S05');expect(r377.dimensionality).toBe('1D');expect(r377.motif_details?.formula).toBe('Cu2I2');
  const r186=await getStructure(request,'CUH-186-S01');expect(r186.dimensionality).toBe('3D');expect(r186.motif_details?.formula).toBe('CuBr');expect(r186.motif_details?.normalization_note).toContain('not the global dimensionality');
});

test('review/perspective placeholders stay absent and export stays disabled',async({request},testInfo)=>{
  once(testInfo,'Deleted-placeholder and export contracts are viewport invariant; run once on desktop.');
  for(const id of ['CUH-244-S01','CUH-305-S01']){const r=await request.get(`${BASE}/api/public-data?action=structure&id=${encodeURIComponent(id)}`);expect(r.status()).toBe(404)}
  const e=await request.get(`${BASE}/api/export`);expect(e.status()).toBe(410);const x=await e.json();expect(x.public_access).toBe('query-and-view');
});

test('rev.8 exact-count and identity boundaries remain deterministic',async({request},testInfo)=>{
  once(testInfo,'Read-only Assistant boundary queries are viewport invariant; run once on desktop.');test.setTimeout(240000);
  const count=await askAgent(request,'当前 CuHalide Atlas 收录多少篇 canonical verified articles 和多少条结构？');expect(count.answer).toContain('369');expect(count.answer).toContain('946');
  const dppb=await askAgent(request,'For Record 382, identify structures containing 1,2-bis(diphenylphosphino)benzene and keep it distinct from 1,4-bis(diphenylphosphino)butane.');expect(String(dppb.answer||'')).toMatch(/1,2-bis\(diphenylphosphino\)benzene/i);expect(String(dppb.answer||'')).toMatch(/1,4-bis\(diphenylphosphino\)butane/i);
});
