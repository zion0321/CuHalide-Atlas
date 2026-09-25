import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL('../'+p, import.meta.url), 'utf8');

test('CuXplore uses one article corpus while keeping processing metrics distinct', () => {
  const k = read('public/ui-knowledge-v1.js');
  assert.match(k, /Articles/);
  assert.match(k, /Full-text coverage/);
  assert.match(k, /Semantic index/);
  assert.match(k, /Literature corpus:/);
  assert.match(k, /Structure authority:/);

  const c = read('public/cuxplore-v1.js');
  assert.match(c, /literature corpus contains/);
  assert.match(c, /full-text v2 source index contains/);
  assert.match(c, /structure authority contains/);

  const m = read('api/meta-r9.js');
  assert.match(m, /catalog_doi_records:410/);
  assert.match(m, /fulltext_doi_records:403/);
  assert.match(m, /literature_articles:410/);
  assert.doesNotMatch(m, /context_boundary_dois/);
  assert.match(m, /public literature corpus contains 410 DOI-deduplicated articles/);
  assert.match(m, /939 = structure\/phase authority rows; 901 = Core-Included public curated rows/);
});

test('Current UI removes stale research branding and distinguishes release cutoff from release date', () => {
  const ui = read('api/ui-r10.js');
  assert.match(ui, /CUHALIDE_UI_V52_0_CUXPLORE/);
  assert.match(ui, /Scientific cutoff: 30 June 2026; archived release issued: 11 August 2026/);
  assert.match(ui, /CONTENT_DATE='2026-09-25'/);

  const motifs = read('api/motifs-r9.js');
  assert.match(motifs, /Core-Included structures/);
  assert.match(motifs, /all 939 structure\/phase authority rows/);
  assert.match(motifs, />CuXplore<\/a>/);

  const mw = read('middleware.js');
  assert.match(mw, /2026-09-25T00:00:00Z/);
});
