import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('runtime citation metadata reads canonical repository CITATION.cff',()=>{
  const meta=read('api/meta.js'),config=JSON.parse(read('vercel.json')),cff=read('CITATION.cff');
  assert.match(meta,/import fs from 'node:fs'/);
  assert.match(meta,/CITATION_PATH=path\.join\(process\.cwd\(\),'CITATION\.cff'\)/);
  assert.match(meta,/fs\.readFileSync\(CITATION_PATH,'utf8'\)/);
  assert.doesNotMatch(meta,/return `cff-version:/);
  assert.equal(config.functions?.['api/meta.js']?.includeFiles,'CITATION.cff');
  assert.match(cff,/^cff-version:\s*1\.2\.0/m);
  assert.match(cff,/prepublication review resource/i);
  assert.doesNotMatch(cff,/^date-released:/m);
  assert.doesNotMatch(cff,/\bdoi:\s*\S+/im);
  assert.match(cff,/family-names:\s*"CuHalide Atlas Project"/);
});
