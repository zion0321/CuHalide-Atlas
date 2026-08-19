import recordHandler from './record.js';

const CURRENT_REVISION='7';
const CONTENT_DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();

function normalize(body){
  if(typeof body!=='string')return body;
  return body
    .split('<meta name="cuhalide-current-curated-revision" content="6">').join('<meta name="cuhalide-current-curated-revision" content="7">')
    .split('Current Curated rev.6 · primary-evidence reviewed through 18 Aug 2026').join('Current Curated rev.7 · primary-evidence reviewed through 19 Aug 2026')
    .split('current-r6').join('current-r7')
    .split('2026-08-18').join('2026-08-19');
}

export default async function handler(req,res){
  res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
  res.setHeader('Last-Modified',LAST_MODIFIED);
  const bridge={
    setHeader:(name,value)=>{const k=String(name).toLowerCase();if(k==='x-cuhalide-current-curated-revision')return res.setHeader(name,CURRENT_REVISION);if(k==='last-modified')return res.setHeader(name,LAST_MODIFIED);return res.setHeader(name,value)},
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{const out=normalize(body);res.removeHeader?.('Content-Length');return res.end(out)}
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return recordHandler(req,bridge);
}
