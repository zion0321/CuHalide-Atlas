import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const FORBIDDEN=new Set(['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path']);

test.describe.configure({mode:'serial'});

function desktopOnly(testInfo){test.skip(testInfo.project.name!=='desktop-chromium','Structured-science API/RAG regression is viewport invariant; run once on desktop.');}
function noPrivate(value){const walk=x=>{if(Array.isArray(x)){for(const y of x)walk(y);return}if(x&&typeof x==='object'){for(const[k,v]of Object.entries(x)){expect(FORBIDDEN.has(k),`private response key exposed: ${k}`).toBe(false);walk(v)}return}if(typeof x==='string')expect(x.toLowerCase()).not.toContain('atlas_internal')};walk(value)}
async function photo(request,id){const r=await request.get(`${BASE}/api/public-data?action=photophysics&id=${id}`);expect(r.status()).toBe(200);expect(r.headers()['x-cuhalide-photophysics-contract']).toBe('1.3.3');const x=await r.json();expect(x).toMatchObject({ok:true,record_id:id,version:'1.3.3',public_state:'two_pass_verified',review_status:'qc_passed',pass_a_complete:true,two_pass_verified:true,verification_stage:'two_pass_verified',current_curated_revision:7,publication_state:'prepublication-review'});noPrivate(x);return x}
function measurement(sample,type){const items=(sample?.measurements||[]).filter(m=>m.measurement_type===type);expect(items,`expected exactly one ${type} measurement`).toHaveLength(1);return items[0]}
function valueBy(m,key){const items=(m?.values||[]).filter(v=>v.property_key===key);expect(items,`expected exactly one ${key} value`).toHaveLength(1);return items[0]}
function bandBy(m,domain){const items=(m?.bands||[]).filter(b=>b.domain===domain);expect(items,`expected exactly one ${domain} band`).toHaveLength(1);return items[0]}
async function ask(request,content){const r=await request.post(`${BASE}/api/agent`,{data:{messages:[{role:'user',content}]},timeout:90_000});expect(r.status()).toBe(200);const x=await r.json();noPrivate(x);return x}

test('1.3.2 corrected science remains exact under the controlled 1.3.3 migration while verification-stage split stays dynamic',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const r=await request.get(`${BASE}/api/public-data?action=photophysics-health`);
  expect(r.status()).toBe(200);
  expect(r.headers()['x-cuhalide-photophysics-contract']).toBe('1.3.3');
  const x=await r.json();
  expect(x).toMatchObject({ok:true,version:'1.3.3',article_queue:383,pass_a_complete_articles:383,pass_a_pending_articles:0,verified_no_data_articles:54,publishable_samples:940,analysis_eligible_values:281,publishable_mechanism_claims:477,publication_policy:'pass_a_curated_or_two_pass_verified'});
  const staged=x.publishable_measurements===2262&&x.publishable_values===2985;
  const activated=x.publishable_measurements===2267&&x.publishable_values===2988;
  expect(staged||activated).toBe(true);
  expect(Number.isInteger(x.pass_a_curated_articles)).toBe(true);
  expect(Number.isInteger(x.two_pass_verified_articles)).toBe(true);
  expect(x.pass_a_curated_articles).toBeGreaterThanOrEqual(0);
  expect(x.two_pass_verified_articles).toBeGreaterThanOrEqual(0);
  expect(x.pass_a_curated_articles+x.two_pass_verified_articles+x.verified_no_data_articles).toBe(x.article_queue);
  expect(x.checks).toMatchObject({invalid_published_pass_a_gate:0,ineligible_measurement_projection_leaks:0,raw_primary_files_exposed:false,raw_evidence_locators_exposed:false,two_pass_status_preserved:true,conflicts_fail_closed:true});
  noPrivate(x);
});

