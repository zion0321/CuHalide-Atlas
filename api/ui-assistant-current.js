import assistantHandler from './ui-assistant.js';

const CURRENT_REVISION='7';
const CONTENT_DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();

function normalize(body){
  if(typeof body!=='string')return body;
  return body
    .split('CUHALIDE_UI_V50_2_CURRENT_R6').join('CUHALIDE_UI_V50_2_CURRENT_R7')
    .split('CUHALIDE_SITE_V50_CURRENT_CURATED_R6').join('CUHALIDE_SITE_V50_CURRENT_CURATED_R7')
    .split('Current Curated rev.6').join('Current Curated rev.7')
    .split('current-curated-r6').join('current-curated-r7')
    .split('current-r6').join('current-r7')
    .split('18 Aug 2026').join('19 Aug 2026')
    .split('18 August 2026').join('19 August 2026')
    .split('2026-08-18').join('2026-08-19')
    .split('cc.live_revision||6').join('cc.live_revision||7')
    .split('This revision adds four primary-evidence-reviewed articles and eight SCXRD structure determinations while preserving the immutable archived scientific snapshot 3.0.2.').join('Rev.7 completes a full structure-truth re-audit across the 946-row Current Curated snapshot while preserving the immutable archived scientific snapshot 3.0.2.');
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
  return assistantHandler(req,bridge);
}
