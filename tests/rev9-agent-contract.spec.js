import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
for(const path of ['/api/agent','/api/agent.js'])test(`CuXplore ${path} exposes rev.10 scientific and 1.3 retrieval contracts`,async({request})=>{
  const r=await request.get(`${BASE}${path}`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,release:'3.0.2',service:'CuXplore',display_name:'CuXplore',version:'10.6.0',cuxplore_version:'10.6.0',semantic_index_version:'10.0.0',knowledge_contract:'1.3.0',current_curated_revision:10,photophysics_contract:'1.4.0',organic_components_contract:'1.2.0',publication_state:'prepublication-review',operational_mode:'CONVERSATION_AND_EVIDENCE',write_access:false});
  expect(x.assistant_version).toBeUndefined();
  expect(x.current_curated).toMatchObject({layer:'current-curated-r10',live_revision:10,curated_through:'2026-09-14',documents:1322,embedded:1322,architecture:'full-current-atomic-structure-snapshot'});
  const h=r.headers();
  expect(h['x-cuhalide-current-curated-revision']).toBe('10');expect(h['x-cuhalide-site-version']).toBe('52');expect(h['x-cuhalide-ui-version']).toBe('52.0');expect(h['x-cuhalide-public-data-version']).toBe('2.18.0');
  expect(h['x-cuhalide-cuxplore-version']).toBe('10.6.0');expect(h['x-cuhalide-knowledge-contract']).toBe('1.3.0');
  expect(h['x-cuhalide-rag-version']).toBe('10.0.0');expect(h['x-cuhalide-assistant-version']).toBe('10.6.0');
  expect(h['x-cuhalide-photophysics-contract']).toBe('1.4.0');expect(h['x-cuhalide-organic-components-contract']).toBe('1.2.0');expect(h['x-cuhalide-publication-state']).toBe('prepublication-review');expect(h['x-robots-tag']).toContain('noindex');
});
