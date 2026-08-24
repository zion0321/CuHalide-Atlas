import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

test.describe.configure({mode:'serial'});

function assertNoPrivateEvidence(value){const forbidden=new Set(['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id']);const walk=x=>{if(Array.isArray(x)){for(const y of x)walk(y);return}if(x&&typeof x==='object'){for(const[k,v]of Object.entries(x)){expect(forbidden.has(k),`private response key exposed: ${k}`).toBe(false);walk(v)}}};walk(value)}

test('frozen-origin article keeps origin while declaring current serving and photophysics context',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=article&id=46`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.data_scope).toBe('frozen_release');
  expect(x.item?.curation_layer).toBe('Frozen Release');
  expect(x.item?.live_revision).toBe(0);
  expect(x.photophysics?.public_state).toBe('pass_a_curated');
  expect(x.record_context).toEqual({
    serving_context:'current_curated',
    serving_revision:7,
    core_record_origin:'frozen_release',
    core_record_origin_release:'3.0.2',
    core_record_origin_revision:null,
    attached_photophysics_context:'current_curated',
    attached_photophysics_contract:'1.3.0',
    context_policy:'core_origin_preserved_current_overlays_explicit'
  });
  assertNoPrivateEvidence(x);
});

test('current-origin article uses the same serving contract without inventing a frozen origin',async({request})=>{
  const r=await request.get(`${BASE}/api/public-data?action=article&id=381`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.data_scope).toBe('current_curated');
  expect(x.item?.curation_layer).toBe('Current Curated');
  expect(x.photophysics?.public_state).toBe('two_pass_verified');
  expect(x.record_context?.serving_context).toBe('current_curated');
  expect(x.record_context?.serving_revision).toBe(7);
  expect(x.record_context?.core_record_origin).toBe('current_curated');
  expect(x.record_context?.core_record_origin_release).toBeNull();
  expect(x.record_context?.core_record_origin_revision).toBeGreaterThan(0);
  expect(x.record_context?.attached_photophysics_context).toBe('current_curated');
  expect(x.record_context?.attached_photophysics_contract).toBe('1.3.0');
  expect(x.record_context?.context_policy).toBe('core_origin_preserved_current_overlays_explicit');
  assertNoPrivateEvidence(x);
});