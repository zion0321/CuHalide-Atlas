import crypto from 'node:crypto';

const PUBLIC_ORIGIN='https://cuhalide-atlas-v3.vercel.app';
const DATA='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v3';
const RELEASE='3.0.2',SITE_VERSION='50',CURRENT_REVISION='6',CURRENT_DATE='2026-08-18';
const RETRIES=3,ATTEMPT_TIMEOUT_MS=7000,RETRY_DELAY_MS=180;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha=(v)=>`'sha256-${crypto.createHash('sha256').update(v).digest('base64')}'`;
const curationStatus=(v)=>['Core - Verified','Current Curated - Verified'].includes(v)?'Curated':v==='Context - Boundary'?'Boundary context':v==='Excluded - Curated Audit'?'Excluded':v==='Pending - Primary Evidence Unavailable'?'Evidence pending':v||'Unresolved';

async function getRecord(kind,id){
  const u=new URL(DATA);u.searchParams.set('action',kind);u.searchParams.set('id',id);
  let lastError=null;
  for(let attempt=0;attempt<RETRIES;attempt++){
    try{
      const r=await fetch(u,{headers:{accept:'application/json','user-agent':'CuHalide-Atlas-Record-Page/50.1'},signal:AbortSignal.timeout(ATTEMPT_TIMEOUT_MS)}),raw=await r.text();
      let data;try{data=JSON.parse(raw)}catch{data=null}
      if(r.status===404)return{state:'not-found',status:404};
      if(r.ok&&data?.item)return{state:'ok',item:data.item,status:r.status};
      if(r.status<500&&r.status!==429)return{state:'error',status:r.status};
      lastError=Error(`record backend ${r.status}`);
    }catch(error){lastError=error}
    if(attempt<RETRIES-1)await sleep(RETRY_DELAY_MS*(attempt+1));
  }
  throw lastError||Error('record backend unavailable');
}

function provenance(x){
  const rolling=x.curation_layer==='Current Curated'||Number(x.live_revision||0)>0;
  return rolling?{
    rolling:true,
    label:'Curated record',
    detail:'Current Curated rev.6 · primary-evidence reviewed through 18 Aug 2026',
    modified:CURRENT_DATE,
    dataset:'CuHalide Atlas living knowledge base',
    version:`current-r${CURRENT_REVISION}`,
  }:{
    rolling:false,
    label:'Curated record',
    detail:'Part of archived scientific snapshot 3.0.2 · retained in the current corpus',
    modified:'2026-08-11',
    dataset:'CuHalide Atlas archived scientific snapshot 3.0.2',
    version:RELEASE,
  };
}

