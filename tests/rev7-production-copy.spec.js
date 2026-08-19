import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';

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
});
