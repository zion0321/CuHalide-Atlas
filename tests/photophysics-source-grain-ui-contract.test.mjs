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
    'does not assign article-level or other sample-grain measurements to this crystallographic structure'
  ])assert.ok(modal.includes(token),`structure-modal grain contract missing ${token}`);
  assert.match(modal,/samples\.filter\(s=>String\(s\.structure_id\|\|''\)===id\|\|String\(s\.mapping_status\|\|''\)\.startsWith\('structure_'\)\)/);
});

test('sample-grain UI hardening does not add private evidence fields',()=>{
  const sources=[read('api/ui-assistant-current.js'),read('public/ui-structure-photophysics-v1.js')].join('\n');
  for(const forbidden of ['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path'])assert.ok(!sources.includes(forbidden),`private field leaked into public photophysics UI code: ${forbidden}`);
});
