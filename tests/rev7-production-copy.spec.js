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
    expect(h.site_probe_mode).toBe('frontend v50 active; backend Current Curated rev.7 deterministic contract; Structured Photophysics 1.3.0 staged publication');
    expect(h.site_probe_mode).not.toContain('preview');
  }
});
