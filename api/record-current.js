import crypto from 'node:crypto';
import recordHandler from './record.js';

const CURRENT_REVISION='7';
const CONTENT_DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();
const ROBOTS_META='<meta name="robots" content="noindex,nofollow,noarchive">';

function normalize(body){
  if(typeof body!=='string')return body;
  return body
    .split('<meta name="cuhalide-current-curated-revision" content="6">').join('<meta name="cuhalide-current-curated-revision" content="7">')
    .split('<meta name="robots" content="index,follow,max-image-preview:large">').join(ROBOTS_META)
    .split('Current Curated rev.6 · primary-evidence reviewed through 18 Aug 2026').join('Current Curated rev.7 · primary-evidence reviewed through 19 Aug 2026')
    .split('current-r6').join('current-r7')
    .split('2026-08-18').join('2026-08-19');
}
function inlineScriptHashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))!==null){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const current=String(res.getHeader?.('Content-Security-Policy')||'');if(!current)return;const hashes=inlineScriptHashes(html);if(!hashes.length)return;const next=current.replace(/\bscript-src\s+[^;]*;/i,`script-src ${hashes.join(' ')};`);if(/script-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline is forbidden');res.setHeader('Content-Security-Policy',next)}

export default async function handler(req,res){
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
  res.setHeader('Last-Modified',LAST_MODIFIED);
  const bridge={
    setHeader:(name,value)=>{const k=String(name).toLowerCase();if(k==='x-robots-tag')return res.setHeader(name,'noindex, nofollow, noarchive');if(k==='x-cuhalide-current-curated-revision')return res.setHeader(name,CURRENT_REVISION);if(k==='last-modified')return res.setHeader(name,LAST_MODIFIED);return res.setHeader(name,value)},
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{const out=normalize(body);if(typeof out==='string'&&out.includes('</html>')){if(!out.includes(ROBOTS_META))throw new Error('prepublication record page missing noindex meta');syncCsp(out,res)}res.removeHeader?.('Content-Length');return res.end(out)}
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return recordHandler(req,bridge);
}
