import {test,expect} from '@playwright/test';
import {assertPhotophysicsHealth} from '../lib/photophysics-contract.js';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const FORBIDDEN=new Set(['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path','article_notes','reviewer_basis']);

test.describe.configure({mode:'serial'});

function desktopOnly(testInfo){test.skip(testInfo.project.name!=='desktop-chromium','Structured-science migration regression is viewport invariant; run once on desktop.');}
function noPrivate(value){const walk=x=>{if(Array.isArray(x)){for(const y of x)walk(y);return}if(x&&typeof x==='object'){for(const[k,v]of Object.entries(x)){expect(FORBIDDEN.has(k),`private response key exposed: ${k}`).toBe(false);walk(v)}return}if(typeof x==='string')expect(x.toLowerCase()).not.toContain('atlas_internal')};walk(value)}
function sampleBy(x,predicate,label){const rows=(x.samples||[]).filter(predicate);expect(rows,`expected exactly one ${label} sample`).toHaveLength(1);return rows[0]}
function measurements(sample,type){return(sample?.measurements||[]).filter(m=>m.measurement_type===type)}
function values(sample,key){return(sample?.measurements||[]).flatMap(m=>m.values||[]).filter(v=>v.property_key===key)}

async function health(request){
  const r=await request.get(`${BASE}/api/public-data?action=photophysics-health`);
  expect(r.status()).toBe(200);
  const x=await r.json();
  const state=assertPhotophysicsHealth(x);
  expect(r.headers()['x-cuhalide-photophysics-contract']).toBe(state.version);
  noPrivate(x);
  return{x,state};
}

async function record297(request,version){
  const r=await request.get(`${BASE}/api/public-data?action=photophysics&id=297`);
  expect(r.status()).toBe(200);
  expect(r.headers()['x-cuhalide-photophysics-contract']).toBe(version);
  const x=await r.json();
  expect(x).toMatchObject({ok:true,record_id:297,version,current_curated_revision:7,publication_state:'prepublication-review',pass_a_complete:true,photophysics_scope:'in_scope'});
  noPrivate(x);
  return x;
}

test('Record 297 is exact on either side of the controlled 1.3.2 to 1.3.3 activation boundary',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const{state}=await health(request);
  const x=await record297(request,state.version);
  expect(x.counts.samples).toBe(4);
  expect(x.counts.conflicts).toBe(0);

  const compound1Structure=sampleBy(x,s=>s.structure_id==='CUH-297-S04','compound-1 structure-exact');
  const compound1Variable=sampleBy(x,s=>s.reported_compound_label==='(Me-PySMe)n[Cu2I3]n compound 1'&&!s.structure_id,'compound-1 variable-temperature');
  const compound2Structure=sampleBy(x,s=>s.structure_id==='CUH-297-S03','compound-2 structure-exact');

  const c1pl=measurements(compound1Structure,'steady_state_pl');
  expect(c1pl).toHaveLength(1);
  expect((c1pl[0].bands||[]).map(b=>b.peak_nm).sort((a,b)=>a-b)).toEqual([550,680]);
  expect(c1pl[0].mechanisms).toHaveLength(2);
  for(const mechanism of c1pl[0].mechanisms){
    expect(mechanism).toMatchObject({claim_basis:'author_assignment',claim_polarity:'supported',analysis_eligible:false,evidence_confidence:'Medium'});
  }

  const c1Temp=measurements(compound1Variable,'temperature_dependent_pl');
  expect(c1Temp).toHaveLength(1);

  if(state.version==='1.3.2'){
    expect(x).toMatchObject({public_state:'pass_a_curated',review_status:'extracted',two_pass_verified:false,verification_stage:'pass_a_curated'});
    expect(x.counts).toEqual({values:7,samples:4,conflicts:0,measurements:7});
    expect(c1pl[0]).not.toHaveProperty('excitation_nm');
    expect(c1Temp[0]).not.toHaveProperty('excitation_nm');
    expect(measurements(compound1Structure,'absorption')).toHaveLength(0);
    expect(measurements(compound2Structure,'absorption')).toHaveLength(0);
    expect(measurements(compound1Variable,'excitation_spectrum')).toHaveLength(0);
    expect(measurements(compound1Variable,'time_resolved_pl')).toHaveLength(0);
    expect(values(compound1Variable,'ple_observation')).toHaveLength(0);
    return;
  }

  expect(state.version).toBe('1.3.3');
  expect(x).toMatchObject({public_state:'two_pass_verified',review_status:'qc_passed',two_pass_verified:true,verification_stage:'two_pass_verified'});
  expect(x.counts).toEqual({values:10,samples:4,conflicts:0,measurements:12});
  expect(c1pl[0].excitation_nm).toBe(440);
  expect(c1Temp[0].excitation_nm).toBe(440);

  const abs1=measurements(compound1Structure,'absorption');
  const abs2=measurements(compound2Structure,'absorption');
  expect(abs1).toHaveLength(1);expect(abs2).toHaveLength(1);
  for(const m of [...abs1,...abs2]){
    expect(m.values).toHaveLength(0);
    expect(m.bands).toHaveLength(0);
    expect(m.quantitative_analysis_eligible).toBe(false);
    expect(m.conditions).toContain('Kubelka-Munk');
  }

  const c1Ple=measurements(compound1Variable,'excitation_spectrum');
  expect(c1Ple).toHaveLength(2);
  expect(c1Ple.map(m=>m.monitoring_nm).sort((a,b)=>a-b)).toEqual([550,680]);
  for(const m of c1Ple){
    expect(m).not.toHaveProperty('excitation_nm');
    expect(m.bands).toHaveLength(0);
    expect(m.quantitative_analysis_eligible).toBe(false);
    expect(m.values).toHaveLength(1);
    expect(m.values[0]).toMatchObject({property_key:'ple_observation',analysis_eligible:false});
    expect(m.values[0]).not.toHaveProperty('value_numeric');
  }

  const c1Trpl=measurements(compound1Variable,'time_resolved_pl');
  expect(c1Trpl).toHaveLength(1);
  expect(c1Trpl[0]).toMatchObject({excitation_nm:390,monitoring_nm:680,quantitative_analysis_eligible:false});
  expect(c1Trpl[0].bands).toHaveLength(0);
  expect(c1Trpl[0].values).toHaveLength(1);
  expect(c1Trpl[0].values[0]).toMatchObject({property_key:'temperature_dependence_observation',analysis_eligible:false});
  expect(c1Trpl[0].values[0]).not.toHaveProperty('value_numeric');
});

test('Research Assistant contract follows the same live photophysics activation state',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const{state}=await health(request);
  const r=await request.get(`${BASE}/api/agent`,{timeout:30_000});
  expect(r.status()).toBe(200);
  const x=await r.json();
  expect(x.ok).toBe(true);
  expect(x.photophysics?.version).toBe(state.version);
  noPrivate(x);
});
