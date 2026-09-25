import crypto from 'node:crypto';
import currentRecord from './record-evidence-current.js';
const REV='10',SITE='52',UI='52.0',PUBLIC_DATA='2.18.0',PH='1.4.0',OC='1.2.0',STATE='prepublication-review';
const all=(s,a,b)=>String(s).split(a).join(b);
function requestKind(req){try{return String(new URL(String(req?.url||'/'),'http://local').searchParams.get('kind')||'').toLowerCase()}catch{return''}}
function patch(body,kind){
  if(typeof body!=='string')return body;
  let x=body;
  for(const a of ['Current Curated rev.9','Current Curated rev.8','Current Curated rev.7','Current Curated rev.6'])x=all(x,a,'Current Curated rev.10');
  for(const a of ['current-curated-r9','current-curated-r8','current-curated-r7','current-curated-r6'])x=all(x,a,'current-curated-r10');
  for(const a of ['current-r9','current-r8','current-r7','current-r6'])x=all(x,a,'current-r10');
  x=all(x,'content="9"','content="10"');x=all(x,'content="8"','content="10"');
  x=all(x,'2026-08-19','2026-09-14');x=all(x,'19 Aug 2026','14 Sep 2026');
  x=all(x,'CuHalide Research Assistant','CuXplore');x=all(x,'CuXplore Research Assistant','CuXplore');x=all(x,'Research Assistant','CuXplore');
  for(const v of ['1.3.0','1.3.1','1.3.2','1.3.3']){x=all(x,`Structured Photophysics ${v}`,'Structured Photophysics 1.4.0');x=all(x,`Photophysics ${v}`,'Photophysics 1.4.0')}
  x=all(x,'Organic Components 1.1.0','Organic Components 1.2.0');
  x=all(x,'Organic Components 1.1','Organic Components 1.2');
  x=all(x,'Contract 1.1.0','Contract 1.2.0');
  x=all(x,'src="/organic-components-v1.js"','src="/organic-components-v1.js?v=1.2.0"');
  const validRecord=!x.includes('Record not found')&&!x.includes('Record temporarily unavailable')&&!x.includes('Invalid record identifier');
  x=all(x,'Current Curated rev.10 context · core article record inherited from immutable Frozen Release 3.0.2 baseline','Curated through 14 Sep 2026 · source-linked article record');
  x=all(x,'Current Curated rev.10 · primary-evidence reviewed through 14 Sep 2026','Curated through 14 Sep 2026');
  if(kind==='structure'&&validRecord){
    x=all(x,'Motif confidence','Motif adjudication confidence');
    x=all(x,'Normalized reported identity','Machine-normalized identity key');
    x=x.replace(/<dt>Motif adjudication confidence<\/dt><dd>[\s\S]*?<\/dd>/i,'');
    x=x.replace(/<dt>Machine-normalized identity key<\/dt><dd>[\s\S]*?<\/dd>/i,'');
    x=x.replace(/<dt>SG \/ mapping confidence<\/dt><dd>[\s\S]*?<\/dd>/i,'');
    x=all(x,'<dd>Unresolved</dd>','<dd>Not established from available evidence</dd>');
    x=all(x,'<p class="fine">Contract 1.2.0 · field-whitelisted structure-grain projection. Deterministic 2D connectivity is loaded only for independently verified identities; unresolved identities remain fail-closed.</p>','<p class="fine">2D connectivity is shown only when it is uniquely established from source evidence.</p>');
    const graphs='<script src="/organic-components-graphs-11.js?v=1.2.0" defer></script>';
    const ocRe=/<script\b(?=[^>]*\bsrc=["']\/organic-components-v1\.js\?v=1\.2\.0["'])[^>]*><\/script>/i;
    if(!x.includes('/organic-components-graphs-11.js?v=1.2.0')&&ocRe.test(x))x=x.replace(ocRe,m=>`${graphs}${m}`);
  }
  if(kind==='article'&&validRecord){
    x=x.replace(/<dt>Dimensionality<\/dt><dd>[\s\S]*?<\/dd>/i,'');
    x=x.replace(/<dt>Article index class<\/dt><dd>[\s\S]*?<\/dd>/i,'');
    x=x.replace(/<p class="fine"><strong>Grain note:<\/strong>[\s\S]*?<\/p>/i,'');
  }
  for(const stale of ['Contract 1.1.0','Organic Components 1.1','Photophysics 1.3.','src="/organic-components-v1.js"'])if(x.includes(stale))throw new Error(`stale record browser contract: ${stale}`);
  if(kind==='structure'&&validRecord){
    if(!x.includes('/organic-components-v1.js?v=1.2.0'))throw new Error('structure record Organic Components 1.2.0 asset missing');
    if(!x.includes('/organic-components-graphs-11.js?v=1.2.0'))throw new Error('structure record rev.10 Organic renderer layer missing');
    if(x.indexOf('/organic-components-graphs-11.js?v=1.2.0')>x.indexOf('/organic-components-v1.js?v=1.2.0'))throw new Error('structure record Organic renderer must load before Organic Components runtime');
    for(const hidden of ['Motif adjudication confidence','Machine-normalized identity key','SG / mapping confidence'])if(x.includes(hidden))throw new Error(`internal standalone structure field remains visible: ${hidden}`);
  }
  if(/Current Curated rev\.9|current-curated-r9|current-r9/.test(x))throw new Error('stale rev.9 record browser state');
  if(x.includes('</body>')){x=x.replace('</head>','<link rel="stylesheet" href="/ui-quality-v52.css?v=52.2"><link rel="stylesheet" href="/cuxplore-v1.css?v=52.1"></head>');if(!x.includes('Record not found')&&!x.includes('Invalid record identifier'))x=x.replace('</body>','<script src="/cuxplore-v1.js?v=52.1" defer></script><script src="/ui-quality-v52.js?v=52.2" defer></script></body>');}
  return x
}
function hashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
export function syncCsp(html,res){
  const current=String(res.getHeader?.('Content-Security-Policy')||'');
  if(!current)return;
  const policy=new Map(current.split(';').map(v=>v.trim()).filter(Boolean).map(v=>{const [name,...values]=v.split(/\s+/);return[name,values]}));
  const script=hashes(html);
  const styles=[...String(html).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>`'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);
  // Permit only the same-origin coverage client and endpoint. All other
  // source, framing, form, object and privacy restrictions remain intact.
  policy.set('script-src',["'self'",...script]);
  policy.set('style-src',["'self'",...styles]);
  policy.set('connect-src',["'self'"]);
  for(const key of ['script-src-elem','style-src-elem'])if(policy.has(key))policy.set(key,policy.get(key.startsWith('script')?'script-src':'style-src'));
  const next=[...policy].map(([key,values])=>[key,...new Set(values)].join(' ')).join('; ')+';';
  if(/(?:script-src|style-src)[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline forbidden');
  res.setHeader('Content-Security-Policy',next);
}

export default async function handler(req,res){
  const kind=requestKind(req);
  res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Site-Version',SITE);res.setHeader('X-CuHalide-UI-Version',UI);res.setHeader('X-CuHalide-Public-Data-Version',PUBLIC_DATA);res.setHeader('X-CuHalide-Photophysics-Contract',PH);res.setHeader('X-CuHalide-Organic-Components-Contract',OC);res.setHeader('X-CuHalide-Publication-State',STATE);
  const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-site-version')v=SITE;if(n==='x-cuhalide-ui-version')v=UI;if(n==='x-cuhalide-public-data-version')v=PUBLIC_DATA;if(n==='x-cuhalide-photophysics-contract')v=PH;if(n==='x-cuhalide-organic-components-contract')v=OC;if(n==='x-cuhalide-publication-state')v=STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{const out=patch(body,kind);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});return currentRecord(req,bridge)
}
