import {test,expect} from '@playwright/test';
import fs from 'node:fs';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const canonical=fs.readFileSync(new URL('../CITATION.cff',import.meta.url),'utf8');
const header=(response,name)=>response.headers()[String(name).toLowerCase()]||'';

test('runtime citation CFF exactly matches the repository source of truth',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Citation metadata is viewport invariant; run once on desktop.');
  for(const path of ['/citation.cff','/CITATION.cff','/citation.txt']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status()).toBe(200);
    expect(header(r,'x-cuhalide-publication-state')).toBe('prepublication-review');
    expect(header(r,'x-cuhalide-current-curated-revision')).toBe('8');
    expect(header(r,'x-cuhalide-meta-version')).toBe('50.5');
    expect(await r.text()).toBe(canonical);
  }
  expect(canonical).toContain('name: "CuHalide Atlas Project"');
  expect(canonical).toContain('Current Curated rev.8 (prepublication review)');
  expect(canonical).not.toMatch(/^date-released:/m);
  expect(canonical).not.toMatch(/\bdoi:\s*\S+/im);
});
