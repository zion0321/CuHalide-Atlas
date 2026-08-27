import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
for(const path of ['/api/agent','/api/agent.js'])test(`Research Assistant ${path} exposes the rev.9 evidence and scientific contracts`,async({request})=>{
  const r=await request.get(`${BASE}${path}`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,release:'3.0.2',version:'9.20.0',assistant_version:'10.5.0',operational_mode:'CONVERSATION_AND_EVIDENCE',current_curated_revision:9,photophysics_contract:'1.4.0',organic_components_contract:'1.2.0',publication_state:'prepublication-review'});
  expect(x.evidence).toMatchObject({ok:true,engine_version:'9.20.0'});
  expect(x.current_curated).toMatchObject({layer:'current-curated-r9',live_revision:9,documents:1330,embedded:1330});
  expect(x.photophysics).toMatchObject({ok:true,version:'1.4.0',two_pass_verified_articles:329,verified_no_data_articles:54,pass_a_curated_articles:0});
  expect(x.organic_components).toMatchObject({version:'1.2.0',database_authority:true});
  const h=r.headers();
  expect(h['x-cuhalide-current-curated-revision']).toBe('9');expect(h['x-cuhalide-site-version']).toBe('51');expect(h['x-cuhalide-ui-version']).toBe('51.0');expect(h['x-cuhalide-public-data-version']).toBe('2.17.1');expect(h['x-cuhalide-rag-version']).toBe('9.20.0');expect(h['x-cuhalide-assistant-version']).toBe('10.5.0');expect(h['x-cuhalide-photophysics-contract']).toBe('1.4.0');expect(h['x-cuhalide-organic-components-contract']).toBe('1.2.0');expect(h['x-cuhalide-publication-state']).toBe('prepublication-review');expect(h['x-robots-tag']).toContain('noindex');
});
