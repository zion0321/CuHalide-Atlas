import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('portal UX assets are injected and candidate-served',()=>{
  const wrapper=read('api/ui-assistant-current.js');
  const bootstrap=read('public/ui-ux-v1.js');
  const server=read('scripts/local-candidate-server.mjs');
  for(const asset of ['ui-ux-v1.css','ui-ux-v1.js']){
    assert.match(wrapper,new RegExp(asset.replaceAll('.','\\.')));
    assert.match(server,new RegExp(asset.replaceAll('.','\\.')));
  }
  assert.match(wrapper,/CUHALIDE_PORTAL_UX_V1/);
  assert.match(bootstrap,/ui-structure-photophysics-v1\.js/);
  assert.match(server,/\/ui-structure-photophysics-v1\.js/);
  assert.match(server,/ui-structure-photophysics-v1\.js'\),type:'text\/javascript; charset=utf-8'/);
});

test('record-current avoids Vercel req.query legacy parsing and exposes consistent research navigation',()=>{
  const record=read('api/record-current.js');
  assert.doesNotMatch(record,/req\??\.query/);
  assert.match(record,/new URL\(String\(req\?\.url\|\|'\/'\),'http:\/\/local'\)/);
  assert.match(record,/#photophysics/);
  assert.match(record,/Research Assistant/);
});

test('global search remains on public query-and-view endpoints only',()=>{
  const bootstrap=read('public/ui-ux-v1.js');
  const ux=read('public/ui-ux-core-v1.js');
  assert.match(bootstrap,/ui-ux-core-v1\.js/);
  assert.match(bootstrap,/organic-components-v1\.js/);
  assert.match(bootstrap,/ui-structure-photophysics-v1\.js/);
  assert.match(ux,/const DATA='\/api\/public-data'/);
  assert.match(ux,/api\('articles'/);
  assert.match(ux,/api\('structures'/);
  for(const forbidden of ['atlas_internal','source_file','evidence_locator','internal_sample_id','/api/export']){
    assert.doesNotMatch(ux,new RegExp(forbidden));
    assert.doesNotMatch(bootstrap,new RegExp(forbidden));
  }
});
