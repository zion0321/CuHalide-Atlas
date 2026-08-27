import crypto from 'node:crypto';
import currentUi from './ui-assistant-current.js';

const REV='9',UI='51.0',SITE='51',PUBLICATION_STATE='prepublication-review',DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${DATE}T00:00:00Z`).toUTCString();
const all=(s,a,b)=>String(s).split(a).join(b);
function patch(input){
  if(typeof input!=='string')return input;
  let x=input;
  for(const a of ['Current Curated rev.8','Current Curated rev.7','Current Curated rev.6'])x=all(x,a,'Current Curated rev.9');
  for(const a of ['current-curated-r8','current-curated-r7','current-curated-r6'])x=all(x,a,'current-curated-r9');
  for(const a of ['current-r8','current-r7','current-r6'])x=all(x,a,'current-r9');
  for(const a of ['CUHALIDE_UI_V50_2_CURRENT_R8','CUHALIDE_UI_V50_2_CURRENT_R7','CUHALIDE_UI_V50_2_CURRENT_R6'])x=all(x,a,'CUHALIDE_UI_V51_0_CURRENT_R9');
  for(const a of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R8','CUHALIDE_SITE_V50_CURRENT_CURATED_R7','CUHALIDE_SITE_V50_CURRENT_CURATED_R6'])x=all(x,a,'CUHALIDE_SITE_V51_CURRENT_CURATED_R9');
  x=all(x,'<meta name="cuhalide-site-version" content="50">','<meta name="cuhalide-site-version" content="51">');
  x=all(x,'946 atomic/context structure records','947 atomic/context structure records');
  x=all(x,'946 structure/phase rows','947 structure/phase rows');
  x=all(x,'946 structure rows','947 structure rows');
  x=all(x,'946-row Current Curated snapshot','947-row Current Curated snapshot');
  x=all(x,'946-row taxonomy','947-row taxonomy');
  x=all(x,'All structure / phase rows · n=946','All structure / phase rows · n=947');
  x=all(x,'All structure / phase rows · n = 946','All structure / phase rows · n = 947');
  x=all(x,'Core-Included · n=886','Core-Included · n=887');
  x=all(x,'Core-Included structure rows · n = 886','Core-Included structure rows · n = 887');
  x=all(x,'Resolved structure rows · n = 710','Resolved structure rows · n = 744');
  x=all(x,'cc.core_included_structure_rows||886','cc.core_included_structure_rows||887');
  x=all(x,'cc.structure_phase_rows||946','cc.structure_phase_rows||947');
  x=all(x,"'Audit view: all 946 structure/phase rows.'","'Audit view: all 947 structure/phase rows.'");
  x=all(x,'<div class="polar-num"><strong>87</strong><small>strict-polar rows · 54 articles</small></div>','<div class="polar-num"><strong>91</strong><small>strict-polar rows · 57 articles</small></div>');
  x=all(x,'<strong id="pcount">87 rows</strong>','<strong id="pcount">91 rows</strong>');
  x=all(x,'cc.verified_space_group_rows||684','cc.verified_space_group_rows||717');
  x=all(x,'cc.strict_polar_rows||87','cc.strict_polar_rows||91');
  x=all(x,'cc.strict_polar_articles||54','cc.strict_polar_articles||57');
  for(const n of ['6','7','8'])x=all(x,`cc.live_revision||${n}`,'cc.live_revision||9');
  x=all(x,'1,329-document Current Curated rev.9','1,330-document Current Curated rev.9');
  x=all(x,'1,329 BGE-M3','1,330 BGE-M3');
  x=all(x,'1329-document','1330-document');
  x=all(x,'1329 documents','1330 documents');
  x=all(x,'Smart RAG 9.19.0','Smart RAG 9.20.0');
  x=all(x,'Structured Photophysics 1.3.3','Structured Photophysics 1.4.0');
  x=all(x,'Photophysics 1.3.3','Photophysics 1.4.0');
  x=all(x,'Organic Components 1.1.0','Organic Components 1.2.0');
  x=all(x,'Organic Components 1.1','Organic Components 1.2');
  x=all(x,'Contract 1.1.0','Contract 1.2.0');
  x=all(x,'backend rev.8 deterministic contract','backend rev.9 deterministic contract');
  x=all(x,'Rev.8 incorporates primary-source-reverified structure corrections while preserving the immutable archived scientific snapshot 3.0.2.','Rev.9 closes structure/member identity and terminal evidence boundaries while preserving the immutable archived scientific snapshot 3.0.2.');
  x=all(x,'<span>Dimensionality</span><select id="adim">','<span>Article index class</span><select id="adim">');
  x=all(x,'<span class="badge">${esc(a.dimensionality_class)}</span>','<span class="badge">Article index · ${esc(a.dimensionality_class)}</span>');
  x=all(x,'<dt>Dimension</dt><dd>${esc(x.dimensionality_class)}</dd>','<dt>Article index class</dt><dd>${esc(x.dimensionality_class)}</dd>');
  x=all(x,'<p class="fine" id="articleHalogenNote">Single-halogen filters include mixed records containing that halogen; mixed labels are exact curated categories.</p>','<p class="fine" id="articleHalogenNote">Single-halogen filters include mixed records containing that halogen; mixed labels are exact curated categories.</p><p class="fine" id="articleDimensionNote"><strong>Grain note:</strong> Article index classes are retrieval aids only. Physical connectivity dimensionality belongs to structure/phase determinations and may vary within one article; use the Structure register for structure-grain dimensionality.</p>');
  x=all(x,'<article class="card method"><span class="no">06</span><h2>Evidence grain</h2><p>Article-level photophysics is not assigned to an individual structure/phase unless a structure-grain evidence mapping establishes that link.</p></article>','<article class="card method"><span class="no">06</span><h2>Evidence grain</h2><p>Article index classes are retrieval metadata, not structure-grain dimensionality. Article-level photophysics is likewise not assigned to an individual structure/phase unless a structure-grain evidence mapping establishes that link.</p></article>');
  if(!x.includes('CUHALIDE_UI_V51_0_CURRENT_R9')||!x.includes('Current Curated rev.9'))throw new Error('rev.9 UI adapter contract missing');
  for(const stale of ['Core-Included structure rows · n = 886','cc.core_included_structure_rows||886','cc.structure_phase_rows||946','Audit view: all 946 structure/phase rows.','1,329-document Current Curated rev.9','<meta name="cuhalide-site-version" content="50">'])if(x.includes(stale))throw new Error(`stale rev.9 display token: ${stale}`);
  for(const required of ['Article index class','Article index · ${esc(a.dimensionality_class)}','Article index classes are retrieval aids only','Article index classes are retrieval metadata, not structure-grain dimensionality'])if(!x.includes(required))throw new Error(`article dimension grain UI guard missing: ${required}`);
  return x;
}
function hashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const c=String(res.getHeader?.('Content-Security-Policy')||'');if(!c)return;const hs=hashes(html);if(!hs.length)return;const next=c.replace(/\bscript-src\s+[^;]*;/i,`script-src 'self' ${hs.join(' ')};`);if(/script-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline forbidden');res.setHeader('Content-Security-Policy',next)}
export default async function handler(req,res){
  res.setHeader('X-CuHalide-Site-Version',SITE);res.setHeader('X-CuHalide-UI-Version',UI);res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Publication-State',PUBLICATION_STATE);res.setHeader('Last-Modified',LAST_MODIFIED);
  const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-ui-version')v=UI;if(n==='x-cuhalide-site-version')v=SITE;if(n==='x-cuhalide-publication-state')v=PUBLICATION_STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{const out=patch(body);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});
  return currentUi(req,bridge);
}
