import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const CANDIDATE_HOST=['127.0.0.1','localhost'].includes(new URL(BASE).hostname);

test('public rev.7 copy contains no rev.6 release-language residues',async({request})=>{
  for(const path of ['/api/site','/']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status()).toBe(200);
    const html=await r.text();
    expect(html).toContain('Current Curated rev.7');
    expect(html).toContain('Curated through 19 August 2026');
    expect(html).toContain('Rev.7 completes a full structure-truth re-audit across the 946-row Current Curated snapshot');
    expect(html).toContain('cc.live_revision||7');
    expect(html).not.toContain('Current Curated rev.6');
    expect(html).not.toContain('Curated through 18 August 2026');
    expect(html).not.toContain('cc.live_revision||6');
    expect(html).not.toContain('This revision adds four primary-evidence-reviewed articles and eight SCXRD structure determinations');
  }

  if(CANDIDATE_HOST){
    const root=await request.get(BASE);
    expect(root.status()).toBe(200);
    const rootHtml=await root.text();
    expect(rootHtml).toContain('Evidence-grounded Research Assistant query access');
    expect(rootHtml).toContain('<summary>Research Assistant evidence boundary</summary>');
    expect(rootHtml).not.toContain('Evidence-grounded Smart RAG query access');
    expect(rootHtml).not.toContain('<summary>Smart RAG evidence boundary</summary>');

    const health=await request.get(`${BASE}/health.json`);
    expect(health.status()).toBe(200);
    const h=await health.json();
    expect(h.site_probe_mode).toBe('frontend v50 active; backend Current Curated rev.7 deterministic contract; Structured Photophysics 1.3.0 staged publication; Organic Components 1.1.0 structure-grain fail-closed depiction contract');
    expect(h.site_probe_mode).not.toContain('preview');
    expect(h.organic_components_contract_version).toBe('1.1.0');
    expect(h.organic_components).toMatchObject({ok:true,contract_version:'1.1.0',component_rows:495,mapped_structures:453,distinct_raw_component_keys:260,verified_connectivity_rows:253,unresolved_rows:242,structures_with_verified_connectivity:241,verified_connectivity_graph_keys:81});
    expect(h.organic_components.checks).toMatchObject({all_rows_classified:true,mapping_baseline_stable:true,verified_plus_unresolved_equals_total:true,raw_primary_files_exposed:false,raw_evidence_locators_exposed:false,private_evidence_fields_exposed:false});

    const exportResponse=await request.get(`${BASE}/api/export`);
    expect(exportResponse.status()).toBe(410);
    const exportBody=await exportResponse.json();
    expect(exportBody.public_access).toBe('query-and-view');
    expect(exportBody.guidance).toContain('Research Assistant');
    expect(exportBody.guidance).not.toContain('Smart RAG');
  }
});
