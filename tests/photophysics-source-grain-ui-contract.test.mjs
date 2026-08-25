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
