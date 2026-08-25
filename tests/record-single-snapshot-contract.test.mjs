import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const wrapperPath='api/record-current.js';
const rendererPath='api/record.js';

async function sources(){
  return Promise.all([readFile(wrapperPath,'utf8'),readFile(rendererPath,'utf8')]);
}

test('standalone current records share one canonical snapshot on the normal path',async()=>{
  const [wrapper,renderer]=await sources();
  assert.match(wrapper,/const overlayPromise=fetchRecordOverlay\(req\)/);
  assert.match(wrapper,/req\.__cuhalideRecordSnapshotPromise=overlayPromise/);
  assert.match(wrapper,/record_result:\{state:'ok',item:x\.item,status:r\.status\}/);
  assert.match(wrapper,/record_result:\{state:'not-found',status:404\}/);
  assert.match(renderer,/async function resolveRecord\(req,kind,id\)/);
  assert.match(renderer,/const snapshot=req\?\.__cuhalideRecordSnapshotPromise/);
  assert.match(renderer,/\['ok','not-found','error'\]\.includes\(result\.state\)/);
  assert.match(renderer,/return getRecord\(kind,id\)/,'degraded snapshot failures must retain the retrying base fallback');
  assert.match(renderer,/const result=await resolveRecord\(req,kind,id\)/);
});

test('standalone enrichment is restricted to successful record pages',async()=>{
  const [wrapper]=await sources();
  assert.match(wrapper,/const enrich=res\.statusCode===200&&\(overlay\?\.record_result\?\.state==='ok'\|\|overlay\?\.record_result==null\)/);
  assert.match(wrapper,/if\(enrich\)\{out=injectOrganicComponents\(out,overlay\);out=injectPhotophysics\(out,overlay\.photophysics\);out=injectOrganicClient\(out,overlay\)\}/);
  assert.match(wrapper,/allowSelf:enrich&&overlay\.kind==='structure'/);
  assert.ok(wrapper.includes(`'"':'&quot;'`),'double quotes must use a complete HTML entity');
  assert.ok(!wrapper.includes(`'"':'&quot'`),'malformed quote escaping must not be reintroduced');
});
