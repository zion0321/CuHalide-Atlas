import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('residual public copy is synchronized',()=>{
  const knowledge=read('public/ui-knowledge-v1.js');
  const ux=read('public/ui-ux-core-v1.js');
  const ui=read('api/ui-r10.js');
  const photo=read('public/ui-photophysics-v1.js');
  assert.match(knowledge,/Searchable source text/);
  assert.match(knowledge,/processing_coverage\?\.any_prose_articles/);
  assert.match(knowledge,/catalog_searchable_dois/);
  assert.match(knowledge,/current-catalog articles have searchable source prose/);
  assert.match(knowledge,/v2 source layer contains/);
  assert.match(ux,/rag\.title='CuXplore'/);
  assert.doesNotMatch(ux,/source-linked literature and evidence search/);
  assert.match(ui,/Strict-polar subset · highest evidence level only\./);
  assert.match(ui,/<a href="#citation">About data<\/a>/);
  assert.match(photo,/normalized values reported in sources/);
});

test('updated literature and UX presentation use fresh immutable asset keys',()=>{
  const integrated=read('lib/integrated-ui.mjs'),ux=read('public/ui-ux-v1.js'),ui=read('api/ui-r10.js');
  assert.match(integrated,/ui-knowledge-v1\.js\?v=52\.4/);
  assert.match(ux,/ui-ux-core-v1\.js\?v=52\.4/);
  assert.match(ui,/ui-ux-v1\.css\?v=52\.3/);
  assert.match(ui,/ui-ux-v1\.js\?v=52\.4/);
});

test('updated photophysics presentation uses a fresh immutable asset key',()=>{
  const ui=read('api/ui-r10.js');
  assert.match(ui,/ui-photophysics-v1\.css\?v=1\.4\.0-ui52\.2/);
  assert.match(ui,/ui-photophysics-v1\.js\?v=1\.4\.0-ui52\.2/);
});

test('branded 404 assets exist and preserve navigation',()=>{
  const html=read('public/404.html'),css=read('public/not-found.css'),server=read('scripts/local-candidate-server.mjs');
  assert.match(html,/Page not found — CuHalide Atlas/);
  assert.match(html,/Return to Overview/);
  assert.match(html,/>CuXplore<\/a>/);
  assert.match(css,/:focus-visible/);
  assert.match(server,/404\.html/);
});