const sharedStyle=`:root{color-scheme:light;--ink:#102a38;--muted:#536a75;--navy:#0b2a3d;--teal:#1f7e74;--soft:#e8f4f2;--bg:#f6f8f9;--line:#dce5e8;--shadow:0 14px 38px rgba(9,40,60,.065)}*{box-sizing:border-box}html,body{margin:0;max-width:100%}body{background:var(--bg);color:var(--ink);font:15px/1.68 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.top{background:rgba(255,255,255,.96);border-bottom:1px solid var(--line)}.topin{width:min(980px,calc(100% - 32px));min-height:68px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-weight:900;color:var(--navy);text-decoration:none}.topnav{display:flex;gap:16px;flex-wrap:wrap}.topnav a{color:#4d6672;text-decoration:none;font-size:11px;font-weight:800}.topnav a:hover{color:var(--teal)}main{width:min(920px,calc(100% - 32px));margin:52px auto 62px}.eyebrow{margin:22px 0 8px;color:var(--teal);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}h1{font:clamp(34px,5vw,54px)/1.08 Georgia,"Times New Roman",serif;letter-spacing:-.035em;color:var(--navy);margin:0 0 18px;overflow-wrap:anywhere}.meta,.fine{color:var(--muted)}.meta{line-height:1.6}.fine{font-size:11px}.status{display:inline-flex;align-items:center;gap:7px;background:var(--soft);color:#17675f;border:1px solid #cee7e2;border-radius:999px;padding:6px 10px;font-size:10px;font-weight:850}.status:before{content:"";width:7px;height:7px;border-radius:50%;background:#2c9588}.provenance{margin:13px 0 0;color:var(--muted);font-size:10.5px}.card{margin-top:24px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;box-shadow:var(--shadow)}.grid{display:grid;grid-template-columns:180px minmax(0,1fr);gap:9px 18px}.grid dt{color:var(--muted)}.grid dd{margin:0;font-weight:650;overflow-wrap:anywhere}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;align-items:center;min-height:40px;border-radius:10px;padding:9px 14px;text-decoration:none;font-weight:800;font-size:12px}.primary{background:var(--teal);color:#fff}.secondary{border:1px solid var(--line);background:#fff;color:var(--navy)}.components{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.component{background:#f7fafb;border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}.component strong,.component span{display:block;overflow-wrap:anywhere}.component span{color:var(--muted);font-size:11px;margin-top:3px}.data-note{margin-top:30px;padding:16px 17px;border:1px solid var(--line);border-radius:13px;background:#fbfcfc}.data-note strong{display:block;color:var(--navy);margin-bottom:4px}.data-note p{margin:4px 0;font-size:11px;color:var(--muted)}.error-card{max-width:680px}.error-card h1{margin-top:6px}.error-card p{color:var(--muted)}@media(max-width:640px){.topin{align-items:flex-start;flex-direction:column;padding:14px 0}.topnav{gap:12px}.topnav a{font-size:10.5px}main{margin:34px auto 46px}.grid{grid-template-columns:1fr}.components{grid-template-columns:1fr}.card{padding:19px}}`;
const nav=`<header class="top"><div class="topin"><a class="brand" href="${PUBLIC_ORIGIN}/">CuHalide Atlas</a><nav class="topnav" aria-label="Primary"><a href="${PUBLIC_ORIGIN}/#articles">Literature</a><a href="${PUBLIC_ORIGIN}/#structures">Structures</a><a href="${PUBLIC_ORIGIN}/motifs">Motifs</a><a href="${PUBLIC_ORIGIN}/#rag">Smart RAG</a></nav></div></header>`;

function layout({title,description,canonical,body,jsonLd,ogType='website'}){
  const ld=JSON.stringify(jsonLd).replace(/</g,'\\u003c');
  const csp=`default-src 'none'; img-src 'self'; style-src ${sha(sharedStyle)}; script-src ${sha(ld)}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  const note=`<div class="data-note"><strong>Data provenance</strong><p>This page reflects the latest curated public record available in CuHalide Atlas. Cite living results with an access date. Archived scientific snapshot 3.0.2 remains immutable for exact historical reproduction.</p><p>Public pages expose only field-whitelisted information; primary PDF/SI/CIF and private curation evidence remain private.</p></div>`;
  return{csp,html:`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#0b2a3d"><meta name="cuhalide-release" content="${RELEASE}"><meta name="cuhalide-current-curated-revision" content="${CURRENT_REVISION}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${esc(ogType)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${PUBLIC_ORIGIN}/og-image.svg"><meta property="og:image:alt" content="CuHalide Atlas — evidence-grounded Cu(I) halide knowledge portal"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${PUBLIC_ORIGIN}/og-image.svg"><link rel="canonical" href="${esc(canonical)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>${esc(title)} — CuHalide Atlas</title><style>${sharedStyle}</style><script type="application/ld+json">${ld}</script></head><body>${nav}<main>${body}${note}</main></body></html>`};
}

function errorPage(status,title,message){
  const csp=`default-src 'none'; style-src ${sha(sharedStyle)}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0b2a3d"><title>${esc(title)} — CuHalide Atlas</title><style>${sharedStyle}</style></head><body>${nav}<main><section class="card error-card"><p class="eyebrow">${status}</p><h1>${esc(title)}</h1><p>${esc(message)}</p><div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#articles">Browse literature</a><a class="btn secondary" href="${PUBLIC_ORIGIN}/#structures">Browse structures</a><a class="btn secondary" href="${PUBLIC_ORIGIN}/">Return home</a></div></section></main></body></html>`;
  return{csp,html};
}

