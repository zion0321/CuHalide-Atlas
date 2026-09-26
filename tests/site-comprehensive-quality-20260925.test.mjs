import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('quality assets are injected into portal, records and Motif Atlas',()=>{
  const ui=read('api/ui-r10.js'),record=read('api/record-r9.js'),motifs=read('api/motifs-r9.js');
  for(const src of [ui,record,motifs])assert.match(src,/ui-quality-v52\.css\?v=52\.4/);
  assert.match(ui,/ui-quality-v52\.js\?v=52\.4/);
  assert.match(motifs,/ui-quality-v52\.js\?v=52\.4/);
  assert.doesNotMatch(record,/>Research Assistant<\/a>/);
});

test('quality layer covers focus, reduced motion, corpus coverage and busy states',()=>{
  const css=read('public/ui-quality-v52.css'),js=read('public/ui-quality-v52.js');
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/ui-literature-coverage/);
  assert.match(css,/ui-busy-bar/);
  assert.match(js,/fulltext=Number\(f\.dois\|\|0\)/);
  assert.match(js,/catalog_articles\?\?410/);
  assert.match(js,/aria-busy/);
  assert.match(js,/What do 939 authority rows and 901 Core-Included structures mean/);
  assert.match(js,/How the current review state was assembled/);
});

test('global search uses the unified literature endpoint',()=>{
  const ux=read('public/ui-ux-core-v1.js');
  assert.match(ux,/new URL\('\/api\/knowledge'/);
  assert.match(ux,/searchParams\.set\('scope','all'\)/);
  assert.match(ux,/Literature article · no linked structured record/);
  assert.doesNotMatch(ux,/release_status:'Current canonical'/);
});

test('versioned UI assets have immutable browser caching',()=>{
  const v=JSON.parse(read('vercel.json'));
  const h=new Map(v.headers.map(x=>[x.source,x.headers]));
  for(const p of ['/ui-v51-core.css','/ui-v51-core.js','/ui-ux-v1.css','/ui-ux-v1.js','/ui-knowledge-v1.css','/ui-knowledge-v1.js','/cuxplore-v1.css','/cuxplore-v1.js','/ui-quality-v52.css','/ui-quality-v52.js']){
    const value=(h.get(p)||[]).find(x=>x.key==='Cache-Control')?.value;
    assert.equal(value,'public, max-age=31536000, immutable',p);
  }
});
