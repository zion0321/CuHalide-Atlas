import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const forbidden=['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path'];

test.describe.configure({mode:'serial'});

async function askAgent(request,content){
  const response=await request.post(`${BASE}/api/agent`,{data:{messages:[{role:'user',content}]},timeout:90_000});
  expect(response.status()).toBe(200);
  return response.json();
}

function expectNoPrivatePayload(value){
  const raw=JSON.stringify(value);
  for(const key of forbidden)expect(raw).not.toContain(`\"${key}\"`);
}

test('Research Assistant health is aligned to staged photophysics 1.3.3 baseline',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Read-only RAG contract is viewport invariant.');
  const response=await request.get(`${BASE}/api/agent`,{timeout:30_000});
  expect(response.status()).toBe(200);
  const x=await response.json();
  expect(x.ok).toBe(true);
  expect(x.version).toBe('9.19.0');
  expect(x.assistant_version).toBe('10.4.1');
  expect(x.photophysics).toMatchObject({
    ok:true,
    version:'1.3.3',
    publication_policy:'pass_a_curated_or_two_pass_verified',
    article_queue:383,
    pass_a_complete_articles:383,
    pass_a_pending_articles:0,
    verified_no_data_articles:54,
    publishable_samples:940,
    publishable_measurements:2262,
    publishable_values:2985,
    analysis_eligible_values:281,
    publishable_mechanism_claims:477,
    staged_publication:true,
    two_pass_status_preserved:true,
    conflicts_fail_closed:true,
    primary_files_exposed:false,
    raw_evidence_locators_exposed:false
  });
  expect(Number.isInteger(x.photophysics.pass_a_curated_articles)).toBe(true);
  expect(Number.isInteger(x.photophysics.two_pass_verified_articles)).toBe(true);
  expect(x.photophysics.pass_a_curated_articles).toBeGreaterThanOrEqual(0);
  expect(x.photophysics.two_pass_verified_articles).toBeGreaterThanOrEqual(0);
  expect(x.photophysics.pass_a_curated_articles+x.photophysics.two_pass_verified_articles+x.photophysics.verified_no_data_articles).toBe(x.photophysics.article_queue);
  expect(x.photophysics.pass_a_complete_articles).toBe(x.photophysics.article_queue);
});

test('two-pass Record 46 PLQY preserves article grain without false structure mapping',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Read-only RAG contract is viewport invariant.');
  test.setTimeout(120_000);
  const x=await askAgent(request,'What is the PLQY for Record 46? Keep the verification stage explicit.');
  expect(x.mode).toBe('deterministic-scientific-data');
  expect(x.photophysics_contract).toBe('1.3.3');
  const recordLine=String(x.answer||'').split('\n').find(line=>line.includes('[A:46]'));
  expect(recordLine).toBeTruthy();
  expect(recordLine).toContain('PLQY 41.5 %');
  expect(recordLine).toContain('two-pass verified');
  expect(recordLine).not.toContain('Pass A curated');
  expect(Array.isArray(x.sources)).toBe(true);
  expect(x.sources.length).toBeGreaterThan(0);
  const source=x.sources.find(s=>s.record_id===46);
  expect(source).toMatchObject({
    type:'article',
    id:46,
    record_id:46,
    sample_form:'unresolved',
    mapping_status:'compound_exact',
    property_scope:'article_level',
    photophysics_analysis_eligible:false,
    verification_stage:'two_pass_verified',
    two_pass_verified:true,
    evidence_scope:'two-pass verified structured scientific data'
  });
  expect(source).not.toHaveProperty('structure_id');
  expectNoPrivatePayload(x.sources);
  expectNoPrivatePayload(x.scientific_query?.rows||[]);
});

test('two-pass Record 381 PLQY preserves two-pass identity and structure grain',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Read-only RAG contract is viewport invariant.');
  test.setTimeout(120_000);
  const x=await askAgent(request,'What are the PLQY values for Record 381? Keep verification stage and structure mapping explicit.');
  expect(x.mode).toBe('deterministic-scientific-data');
  expect(x.photophysics_contract).toBe('1.3.3');
  expect(x.answer).toContain('89.84 %');
  expect(x.answer).toContain('91.09 %');
  expect(x.answer).toContain('two-pass verified');
  expect(Array.isArray(x.sources)).toBe(true);
  expect(x.sources).toHaveLength(2);
  for(const source of x.sources){
    expect(source).toMatchObject({
      record_id:381,
      sample_form:'crystal',
      mapping_status:'structure_exact',
      property_scope:'intrinsic_bulk',
      photophysics_analysis_eligible:true,
      verification_stage:'two_pass_verified',
      two_pass_verified:true,
      evidence_scope:'two-pass verified structured scientific data'
    });
    expect(['CUH-381-S01','CUH-381-S02']).toContain(source.id);
  }
  expectNoPrivatePayload(x.sources);
  expectNoPrivatePayload(x.scientific_query?.rows||[]);
});

test('record 372 g_lum RAG resolves canonical property key and preserves KBr-composite grain',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Read-only RAG contract is viewport invariant.');
  test.setTimeout(120_000);
  const x=await askAgent(request,'What are the g_lum values for record 372? Keep the measured sample state explicit.');
  expect(x.mode).toBe('deterministic-photophysics');
  expect(x.answer).toContain('g_lum');
  for(const value of ['0.002','-0.0015','0.0016','-0.0018','0.00096','-0.00092','0.0023','-0.0022'])expect(x.answer).toContain(value);
  expect(x.answer).toContain('not quantitative-correlation eligible');
  expect(Array.isArray(x.sources)).toBe(true);
  expect(x.sources).toHaveLength(8);
  for(const source of x.sources){
    expect(source).toMatchObject({
      type:'article',
      id:372,
      record_id:372,
      sample_form:'composite',
      mapping_status:'compound_exact',
      property_scope:'composite',
      photophysics_analysis_eligible:false,
      evidence_scope:'two-pass verified structured photophysics'
    });
    expect(source.title).toContain('KBr-ground CPL composite');
    expect(source).not.toHaveProperty('structure_id');
  }
  expectNoPrivatePayload(x.sources);
});
