import {test,expect} from '@playwright/test';
const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
for(const path of ['/api/agent','/api/agent.js'])test(`Research Assistant ${path} exposes rev.10 evidence and scientific contracts`,async({request})=>{
  const r=await request.get(`${BASE}${path}`);expect(r.status()).toBe(200);const x=await r.json();
  expect(x).toMatchObject({ok:true,release:'3.0.2',version:'10.0.0',assistant_version:'10.6.0',current_curated_revision:10,photophysics_contract:'1.4.0',organic_components_contract:'1.2.0',publication_state:'prepublication-review'});
  expect(['CONVERSATION_AND_EVIDENCE','EVIDENCE_ONLY']).toContain(x.operational_mode);
  expect(x.evidence).toMatchObject({ok:true,engine_version:'10.0.0'});
  expect(x.current_curated).toMatchObject({layer:'current-curated-r10',live_revision:10,documents:1322,embedded:1322});
  expect(x.corpus).toMatchObject({active_current_documents:1322,active_current_embedded:1322});
  expect(x.photophysics).toMatchObject({ok:true,version:'1.4.0'});
  expect(x.organic_components).toMatchObject({ok:true,version:'1.2.0'});
  expect(x.checks).toMatchObject({active_current_document_contract:true,active_current_embedding_contract:true,photophysics_contract:true,organic_components_contract:true,current_curated_revision:10});
  const h=r.headers();
  expect(h['x-cuhalide-current-curated-revision']).toBe('10');expect(h['x-cuhalide-site-version']).toBe('52');expect(h['x-cuhalide-ui-version']).toBe('52.0');expect(h['x-cuhalide-public-data-version']).toBe('2.18.0');expect(h['x-cuhalide-rag-version']).toBe('10.0.0');expect(h['x-cuhalide-assistant-version']).toBe('10.6.0');expect(h['x-cuhalide-photophysics-contract']).toBe('1.4.0');expect(h['x-cuhalide-organic-components-contract']).toBe('1.2.0');expect(h['x-cuhalide-publication-state']).toBe('prepublication-review');expect(h['x-robots-tag']).toContain('noindex');
});
