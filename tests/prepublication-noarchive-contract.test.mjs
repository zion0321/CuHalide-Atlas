import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const EXACT="res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive')";

test('public machine handlers cannot weaken the prepublication noarchive contract',()=>{
  for(const path of ['api/public-data.js','api/agent.js','api/export.js']){
    const source=read(path);
    assert.ok(source.includes(EXACT),`${path} must preserve noindex, nofollow, noarchive`);
    assert.ok(!source.includes("res.setHeader('X-Robots-Tag','noindex, nofollow')"),`${path} still weakens the robots contract`);
  }
  const legacy=read('api/data.js');
  assert.match(legacy,/import publicDataHandler from '\.\/public-data\.js'/);
  assert.match(legacy,/return publicDataHandler\(req,res\)/);
});
