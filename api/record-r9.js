import crypto from 'node:crypto';
import currentRecord from './record-evidence-current.js';
const REV='9',SITE='51',UI='51.0',PUBLIC_DATA='2.17.1',PH='1.4.0',OC='1.2.0',STATE='prepublication-review';
const all=(s,a,b)=>String(s).split(a).join(b);
function requestKind(req){try{return String(new URL(String(req?.url||'/'),'http://local').searchParams.get('kind')||'').toLowerCase()}catch{return''}}
function patch(body,kind){
  if(typeof body!=='string')return body;
  let x=body;
  for(const a of ['Current Curated rev.8','Current Curated rev.7','Current Curated rev.6'])x=all(x,a,'Current Curated rev.9');
  for(const a of ['current-curated-r8','current-curated-r7','current-curated-r6'])x=all(x,a,'current-curated-r9');
  for(const a of ['current-r8','current-r7','current-r6'])x=all(x,a,'current-r9');
  x=all(x,'content="8"','content="9"');
  x=all(x,'Structured Photophysics 1.3.3','Structured Photophysics 1.4.0');
  x=all(x,'Photophysics 1.3.3','Photophysics 1.4.0');
  x=all(x,'Organic Components 1.1.0','Organic Components 1.2.0');
  x=all(x,'Organic Components 1.1','Organic Components 1.2');
  x=all(x,'Contract 1.1.0','Contract 1.2.0');
  if(kind==='article'&&!x.includes('Record not found')){
    x=all(x,'<dt>Dimensionality</dt><dd>','<dt>Article index class</dt><dd>');
    const marker='</dl><p>';
    if(x.includes(marker))x=x.replace(marker,'</dl><p class="fine"><strong>Grain note:</strong> Article index class is a literature-retrieval label, not a structure-grain connectivity assignment. A single article may contain determinations with different dimensionalities; use linked structure records for physical dimensionality.</p><p>');
    if(x.includes('<dt>Dimensionality</dt>'))throw new Error('article page exposes article index class as structure dimensionality');
    if(!x.includes('Article index class')||!x.includes('literature-retrieval label'))throw new Error('article dimension grain guard missing');
  }
  return x
}
function hashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const c=String(res.getHeader?.('Content-Security-Policy')||'');if(!c)return;const hs=hashes(html);if(!hs.length)return;let next=c.replace(/\bscript-src\s+[^;]*;/i,`script-src 'self' ${hs.join(' ')};`);if(/script-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline forbidden');res.setHeader('Content-Security-Policy',next)}
export default async function handler(req,res){
  const kind=requestKind(req);
  res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Site-Version',SITE);res.setHeader('X-CuHalide-UI-Version',UI);res.setHeader('X-CuHalide-Public-Data-Version',PUBLIC_DATA);res.setHeader('X-CuHalide-Photophysics-Contract',PH);res.setHeader('X-CuHalide-Organic-Components-Contract',OC);res.setHeader('X-CuHalide-Publication-State',STATE);
  const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-site-version')v=SITE;if(n==='x-cuhalide-ui-version')v=UI;if(n==='x-cuhalide-public-data-version')v=PUBLIC_DATA;if(n==='x-cuhalide-photophysics-contract')v=PH;if(n==='x-cuhalide-organic-components-contract')v=OC;if(n==='x-cuhalide-publication-state')v=STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{const out=patch(body,kind);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});return currentRecord(req,bridge)
}