function articlePage(x){
  const prov=provenance(x),canonical=`${PUBLIC_ORIGIN}/article/${encodeURIComponent(x.record_id)}`,doi=x.doi_url||(x.doi?`https://doi.org/${x.doi}`:'');
  const description=`CuHalide Atlas curated article record. ${x.journal||'Journal'} ${x.year||''}. ${x.structure_summary||'Curated Cu(I) halide evidence.'}`.replace(/\s+/g,' ').trim().slice(0,280);
  const body=`<p class="eyebrow">Article record ${esc(x.record_id)}</p><span class="status">${esc(prov.label)}</span><p class="provenance">${esc(prov.detail)}</p><h1>${esc(x.title)}</h1><p class="meta">${esc(x.authors)}${x.journal?` · ${esc(x.journal)}`:''}${x.year?` · ${esc(x.year)}`:''}</p><section class="card"><dl class="grid"><dt>DOI</dt><dd>${doi?`<a href="${esc(doi)}" rel="noreferrer">${esc(x.doi)}</a>`:'Not recorded'}</dd><dt>Curation status</dt><dd>${esc(curationStatus(x.release_status))}</dd><dt>Halogen set</dt><dd>${esc(x.halogen||'Unresolved')}</dd><dt>Dimensionality</dt><dd>${esc(x.dimensionality_class||'Unresolved')}</dd><dt>Category</dt><dd>${esc(x.category||'Unresolved')}</dd><dt>Scope</dt><dd>${esc(x.scope_status||'Unresolved')}</dd><dt>Evidence</dt><dd>${esc(x.evidence_level||'Unresolved')}</dd></dl><p>${esc(x.structure_summary||'No public structural summary recorded.')}</p></section><div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#article/${esc(x.record_id)}">Open interactive record</a>${doi?`<a class="btn secondary" href="${esc(doi)}" rel="noreferrer">Open DOI</a>`:''}</div>`;
  const jsonLd={'@context':'https://schema.org','@type':'ScholarlyArticle',headline:x.title,name:x.title,identifier:x.doi||`CuHalide Atlas Record ${x.record_id}`,url:canonical,sameAs:doi||undefined,datePublished:x.year?String(x.year):undefined,dateModified:prov.modified,isPartOf:{'@type':'Dataset',name:prov.dataset,version:prov.version,url:PUBLIC_ORIGIN}};
  return layout({title:x.title,description,canonical,body,jsonLd,ogType:'article'});
}

