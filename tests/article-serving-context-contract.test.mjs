import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../api/public-data.js',import.meta.url),'utf8');

test('article context annotation preserves core origin and makes current overlays explicit',()=>{
  assert.match(source,/function annotateArticleContext/);
  assert.match(source,/serving_context:'current_curated'/);
  assert.match(source,/core_record_origin:origin/);
  assert.match(source,/core_record_origin_release:origin==='frozen_release'\?'3\.0\.2':null/);
  assert.match(source,/attached_photophysics_context:.*'current_curated'/);
  assert.match(source,/attached_photophysics_contract:.*PHOTOPHYSICS_CONTRACT/);
  assert.match(source,/context_policy:'core_origin_preserved_current_overlays_explicit'/);
  assert.doesNotMatch(source,/x\.data_scope\s*=/);
  assert.doesNotMatch(source,/x\.item\.curation_layer\s*=/);
  assert.doesNotMatch(source,/x\.item\.live_revision\s*=/);
});