test('Record 310 keeps PLE, stability, intrinsic emission/mechanism and device CRI at their correct grains',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const x=await photo(request,310);
  expect(x.counts).toEqual({values:5,samples:2,conflicts:0,measurements:4});
  const crystal=x.samples.find(s=>s.property_scope==='intrinsic_bulk');
  const device=x.samples.find(s=>s.property_scope==='device');
  expect(crystal).toMatchObject({sample_form:'crystal',structure_id:'CUH-310-S01',mapping_status:'structure_exact',property_scope:'intrinsic_bulk'});
  expect(device).toMatchObject({sample_form:'device',mapping_status:'compound_exact',property_scope:'device'});
  expect(device).not.toHaveProperty('structure_id');
  const pl=measurement(crystal,'steady_state_pl');
  expect(bandBy(pl,'emission').peak_nm).toBe(489);
  expect(valueBy(pl,'plqy')).toMatchObject({value_numeric:26.66,unit:'%'});
  expect(valueBy(pl,'stokes_shift')).toMatchObject({value_numeric:198,unit:'nm'});
  expect(pl.mechanisms).toHaveLength(1);
  expect(pl.mechanisms[0]).toMatchObject({mechanism_code:'STE',claim_scope:'emission_band',claim_polarity:'supported',claim_basis:'computationally_supported',analysis_eligible:false});
  const ple=measurement(crystal,'excitation_spectrum');
  expect(bandBy(ple,'excitation')).toMatchObject({peak_nm:291,assignment:'source-reported photoluminescence-excitation maximum'});
  expect(ple.values).toHaveLength(0);
  const stability=measurement(crystal,'stability_pl');
  expect(valueBy(stability,'immersion_duration')).toMatchObject({value_numeric:336,unit:'h'});
  const outcome=valueBy(stability,'pl_stability_outcome');
  expect(outcome.value_text).toContain('maintained to some extent');
  expect(outcome).not.toHaveProperty('value_numeric');
  const led=measurement(device,'down_conversion_led');
  expect(valueBy(led,'color_rendering_index').value_numeric).toBe(95);
  expect(JSON.stringify(device)).not.toContain('CUH-310-S01');
});

test('Record 312 adds the source-reported 180 nm FWHM without inventing structure or mechanism assignments',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const x=await photo(request,312);
  expect(x.counts).toEqual({values:4,samples:2,conflicts:0,measurements:3});
  const intrinsic=x.samples.find(s=>s.property_scope==='intrinsic_bulk');
  const device=x.samples.find(s=>s.property_scope==='device');
  expect(intrinsic).toMatchObject({sample_form:'crystal',mapping_status:'compound_exact',property_scope:'intrinsic_bulk'});
  expect(intrinsic).not.toHaveProperty('structure_id');
  expect(device).toMatchObject({sample_form:'device',mapping_status:'compound_exact',property_scope:'device'});
  expect(device).not.toHaveProperty('structure_id');
  const pl=measurement(intrinsic,'steady_state_pl');
  expect(pl.excitation_nm).toBe(460);
  expect(bandBy(pl,'emission')).toMatchObject({peak_nm:625,fwhm_nm:180,assignment:'source-reported orange-red emission'});
  expect(pl.mechanisms).toHaveLength(0);
  const stability=measurement(intrinsic,'stability_pl');
  expect(valueBy(stability,'immersion_duration')).toMatchObject({value_numeric:1440,unit:'h'});
  expect(valueBy(stability,'pl_stability_outcome').value_text).toContain('remains unchanged');
  const led=measurement(device,'down_conversion_led');
  expect(led.excitation_nm).toBe(440);
  expect(valueBy(led,'color_rendering_index').value_numeric).toBe(91.4);
});

