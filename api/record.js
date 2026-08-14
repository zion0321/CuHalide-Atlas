import crypto from 'node:crypto';

const PUBLIC_ORIGIN='https://cuhalide-atlas-v3.vercel.app';
const DATA='https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
const RELEASE='3.0.2',SITE_VERSION='48',CURRENT_REVISION='3',CURRENT_DATE='2026-08-14';
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha=(v)=>`'sha256-${crypto.createHash('sha256').update(v).digest('base64')}'`;
const curationStatus=(v)=>['Core - Verified','Current Curated - Verified'].includes(v)?'Curated':v==='Context - Boundary'?'Boundary context':v==='Excluded - Curated Audit'?'Excluded':v==='Pending - Primary Evidence Unavailable'?'Evidence pending':v||'Unresolved';

async function getRecord(kind,id){
  const u=new URL(DATA);u.searchParams.set('action',kind);u.searchParams.set('id',id);
  const r=await fetch(u,{headers:{accept:'application/json','user-agent':'CuHalide-Atlas-Record-Page/48.4'},signal:AbortSignal.timeout(30000)}),raw=await r.text();
  let data;try{data=JSON.parse(raw)}catch{data=null}
  return r.ok&&data?.item?data.item:null;
}

function provenance(x){
  const rolling=x.curation_layer==='Current Curated'||Number(x.live_revision||0)>0;
  return rolling?{
    rolling:true,
    label:'Curated record',
    detail:'Curated after archived snapshot 3.0.2 · primary-evidence reviewed through 14 Aug 2026',
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

function layout({title,description,canonical,body,jsonLd,prov,ogType='website'}){
  const style=`:root{color-scheme:light;--ink:#102a38;--muted:#627681;--navy:#0b2a3d;--teal:#1f7e74;--soft:#e8f4f2;--bg:#f6f8f9;--line:#dce5e8;--shadow:0 14px 38px rgba(9,40,60,.065)}*{box-sizing:border-box}html,body{margin:0;max-width:100%}body{background:var(--bg);color:var(--ink);font:15px/1.68 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.top{background:rgba(255,255,255,.96);border-bottom:1px solid var(--line)}.topin{width:min(980px,calc(100% - 32px));min-height:68px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-weight:900;color:var(--navy);text-decoration:none}.topnav{display:flex;gap:16px;flex-wrap:wrap}.topnav a{color:#4d6672;text-decoration:none;font-size:11px;font-weight:800}.topnav a:hover{color:var(--teal)}main{width:min(920px,calc(100% - 32px));margin:52px auto 62px}.eyebrow{margin:22px 0 8px;color:var(--teal);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}h1{font:clamp(34px,5vw,54px)/1.08 Georgia,"Times New Roman",serif;letter-spacing:-.035em;color:var(--navy);margin:0 0 18px;overflow-wrap:anywhere}.meta,.fine{color:var(--muted)}.meta{line-height:1.6}.fine{font-size:11px}.status{display:inline-flex;align-items:center;gap:7px;background:var(--soft);color:#17675f;border:1px solid #cee7e2;border-radius:999px;padding:6px 10px;font-size:10px;font-weight:850}.status:before{content:"";width:7px;height:7px;border-radius:50%;background:#2c9588}.provenance{margin:13px 0 0;color:#647982;font-size:10.5px}.card{margin-top:24px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;box-shadow:var(--shadow)}.grid{display:grid;grid-template-columns:180px minmax(0,1fr);gap:9px 18px}.grid dt{color:var(--muted)}.grid dd{margin:0;font-weight:650;overflow-wrap:anywhere}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;align-items:center;min-height:40px;border-radius:10px;padding:9px 14px;text-decoration:none;font-weight:800;font-size:12px}.primary{background:var(--teal);color:#fff}.secondary{border:1px solid var(--line);background:#fff;color:var(--navy)}.components{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.component{background:#f7fafb;border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}.component strong,.component span{display:block;overflow-wrap:anywhere}.component span{color:var(--muted);font-size:11px;margin-top:3px}.data-note{margin-top:30px;padding:16px 17px;border:1px solid var(--line);border-radius:13px;background:#fbfcfc}.data-note strong{display:block;color:var(--navy);margin-bottom:4px}.data-note p{margin:4px 0;font-size:11px;color:var(--muted)}@media(max-width:640px){.topin{align-items:flex-start;flex-direction:column;padding:14px 0}.topnav{gap:12px}.topnav a{font-size:10.5px}main{margin:34px auto 46px}.grid{grid-template-columns:1fr}.components{grid-template-columns:1fr}.card{padding:19px}}`;
  const ld=JSON.stringify(jsonLd).replace(/</g,'\\u003c');
  const csp=`default-src 'none'; img-src 'self'; style-src ${sha(style)}; script-src ${sha(ld)}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  const note=`<div class="data-note"><strong>Data provenance</strong><p>This page reflects the latest curated public record available in CuHalide Atlas. Cite living results with an access date. Archived scientific snapshot 3.0.2 remains immutable for exact historical reproduction.</p><p>Public pages expose only field-whitelisted information; primary PDF/SI/CIF and private curation evidence remain private.</p></div>`;
  return{csp,html:`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="description" content="${esc(description)}"><meta name="cuhalide-release" content="${RELEASE}"><meta name="cuhalide-current-curated-revision" content="${CURRENT_REVISION}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${esc(ogType)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${PUBLIC_ORIGIN}/og-image.svg"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${esc(canonical)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>${esc(title)} — CuHalide Atlas</title><style>${style}</style><script type="application/ld+json">${ld}</script></head><body><header class="top"><div class="topin"><a class="brand" href="${PUBLIC_ORIGIN}/">CuHalide Atlas</a><nav class="topnav" aria-label="Primary"><a href="${PUBLIC_ORIGIN}/#articles">Literature</a><a href="${PUBLIC_ORIGIN}/#structures">Structures</a><a href="${PUBLIC_ORIGIN}/motifs">Motifs</a><a href="${PUBLIC_ORIGIN}/#rag">Smart RAG</a></nav></div></header><main>${body}${note}</main></body></html>`};
}

function articlePage(x){
  const prov=provenance(x),canonical=`${PUBLIC_ORIGIN}/article/${encodeURIComponent(x.record_id)}`,doi=x.doi_url||(x.doi?`https://doi.org/${x.doi}`:'');
  const description=`CuHalide Atlas curated article record. ${x.journal||'Journal'} ${x.year||''}. ${x.structure_summary||'Curated Cu(I) halide evidence.'}`.replace(/\s+/g,' ').trim().slice(0,280);
  const body=`<p class="eyebrow">Article record ${esc(x.record_id)}</p><span class="status">${esc(prov.label)}</span><p class="provenance">${esc(prov.detail)}</p><h1>${esc(x.title)}</h1><p class="meta">${esc(x.authors)}${x.journal?` · ${esc(x.journal)}`:''}${x.year?` · ${esc(x.year)}`:''}</p><section class="card"><dl class="grid"><dt>DOI</dt><dd>${doi?`<a href="${esc(doi)}" rel="noreferrer">${esc(x.doi)}</a>`:'Not recorded'}</dd><dt>Curation status</dt><dd>${esc(curationStatus(x.release_status))}</dd><dt>Halogen set</dt><dd>${esc(x.halogen||'Unresolved')}</dd><dt>Dimensionality</dt><dd>${esc(x.dimensionality_class||'Unresolved')}</dd><dt>Category</dt><dd>${esc(x.category||'Unresolved')}</dd><dt>Scope</dt><dd>${esc(x.scope_status||'Unresolved')}</dd><dt>Evidence</dt><dd>${esc(x.evidence_level||'Unresolved')}</dd></dl><p>${esc(x.structure_summary||'No public structural summary recorded.')}</p></section><div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#article/${esc(x.record_id)}">Open interactive record</a>${doi?`<a class="btn secondary" href="${esc(doi)}" rel="noreferrer">Open DOI</a>`:''}</div>`;
  const jsonLd={'@context':'https://schema.org','@type':'ScholarlyArticle',headline:x.title,name:x.title,identifier:x.doi||`CuHalide Atlas Record ${x.record_id}`,url:canonical,sameAs:doi||undefined,datePublished:x.year?String(x.year):undefined,dateModified:prov.modified,isPartOf:{'@type':'Dataset',name:prov.dataset,version:prov.version,url:PUBLIC_ORIGIN}};
  return layout({title:x.title,description,canonical,body,jsonLd,prov,ogType:'article'});
}

function structurePage(x){
  const prov=provenance(x),canonical=`${PUBLIC_ORIGIN}/structure/${encodeURIComponent(x.structure_id)}`;
  const motif=x.motif_details&&typeof x.motif_details==='object'?x.motif_details:{},components=Array.isArray(x.organic_components)?x.organic_components:[];
  const description=`CuHalide Atlas curated structure record. ${x.formula||x.label||x.structure_id}; ${x.dimensionality||'dimensionality unresolved'}; ${motif.formula?`motif ${motif.formula}; `:''}${x.space_group?`space group ${x.space_group}`:'space group unresolved'}.`.slice(0,280);
  const componentHtml=components.length?`<section class="card"><p class="eyebrow">Organic components</p><p class="fine">Evidence tier is shown per component; legacy token-derived labels are not presented as primary-evidence identities.</p><div class="components">${components.map(c=>`<div class="component"><strong>${esc(c.name||c.abbreviation||'Unresolved')}</strong><span>${esc([c.abbreviation&&c.abbreviation!==c.name?c.abbreviation:'',c.role,c.donor_atoms?`donor atoms ${c.donor_atoms}`:'',c.confidence].filter(Boolean).join(' · '))}</span></div>`).join('')}</div></section>`:'';
  const body=`<p class="eyebrow">Structure / phase record ${esc(x.structure_id)}</p><span class="status">${esc(prov.label)}</span><p class="provenance">${esc(prov.detail)}</p><h1>${esc(x.label||x.structure_id)}</h1><p class="meta">Record ${esc(x.record_id)} · ${esc(x.article_title||'')}</p><section class="card"><dl class="grid"><dt>Formula</dt><dd>${esc(x.formula||'Not recorded')}</dd><dt>Phase / condition</dt><dd>${esc(x.phase||'Not recorded')}</dd><dt>Halogen</dt><dd>${esc(x.halogen||'Unresolved')}</dd><dt>Halogen evidence</dt><dd>${esc(x.halogen_scope||'unresolved')} · ${esc(x.halogen_confidence||'Unresolved')}</dd><dt>Dimensionality</dt><dd>${esc(x.dimensionality||'Unresolved')}</dd><dt>Cu–X motif</dt><dd>${esc(motif.formula||'Unresolved')}</dd><dt>Motif geometry</dt><dd>${esc(motif.geometry||'Unresolved')}</dd><dt>Motif confidence</dt><dd>${esc(motif.confidence||'Unresolved')}</dd><dt>Normalized reported identity</dt><dd>${esc(motif.identity_key||x.chemical_identity_status||'Unresolved')}</dd><dt>Space group</dt><dd>${esc(x.space_group||'Unresolved')}</dd><dt>Point group</dt><dd>${esc(x.point_group||'Unresolved')}</dd><dt>Crystal system</dt><dd>${esc(x.crystal_system||'Unresolved')}</dd><dt>Polar</dt><dd>${esc(x.polar||'Unresolved')}</dd><dt>SG / mapping confidence</dt><dd>${esc(x.sg_confidence||'Unresolved')} / ${esc(x.mapping_confidence||'Unresolved')}</dd></dl></section>${componentHtml}<div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#structure/${encodeURIComponent(x.structure_id)}">Open interactive record</a><a class="btn secondary" href="${PUBLIC_ORIGIN}/motifs${motif.formula&&motif.formula!=='Unresolved'?`?motif=${encodeURIComponent(motif.formula)}`:''}">Open Motif Atlas</a>${x.doi_url?`<a class="btn secondary" href="${esc(x.doi_url)}" rel="noreferrer">Open source DOI</a>`:''}</div>`;
  const jsonLd={'@context':'https://schema.org','@type':'Dataset',name:x.label||x.structure_id,identifier:x.structure_id,url:canonical,version:prov.version,dateModified:prov.modified,citation:x.doi_url||x.doi||undefined,keywords:[motif.formula,motif.geometry,x.dimensionality,x.space_group].filter(Boolean),isPartOf:{'@type':'Dataset',name:prov.dataset,version:prov.version,url:PUBLIC_ORIGIN}};
  return layout({title:x.label||x.structure_id,description,canonical,body,jsonLd,prov});
}

export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed')}
  const u=new URL(req.url,PUBLIC_ORIGIN),kind=String(u.searchParams.get('kind')||'').toLowerCase(),id=String(u.searchParams.get('id')||'');
  const valid=kind==='article'?/^\d+$/.test(id):kind==='structure'?/^CUH-[A-Za-z0-9_-]+$/i.test(id):false;
  if(!valid){res.statusCode=400;res.setHeader('Content-Type','text/plain; charset=utf-8');return res.end('Invalid record identifier')}
  try{
    const item=await getRecord(kind,id);if(!item){res.statusCode=404;return res.end('Record not found')}
    const page=kind==='article'?articlePage(item):structurePage(item);
    res.statusCode=200;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','public, max-age=300, stale-while-revalidate=3600');res.setHeader('Content-Security-Policy',page.csp);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-CuHalide-Release',RELEASE);res.setHeader('X-CuHalide-Site-Version',SITE_VERSION);res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
    if(req.method==='HEAD')return res.end();return res.end(page.html);
  }catch(error){console.error('[record-page]',error);res.statusCode=502;res.setHeader('Content-Type','text/plain; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.end('Record page temporarily unavailable')}
}
