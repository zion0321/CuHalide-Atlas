import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const source=read('api/public-data.js');

test('article context annotation preserves core origin and makes current overlays explicit',()=>{
  assert.match(source,/function annotateArticleContext/);
  assert.match(source,/serving_context:'current_curated'/);
  assert.match(source,/core_record_origin:origin/);
  assert.match(source,/core_record_origin_release:origin==='frozen_release'\?'3\.0\.2':null/);
  assert.match(source,/attached_photophysics_context:.*'current_curated'/);
  assert.match(source,/attached_photophysics_contract:hasPhoto\?photoVersion:null/);
  assert.match(source,/snapshotPhotophysicsVersion\(action,snapshot\)/);
  assert.match(source,/bodyVersion&&headerVersion&&bodyVersion!==headerVersion/);
  assert.match(source,/context_policy:'core_origin_preserved_current_overlays_explicit'/);
  assert.doesNotMatch(source,/x\.data_scope\s*=/);
  assert.doesNotMatch(source,/x\.item\.curation_layer\s*=/);
  assert.doesNotMatch(source,/x\.item\.live_revision\s*=/);
});

test('legacy data endpoint delegates to the canonical public-data handler',()=>{
  const legacy=read('api/data.js');
  assert.match(legacy,/import publicDataHandler from '\.\/public-data\.js'/);
  assert.match(legacy,/Legacy \/api\/data route/);
  assert.match(legacy,/return publicDataHandler\(req,res\)/);
  assert.doesNotMatch(legacy,/supabase\.co\/functions\/v1/);
});