test('Record 313 keeps 302 nm as an excitation condition, preserves article grain, and separates steady-state, stability and TRPL',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const x=await photo(request,313);
  expect(x.counts).toEqual({values:6,samples:1,conflicts:0,measurements:3});
  const sample=x.samples[0];
  expect(sample).toMatchObject({sample_form:'crystal',mapping_status:'compound_exact',property_scope:'intrinsic_bulk'});
  expect(sample).not.toHaveProperty('structure_id');
  expect(JSON.stringify(x)).not.toContain('CUH-313-S');
  const pl=measurement(sample,'steady_state_pl');
  expect(pl.excitation_nm).toBe(302);
  expect(bandBy(pl,'emission')).toMatchObject({peak_nm:558,fwhm_nm:108,assignment:'source-reported yellow emission band'});
  expect(valueBy(pl,'plqy')).toMatchObject({value_numeric:15.17,unit:'%'});
  expect(valueBy(pl,'stokes_shift')).toMatchObject({value_numeric:254,unit:'nm'});
  expect((sample.measurements||[]).filter(m=>m.measurement_type==='excitation_spectrum')).toHaveLength(0);
  const excitationBands=(sample.measurements||[]).flatMap(m=>m.bands||[]).filter(b=>b.domain==='excitation');
  expect(excitationBands).toHaveLength(0);
  const stability=measurement(sample,'stability_pl');
  expect(valueBy(stability,'immersion_duration')).toMatchObject({value_numeric:24,unit:'h'});
  const retention=valueBy(stability,'pl_intensity_retention');
  expect(retention).toMatchObject({value_numeric:94,unit:'%'});
  expect(retention.qualifier).toContain('>');
  const trpl=measurement(sample,'time_resolved_pl');
  expect(trpl.monitoring_nm).toBe(558);
  expect(valueBy(trpl,'average_lifetime')).toMatchObject({value_numeric:84.63,unit:'us'});
  expect(trpl.bands).toHaveLength(0);
});

test('Record 333 preserves distinct optical-gap, phase-transition, melting/decomposition and 260 C stability-threshold evidence',async({request},testInfo)=>{
  desktopOnly(testInfo);
  const x=await photo(request,333);
  expect(x.counts).toEqual({values:6,samples:1,conflicts:0,measurements:2});
  const sample=x.samples[0];
  expect(sample).toMatchObject({sample_form:'crystal',structure_id:'CUH-333-S01',mapping_status:'structure_exact',property_scope:'intrinsic_bulk'});
  const absorption=measurement(sample,'absorption');
  expect(valueBy(absorption,'optical_band_gap')).toMatchObject({value_numeric:3.4,unit:'eV'});
  const thermal=measurement(sample,'phase_transformation');
  expect(valueBy(thermal,'phase_transition_temperature')).toMatchObject({value_numeric:413.15,unit:'K'});
  expect(valueBy(thermal,'melting_temperature')).toMatchObject({value_numeric:250,unit:'degC'});
  expect(valueBy(thermal,'thermal_decomposition_temperature')).toMatchObject({value_numeric:260,unit:'degC'});
  expect(valueBy(thermal,'thermal_mass_loss')).toMatchObject({value_numeric:29.5,unit:'%'});
  const outcome=valueBy(thermal,'phase_outcome').value_text;
  expect(outcome).toContain('(MeNH3)I');
  expect(outcome).toContain('CuI');
  expect(thermal.conditions).toContain('140 and 250 degC');
  expect(thermal.conditions).toContain('stable up to about 260 degC');
});

test('Research Assistant returns Record 313 PLQY and lifetime at article grain with two-pass identity',async({request},testInfo)=>{
  desktopOnly(testInfo);
  test.setTimeout(180_000);
  for(const [question,expected] of [
    ['What is the PLQY for Record 313? Keep the verification stage and sample grain explicit.','15.17 %'],
    ['What is the average lifetime for Record 313? Keep the verification stage and sample grain explicit.','84.63 μs']
  ]){
    const x=await ask(request,question);
    expect(x.mode).toBe('deterministic-scientific-data');
    expect(x.photophysics_contract).toBe('1.3.3');
    expect(x.answer).toContain(expected);
    expect(x.answer).toContain('two-pass verified');
    const sources=(x.sources||[]).filter(s=>s.record_id===313);
    expect(sources.length).toBeGreaterThan(0);
    for(const source of sources){
      expect(source).toMatchObject({type:'article',id:313,record_id:313,mapping_status:'compound_exact',property_scope:'intrinsic_bulk',photophysics_analysis_eligible:false,verification_stage:'two_pass_verified',two_pass_verified:true,evidence_scope:'two-pass verified structured scientific data'});
      expect(source).not.toHaveProperty('structure_id');
    }
  }
});