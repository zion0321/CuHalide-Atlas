import {test,expect} from '@playwright/test';

const BASE=process.env.CUHALIDE_BASE_URL||'http://127.0.0.1:4173';
const ROBOTS='noindex, nofollow, noarchive';
const header=(response,name)=>response.headers()[String(name).toLowerCase()]||'';

test.describe.configure({mode:'serial'});

test('public data and legacy data retain exact prepublication robots policy on canonical and suffix paths',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Header policy is viewport invariant; run once on desktop.');
  for(const path of ['/api/public-data?action=status','/api/public-data.js?action=status','/api/data?action=status','/api/data.js?action=status']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status(),path).toBe(200);
    expect(header(r,'x-robots-tag'),path).toBe(ROBOTS);
    expect(header(r,'x-cuhalide-publication-state'),path).toBe('prepublication-review');
    expect(header(r,'x-cuhalide-current-curated-revision'),path).toBe('8');
    expect(header(r,'x-cuhalide-public-data-version'),path).toBe('2.16.0');
    const body=await r.json();
    expect(body.current_curated_revision,path).toBe(8);
    expect(body.version,path).toBe('2.16.0');
    if(path.includes('/api/data'))expect(header(r,'warning'),path).toContain('299');
  }
});

test('Research Assistant retains exact prepublication robots policy on canonical and suffix paths',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Header policy is viewport invariant; run once on desktop.');
  for(const path of ['/api/agent','/api/agent.js']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status(),path).toBe(200);
    expect(header(r,'x-robots-tag'),path).toBe(ROBOTS);
    expect(header(r,'x-cuhalide-publication-state'),path).toBe('prepublication-review');
    expect(header(r,'x-cuhalide-current-curated-revision'),path).toBe('8');
    expect(header(r,'x-cuhalide-rag-version'),path).toBe('9.19.0');
    expect(header(r,'x-cuhalide-assistant-version'),path).toBe('10.4.1');
    const body=await r.json();
    expect(body.publication_state,path).toBe('prepublication-review');
    expect(body.current_curated?.live_revision,path).toBe(8);
    expect(body.current_curated?.layer,path).toBe('current-curated-r8');
  }
});

test('410 export boundary retains exact prepublication robots policy on canonical and suffix paths',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop-chromium','Header policy is viewport invariant; run once on desktop.');
  for(const path of ['/api/export','/api/export.js']){
    const r=await request.get(`${BASE}${path}`);
    expect(r.status(),path).toBe(410);
    expect(header(r,'x-robots-tag'),path).toBe(ROBOTS);
    expect(header(r,'x-cuhalide-publication-state'),path).toBe('prepublication-review');
    const body=await r.json();
    expect(body).toMatchObject({release:'3.0.2',publication_state:'prepublication-review',release_state:'prepublication',public_access:'query-and-view'});
  }
});
