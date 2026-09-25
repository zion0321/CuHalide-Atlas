import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('residual public copy is synchronized',()=>{
  const knowledge=read('public/ui-knowledge-v1.js');
  const ux=read('public/ui-ux-core-v1.js');
  const ui=read('api/ui-r10.js');
  const photo=read('public/ui-photophysics-v1.js');
  assert.match(knowledge,/Articles with full-text indexing/);
  assert.match(knowledge,/subset of \$\{Number\(\(c\.articles\?\?c\.catalog_articles\)\|\|0\)/);
  assert.match(ux,/rag\.title='CuXplore'/);
  assert.doesNotMatch(ux,/source-linked literature and evidence search/);
  assert.match(ui,/Strict-polar subset · highest evidence level only\./);
  assert.match(ui,/<a href="#citation">About data<\/a>/);
  assert.match(photo,/normalized values reported in sources/);
});

test('branded 404 assets exist and preserve navigation',()=>{
  const html=read('public/404.html'),css=read('public/not-found.css'),server=read('scripts/local-candidate-server.mjs');
  assert.match(html,/Page not found — CuHalide Atlas/);
  assert.match(html,/Return to Overview/);
  assert.match(html,/>CuXplore<\/a>/);
  assert.match(css,/:focus-visible/);
  assert.match(server,/404\.html/);
});
