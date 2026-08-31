import crypto from 'node:crypto';
import currentMotifs from './motifs.js';
const REV='9',SITE='51',UI='51.0',STATE='prepublication-review';
const all=(s,a,b)=>String(s).split(a).join(b);
function patch(body){
  if(typeof body!=='string')return body;
  let x=body;
  for(const a of ['Current Curated rev.8','Current Curated rev.7','Current Curated rev.6'])x=all(x,a,'Current Curated rev.9');
  for(const a of ['current-r8','current-r7','current-r6'])x=all(x,a,'current-r9');
  for(const a of ['rev.8','rev.7','rev.6'])x=all(x,a,'rev.9');
  for(const a of ['Rev.8','Rev.7','Rev.6'])x=all(x,a,'Rev.9');
  x=all(x,'content="8"','content="9"');
  x=all(x,'946-row taxonomy','947-row taxonomy');x=all(x,'946 structure rows','947 structure rows');x=all(x,'946-row Current Curated snapshot','947-row Current Curated snapshot');

  x=all(x,'grid-template-columns:repeat(4,1fr)','grid-template-columns:repeat(2,1fr)');
  x=x.replace(/<option value="Unresolved legacy mapping"[^>]*>Unresolved legacy mapping<\/option>/g,'');
  x=x.replace(/<p>Explore normalized Cu–halide building units across Current Curated rev\.9\.[\s\S]*?<\/p>/,'<p>Explore source-resolved Cu–halide building units and compare their local motif with the dimensionality of the extended structure.</p>');
  x=x.replace(/<span class="status">Prepublication review · Curated through 19 Aug 2026 · rev\.9<\/span>/,'<span class="status">Curated through 19 Aug 2026</span>');
  x=x.replace(/<div class="overview"><article class="stat"><span>Taxonomy rows<\/span><strong>(\d+)<\/strong><p class="fine">[\s\S]*?<\/article><article class="stat"><span>Motif resolved<\/span><strong>(\d+)<\/strong><p class="fine">[\s\S]*?<\/article><article class="stat"><span>Motif unresolved<\/span><strong>\d+<\/strong><p class="fine">[\s\S]*?<\/article><article class="stat"><span>Legacy category unresolved<\/span><strong>\d+<\/strong><p class="fine">[\s\S]*?<\/article><\/div>/,(_m,total,resolved)=>`<div class="overview"><article class="stat"><span>Structures</span><strong>${total}</strong><p class="fine">taxonomy coverage</p></article><article class="stat"><span>Source-resolved motifs</span><strong>${resolved}</strong><p class="fine">local Cu–X units</p></article></div>`);
  x=x.replace(/<div class="notice"><strong>Conservative motif rule:<\/strong>[\s\S]*?<\/div>/,'<div class="notice"><strong>How to read motifs:</strong> a local Cu–X motif and the dimensionality of the extended inorganic structure are different properties. A motif is shown only when it is established from structure-level evidence.</div>');
  x=x.replace(/<article class="card"><strong>Unresolved legacy mapping<\/strong><p class="fine">[\s\S]*?<\/p><\/article>/g,'');
  x=x.replace(/<tr><td>[^<]*<\/td><td>Unresolved<\/td><td>[^<]*<\/td><td>[^<]*<\/td><td>[^<]*<\/td><\/tr>/g,'');
  x=all(x,'<td>Unresolved legacy mapping</td>','<td>—</td>');
  x=all(x,'Resolved and unresolved Cu–X motif families by material class','Source-resolved Cu–X motif families by material class');
  x=x.replace(/<article class="card"><strong><a href="\/structure\/[^\"]+">[\s\S]*?<\/a><\/strong><p class="fine">[^<]* · [^<]* · Unresolved · [^<]*<\/p><\/article>/g,'');
  x=x.replace(/<div class="provenance"><strong>Evidence boundary\.<\/strong>[\s\S]*?<\/div>/,'<div class="provenance">Motifs are shown only when supported at the structure level. Open an individual structure record for crystallographic context and source links.</div>');
  if(/\brev\.[678]\b/i.test(x))throw new Error('stale current-curated revision in Motif Atlas');
  if(x.includes('<td>Unresolved</td>')||x.includes('Unresolved legacy mapping')||x.includes('Legacy category unresolved')||x.includes('Motif unresolved'))throw new Error('unresolved QA state remains promoted as a Motif Atlas category');
  return x
}
function hashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const c=String(res.getHeader?.('Content-Security-Policy')||'');if(!c)return;const hs=hashes(html);if(!hs.length)return;let next=c;if(/script-src\s+[^;]*;/i.test(next))next=next.replace(/script-src\s+[^;]*;/i,`script-src ${hs.join(' ')};`);if(/style-src\s+[^;]*;/i.test(next)){const style=String(html).match(/<style>([\s\S]*?)<\/style>/i)?.[1];if(style){const h=`'sha256-${crypto.createHash('sha256').update(style).digest('base64')}'`;next=next.replace(/style-src\s+[^;]*;/i,`style-src ${h};`)}}res.setHeader('Content-Security-Policy',next)}
export default async function handler(req,res){
  res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Site-Version',SITE);res.setHeader('X-CuHalide-UI-Version',UI);res.setHeader('X-CuHalide-Publication-State',STATE);
  const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-site-version')v=SITE;if(n==='x-cuhalide-ui-version')v=UI;if(n==='x-cuhalide-publication-state')v=STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{const out=patch(body);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});return currentMotifs(req,bridge)
}
