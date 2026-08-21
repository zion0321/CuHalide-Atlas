import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

test.describe.configure({mode:'serial'});

async function askAgent(request,content){
  const response=await request.post(`${BASE}/api/agent`,{data:{messages:[{role:'user',content}]},timeout:90_000});
  expect(response.status()).toBe(200);
  return response.json();
}

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
    const raw=JSON.stringify(source);
    for(const forbidden of ['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path'])expect(raw).not.toContain(forbidden);
  }
});