function structurePage(x){
  const prov=provenance(x),canonical=`${PUBLIC_ORIGIN}/structure/${encodeURIComponent(x.structure_id)}`;
  const motif=x.motif_details&&typeof x.motif_details==='object'?x.motif_details:{},components=Array.isArray(x.organic_components)?x.organic_components:[];
  const description=`CuHalide Atlas curated structure record. ${x.formula||x.label||x.structure_id}; ${x.dimensionality||'dimensionality unresolved'}; ${motif.formula?`motif ${motif.formula}; `:''}${x.space_group?`space group ${x.space_group}`:'space group unresolved'}.`.slice(0,280);
  const componentHtml=components.length?`<section class="card"><p class="eyebrow">Organic components</p><p class="fine">Evidence tier is shown per component; legacy token-derived labels are not presented as primary-evidence identities.</p><div class="components">${components.map(c=>`<div class="component"><strong>${esc(c.name||c.abbreviation||'Unresolved')}</strong><span>${esc([c.abbreviation&&c.abbreviation!==c.name?c.abbreviation:'',c.role,c.donor_atoms?`donor atoms ${c.donor_atoms}`:'',c.confidence].filter(Boolean).join(' · '))}</span></div>`).join('')}</div></section>`:'';
  const body=`<p class="eyebrow">Structure / phase record ${esc(x.structure_id)}</p><span class="status">${esc(prov.label)}</span><p class="provenance">${esc(prov.detail)}</p><h1>${esc(x.label||x.structure_id)}</h1><p class="meta">Record ${esc(x.record_id)} · ${esc(x.article_title||'')}</p><section class="card"><dl class="grid"><dt>Formula</dt><dd>${esc(x.formula||'Not recorded')}</dd><dt>Phase / condition</dt><dd>${esc(x.phase||'Not recorded')}</dd><dt>Halogen</dt><dd>${esc(x.halogen||'Unresolved')}</dd><dt>Halogen evidence</dt><dd>${esc(x.halogen_scope||'unresolved')} · ${esc(x.halogen_confidence||'Unresolved')}</dd><dt>Dimensionality</dt><dd>${esc(x.dimensionality||'Unresolved')}</dd><dt>Cu–X motif</dt><dd>${esc(motif.formula||'Unresolved')}</dd><dt>Motif geometry</dt><dd>${esc(motif.geometry||'Unresolved')}</dd><dt>Motif confidence</dt><dd>${esc(motif.confidence||'Unresolved')}</dd><dt>Normalized reported identity</dt><dd>${esc(motif.identity_key||x.chemical_identity_status||'Unresolved')}</dd><dt>Space group</dt><dd>${esc(x.space_group||'Unresolved')}</dd><dt>Point group</dt><dd>${esc(x.point_group||'Unresolved')}</dd><dt>Crystal system</dt><dd>${esc(x.crystal_system||'Unresolved')}</dd><dt>Polar</dt><dd>${esc(x.polar||'Unresolved')}</dd><dt>SG / mapping confidence</dt><dd>${esc(x.sg_confidence||'Unresolved')} / ${esc(x.mapping_confidence||'Unresolved')}</dd></dl></section>${componentHtml}<div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#structure/${encodeURIComponent(x.structure_id)}">Open interactive record</a><a class="btn secondary" href="${PUBLIC_ORIGIN}/motifs${motif.formula&&motif.formula!=='Unresolved'?`?motif=${encodeURIComponent(motif.formula)}`:''}">Open Motif Atlas</a>${x.doi_url?`<a class="btn secondary" href="${esc(x.doi_url)}" rel="noreferrer">Open source DOI</a>`:''}</div>`;
  const jsonLd={'@context':'https://schema.org','@type':'Dataset',name:x.label||x.structure_id,identifier:x.structure_id,url:canonical,version:prov.version,dateModified:prov.modified,citation:x.doi_url||x.doi||undefined,keywords:[motif.formula,motif.geometry,x.dimensionality,x.space_group].filter(Boolean),isPartOf:{'@type':'Dataset',name:prov.dataset,version:prov.version,url:PUBLIC_ORIGIN}};
  return layout({title:x.label||x.structure_id,description,canonical,body,jsonLd});
}

function setCommonHeaders(res,csp){res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Content-Security-Policy',csp);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-CuHalide-Release',RELEASE);res.setHeader('X-CuHalide-Site-Version',SITE_VERSION);res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION)}

export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed')}
  const u=new URL(req.url,PUBLIC_ORIGIN),kind=String(u.searchParams.get('kind')||'').toLowerCase(),id=String(u.searchParams.get('id')||'');
  const valid=kind==='article'?/^\d+$/.test(id):kind==='structure'?/^CUH-[A-Za-z0-9_-]+$/i.test(id):false;
  if(!valid){const page=errorPage(400,'Invalid record identifier','The requested CuHalide Atlas record identifier is not valid.');res.statusCode=400;setCommonHeaders(res,page.csp);res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');if(req.method==='HEAD')return res.end();return res.end(page.html)}
  try{
    const result=await getRecord(kind,id);
    if(result.state==='not-found'){const page=errorPage(404,'Record not found','No current public CuHalide Atlas record matches this identifier.');res.statusCode=404;setCommonHeaders(res,page.csp);res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');if(req.method==='HEAD')return res.end();return res.end(page.html)}
    if(result.state!=='ok')throw Error(`record backend ${result.status||'unexpected response'}`);
    const page=kind==='article'?articlePage(result.item):structurePage(result.item);
    res.statusCode=200;setCommonHeaders(res,page.csp);res.setHeader('Cache-Control','public, max-age=300, stale-while-revalidate=3600');res.setHeader('Last-Modified',new Date(`${CURRENT_DATE}T00:00:00Z`).toUTCString());
    if(req.method==='HEAD')return res.end();return res.end(page.html);
  }catch(error){console.error('[record-page-v50.1]',error);const page=errorPage(503,'Record temporarily unavailable','The record service could not confirm current data after retrying. Please try again shortly.');res.statusCode=503;setCommonHeaders(res,page.csp);res.setHeader('Cache-Control','no-store');res.setHeader('Retry-After','30');res.setHeader('X-Robots-Tag','noindex, nofollow');if(req.method==='HEAD')return res.end();return res.end(page.html)}
}
