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

test('sample-grain UI hardening does not add private evidence fields',()=>{
  const ui=read('api/ui-assistant-current.js');
  for(const forbidden of ['source_file','source_sha256','evidence_locator','page_locator','internal_sample_id','evidence_excerpt','raw_payload','private_path'])assert.ok(!ui.includes(forbidden),`private field leaked into public UI source-card code: ${forbidden}`);
});
