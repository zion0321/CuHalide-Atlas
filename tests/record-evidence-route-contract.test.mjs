import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=p=>new URL(`../${p}`,import.meta.url);
const read=p=>fs.readFileSync(url(p),'utf8');

test('all public record entry points terminate at the evidence-grain wrapper',()=>{
  const config=JSON.parse(read('vercel.json'));
  const route=source=>config.rewrites.find(x=>x.source===source)?.destination;
  assert.equal(route('/api/record'),'/api/record-evidence-current');
  assert.equal(route('/api/record-current'),'/api/record-evidence-current');
  assert.equal(route('/article/:id'),'/api/record-evidence-current?kind=article&id=:id');
  assert.equal(route('/structure/:id'),'/api/record-evidence-current?kind=structure&id=:id');

  const candidate=read('scripts/local-candidate-server.mjs');
  assert.match(candidate,/record-evidence-current\.js/);
  assert.match(candidate,/p==='\/api\/record-current'/);
});

test('structure evidence wrapper is fail-closed only when no structure-mapped photophysics exists',()=>{
  const wrapper=read('api/record-evidence-current.js');
  assert.match(wrapper,/kind!=='structure'/);
  assert.match(wrapper,/0 curated sample states · 0 measurements · 0 normalized values/);
  assert.match(wrapper,/No structure-mapped data/);
  assert.match(wrapper,/without an explicit structure mapping/);
});
