import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('photophysics evidence cards expose sample grain instead of implying intrinsic structure scope',()=>{
  const ui=read('api/ui-assistant-current.js');
  for(const token of [
    'CUHALIDE_PHOTOPHYSICS_SAMPLE_GRAIN_UI_V1',
    'function sourceKind(s,fallback)',
    'function sourceScopeLine(s,fallback)',
    'sample_form',
    'mapping_status',
    'property_scope',
    'photophysics_analysis_eligible',
    'Crystal photophysics sample',
    'Powder photophysics sample',
    'Pellet photophysics sample',
    'Composite photophysics sample',
    'Device photophysics sample',
    "sourceKind(s,'Structure')",
    "sourceKind(s,'Article')",
    'quantitative-correlation eligible',
    'not quantitative-correlation eligible'
  ])assert.ok(ui.includes(token),`sample-grain UI contract missing ${token}`);
  assert.match(ui,/if\(!isPhoto\)return fallback/);
  assert.match(ui,/if\(!isPhoto\)return scopeLine\(s,fallback\)/);
  assert.match(ui,/mapping='\+s\.mapping_status/);
  assert.match(ui,/scope='\+s\.property_scope/);
});

test('article-linked photophysics evidence remains sample-labelled while retaining article navigation',()=>{
  const ui=read('api/ui-assistant-current.js');
  assert.match(ui,/s\.type==='article'.*data-article=.*sourceKind\(s,'Article'\)/s);
  assert.ok(ui.includes("s.title||'Article'"));
  assert.ok(ui.includes("sourceScopeLine(s,'article-grain curated evidence')"));
});

test('structure modal photophysics stays fail-closed at structure grain',()=>{
  const bootstrap=read('public/ui-ux-v1.js');
  const modal=read('public/ui-structure-photophysics-v1.js');
  assert.ok(bootstrap.includes("load('/ui-structure-photophysics-v1.js','structure-photophysics-v1')"));
  for(const token of [
    "action=structure&id=",
    "ph.structure_mapping_state==='mapped_samples_present'",
    'No structure-mapped data',
    'Parent article ·',
    'Only samples explicitly mapped to this crystallographic structure are shown here',
    'does not assign article-level or other sample-grain measurements to this crystallographic structure',
    'function exactMappedSamples(ph,id)'
  ])assert.ok(modal.includes(token),`structure-modal grain contract missing ${token}`);
  assert.match(modal,/String\(s\.structure_id\|\|''\)===id&&String\(s\.mapping_status\|\|''\)\.startsWith\('structure_'\)/);
  assert.match(modal,/structure_mapping_state==='mapped_samples_present'&&mapped\.length>0/);
});

test('sample-grain UI hardening does not add private evidence fields',()=>{
  const sources=[read('api/ui-assistant-current.js'),read('public/ui-structure-photophysics-v1.js')].join('\n');
  for(const forbidden of ['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path'])assert.ok(!sources.includes(forbidden),`private field leaked into public photophysics UI code: ${forbidden}`);
});

test('Pass A QA follows the live verification stage instead of pinning a mutable article',()=>{
  const helper=read('tests/helpers/live-photophysics-stage.js');
  const apiQa=read('tests/site-quality-v50-1.spec.js');
  const uiQa=read('tests/visible-photophysics-ui.spec.js');
  const qa=`${apiQa}\n${uiQa}`;
  for(const token of [
    'findLivePassARecord',
    'photophysics-health',
    'action=articles',
    "public_state==='pass_a_curated'",
    "verification_stage==='pass_a_curated'",
    'two_pass_verified===false',
    'pass_a_curated_articles===0',
    'terminal staged-verification state must account for the full article queue'
  ])assert.ok(`${helper}\n${qa}`.includes(token),`stage-invariant Pass A QA contract missing ${token}`);
  assert.ok(apiQa.includes('findLivePassARecord(request,BASE)'));
  assert.ok(uiQa.includes('findLivePassARecord(request,BASE)'));
  assert.doesNotMatch(helper,/release_status=/,'Pass A discovery must inspect the full reviewed article queue, not only canonical rows');
  assert.doesNotMatch(qa,/photophysics&id=8/,'QA must not pin Record 8 as a mutable Pass A fixture');
  assert.doesNotMatch(qa,/record_id:\s*\d+\s*,\s*public_state:'pass_a_curated'/,'QA must not pin any record ID to the mutable Pass A stage');
  assert.doesNotMatch(uiQa,/openArticleRoute\(page,\s*\d+\)/,'visible QA must resolve the live Pass A article dynamically');
});

test('photophysics migration regressions are mandatory and runtime declarations follow live evidence',()=>{
  const pkg=JSON.parse(read('package.json'));
  const stableRegression='tests/photophysics-1.3.2-corrections.spec.js';
  const migrationRegression='tests/photophysics-1.3.3-record297.spec.js';
  for(const script of ['qa:site-quality','qa:browser']){
    const command=String(pkg.scripts?.[script]||'');
    assert.ok(command.includes(stableRegression),`${script} must retain corrected-record scientific regressions`);
    assert.ok(command.includes(migrationRegression),`${script} must run the Record 297 activation-window regression`);
  }

  const contract=read('lib/photophysics-contract.js');
  for(const token of ["'1.3.2'","'1.3.3'",'publishable_measurements:2262','publishable_measurements:2267','publishable_values:2985','publishable_values:2988','verification-stage accounting mismatch'])assert.ok(contract.includes(token),`dual-baseline classifier missing ${token}`);

  const visible=read('tests/visible-photophysics-ui.spec.js');
  const runtime=read('public/ui-photophysics-v1.js');
  assert.ok(visible.includes('assertPhotophysicsHealth'));
  assert.ok(visible.includes('const{state}=await liveHealth(request),expected=state.expected'));
  assert.ok(visible.includes('expected.publishable_measurements'));
  assert.ok(runtime.includes("const PHOTO_ALLOWED=new Set(['1.3.2','1.3.3'])"));
  assert.ok(runtime.includes('id="photoContractVersion"'));
  assert.ok(runtime.includes("contract.textContent=String(h.version||'unavailable')"));
  assert.doesNotMatch(runtime,/Structured photophysics · contract 1\.3\.[123]/,'visible runtime must not hardcode an active photophysics contract');
  assert.ok(!runtime.includes("ph.version||'1.3.2'"),'article modal must not fall back to the old contract');
  assert.ok(!runtime.includes('1.3.1'),'visible Photophysics runtime must not retain a 1.3.1 fallback or label');

  const publicData=read('api/public-data.js');
  const recordCurrent=read('api/record-current.js');
  assert.ok(publicData.includes('snapshotPhotophysicsVersion'));
  assert.ok(publicData.includes('normalizePhotophysicsVersion'));
  assert.ok(recordCurrent.includes('normalizePhotophysicsVersion'));
  assert.doesNotMatch(`${publicData}\n${recordCurrent}`,/PHOTOPHYSICS_CONTRACT\s*=\s*['"]1\.3\.[123]['"]/,'Vercel record/data surfaces must not statically declare a mutable photophysics contract');
});