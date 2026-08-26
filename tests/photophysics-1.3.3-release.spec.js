import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

const flattenMeasurements=record=>(record?.samples||[]).flatMap(s=>(s.measurements||[]).map(m=>({...m,sample_label:s.sample_label,structure_id:s.structure_id||null})));
const flattenValues=record=>flattenMeasurements(record).flatMap(m=>(m.values||[]).map(v=>({...v,measurement_label:m.measurement_label})));

test.describe.configure({mode:'serial'});

test('Structured Photophysics 1.3.3 permits only staged or activated audited content states',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Contract migration is viewport invariant.');
  const hr=await request.get(`${BASE}/api/public-data?action=photophysics-health`);
  expect(hr.status()).toBe(200);
  const h=await hr.json();
  expect(h.ok).toBe(true);
  expect(h.version).toBe('1.3.3');
  expect(h.article_queue).toBe(383);
  expect(h.verified_no_data_articles).toBe(54);
  expect(h.publishable_samples).toBe(940);
  expect(h.analysis_eligible_values).toBe(281);
  expect(h.publishable_mechanism_claims).toBe(477);
  expect(h.checks).toMatchObject({conflicts_fail_closed:true,two_pass_status_preserved:true,raw_primary_files_exposed:false,raw_evidence_locators_exposed:false,ineligible_measurement_projection_leaks:0});

  const staged=h.pass_a_curated_articles===239&&h.two_pass_verified_articles===90&&h.publishable_measurements===2262&&h.publishable_values===2985;
  const activated=h.pass_a_curated_articles===237&&h.two_pass_verified_articles===92&&h.publishable_measurements===2267&&h.publishable_values===2988;
  expect(staged||activated).toBe(true);

  const [r297r,r135r]=await Promise.all([
    request.get(`${BASE}/api/public-data?action=photophysics&id=297`),
    request.get(`${BASE}/api/public-data?action=photophysics&id=135`)
  ]);
  expect(r297r.status()).toBe(200);expect(r135r.status()).toBe(200);
  const r297=await r297r.json(),r135=await r135r.json();
  expect(r297.version).toBe('1.3.3');expect(r135.version).toBe('1.3.3');
  expect(r297.conflicts).toHaveLength(0);expect(r135.conflicts).toHaveLength(0);

  if(staged){
    expect(r297.public_state).toBe('pass_a_curated');
    expect(r297.two_pass_verified).toBe(false);
    expect(r297.counts).toMatchObject({samples:4,measurements:7,values:7,conflicts:0});
    expect(r135.public_state).toBe('pass_a_curated');
    expect(r135.two_pass_verified).toBe(false);
    return;
  }

  expect(r297.public_state).toBe('two_pass_verified');
  expect(r297.two_pass_verified).toBe(true);
  expect(r297.counts).toMatchObject({samples:4,measurements:12,values:10,conflicts:0});
  const m297=flattenMeasurements(r297),v297=flattenValues(r297);
  const c1pl=m297.find(m=>m.measurement_label==='Record 297 compound 1 dual-emission PL');
  const c1vt=m297.find(m=>m.measurement_label==='Compound 1 reversible thermochromic dual emission');
  expect(c1pl?.excitation_nm).toBe(440);
  expect(c1vt?.excitation_nm).toBe(440);
  for(const label of [
    'Compound 1 solid-state absorption',
    'Compound 2 solid-state absorption',
    'Compound 1 LE excitation spectrum',
    'Compound 1 HE excitation spectrum',
    'Compound 1 LE lifetime'
  ])expect(m297.some(m=>m.measurement_label===label)).toBe(true);
  expect(v297.some(v=>v.property_key==='plqy')).toBe(false);
  expect(v297.some(v=>['cie_x','cie_y','color_rendering_index'].includes(v.property_key))).toBe(false);
  expect(m297.find(m=>m.measurement_label==='Compound 1 LE lifetime')?.excitation_nm).toBe(390);

  expect(r135.public_state).toBe('two_pass_verified');
  expect(r135.two_pass_verified).toBe(true);
  expect(r135.counts).toMatchObject({samples:5,measurements:13,values:14,conflicts:0});
  const m135=flattenMeasurements(r135),v135=flattenValues(r135);
  expect(m135.some(m=>m.measurement_label==='(TBA)2Cu2I4 room-temperature dual STE emission')).toBe(true);
  expect(v135.find(v=>v.property_key==='plqy')?.value_numeric).toBe(72.5);
  expect(v135.find(v=>v.property_key==='optical_band_gap')?.value_numeric).toBe(3.43);
  expect(v135.filter(v=>v.property_key==='huang_rhys_factor').map(v=>v.value_numeric).sort((a,b)=>a-b)).toEqual([24.6,37.9]);
});