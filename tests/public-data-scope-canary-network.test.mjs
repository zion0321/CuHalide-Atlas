import test from 'node:test';
import assert from 'node:assert/strict';

const BASE='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3-scope-canary';

async function structure(id){
  const u=new URL(BASE);u.searchParams.set('action','structure');u.searchParams.set('id',id);
  const r=await fetch(u,{headers:{accept:'application/json','user-agent':'CuHalide-Atlas-Scope-Canary-QA/1.0'},signal:AbortSignal.timeout(20000)});
  assert.equal(r.status,200,`${id} canary status`);
  return r.json();
}

test('scope canary separates parent-article verification from zero structure mapping',async()=>{
  const x=await structure('CUH-006-S01'),p=x.photophysics||{};
  assert.equal(p.public_state,'two_pass_verified');
  assert.equal(p.public_state_scope,'parent_article');
  assert.equal(p.parent_article_verification_stage,'two_pass_verified');
  assert.equal(p.structure_mapping_state,'no_structure_mapped_data');
  assert.equal(p.structure_mapping_sample_count,0);
  assert.equal(p.structure_mapping_policy,'parent_article_verification_separate_from_structure_mapping');
});

test('scope canary preserves structure-exact mapped samples',async()=>{
  const x=await structure('CUH-381-S01'),p=x.photophysics||{};
  assert.equal(p.public_state,'two_pass_verified');
  assert.equal(p.public_state_scope,'parent_article');
  assert.equal(p.parent_article_verification_stage,'two_pass_verified');
  assert.equal(p.structure_mapping_state,'mapped_samples_present');
  assert.ok(Number(p.structure_mapping_sample_count)>0);
  assert.ok(Array.isArray(p.samples)&&p.samples.length>0);
  assert.equal(p.samples[0]?.mapping_status,'structure_exact');
});
