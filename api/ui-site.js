import crypto from 'node:crypto';
import siteHandler from '../lib/site-renderer.js';
import {applyRootPrepublicationGovernance,PUBLICATION_STATE} from '../lib/prepublication-governance.js';

const UI_VERSION='50.2';
const CURRENT_REVISION='8';
const CONTENT_DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();
const ROBOTS_META='<meta name="robots" content="noindex,nofollow,noarchive">';
const ICON_LINK='<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
const STYLE_LINK='<link rel="stylesheet" href="/ui-v48-2.css?v=50.2">';
const LIVING_STYLE_LINK='<link rel="stylesheet" href="/ui-living-knowledge.css?v=20260819">';
const SCRIPT_LINK='<script src="/ui-v48-2.js?v=50.2" defer></script>';
const UI_MARKER='<!-- CUHALIDE_UI_V50_2_CURRENT_R8 -->';
const all=(body,from,to)=>body.split(from).join(to);

function promoteRev8(body){
  for(const from of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R6','CUHALIDE_SITE_V50_CURRENT_CURATED_R7'])body=all(body,from,'CUHALIDE_SITE_V50_CURRENT_CURATED_R8');
  for(const from of ['CUHALIDE_UI_V50_2_CURRENT_R6','CUHALIDE_UI_V50_2_CURRENT_R7'])body=all(body,from,'CUHALIDE_UI_V50_2_CURRENT_R8');
  for(const from of ['Current Curated rev.6','Current Curated rev.7'])body=all(body,from,'Current Curated rev.8');
  for(const from of ['current-curated-r6','current-curated-r7'])body=all(body,from,'current-curated-r8');
  for(const from of ['current-r6','current-r7'])body=all(body,from,'current-r8');
  body=all(body,'18 Aug 2026','19 Aug 2026');
  body=all(body,'18 August 2026','19 August 2026');
  body=all(body,'2026-08-18','2026-08-19');
  body=all(body,'Resolved structure rows · n = 713','Resolved structure rows · n = 710');
  body=all(body,'<div class="polar-num"><strong>85</strong><small>strict-polar rows · 53 articles</small></div>','<div class="polar-num"><strong>87</strong><small>strict-polar rows · 54 articles</small></div>');
  body=all(body,'<strong id="pcount">85 rows</strong>','<strong id="pcount">87 rows</strong>');
  body=all(body,'cc.verified_space_group_rows||687','cc.verified_space_group_rows||684');
  body=all(body,'cc.strict_polar_rows||85','cc.strict_polar_rows||87');
  body=all(body,'cc.strict_polar_articles||53','cc.strict_polar_articles||54');
  body=all(body,'cc.live_revision||6','cc.live_revision||8');
  body=all(body,'cc.live_revision||7','cc.live_revision||8');
  body=all(body,'Smart RAG 9.18.0','Smart RAG 9.19.0');
  body=all(body,'backend rev.6 deterministic contract','backend rev.8 deterministic contract');
  body=all(body,'backend rev.7 deterministic contract','backend rev.8 deterministic contract');
  body=all(body,'This revision adds four primary-evidence-reviewed articles and eight SCXRD structure determinations while preserving the immutable archived scientific snapshot 3.0.2.','Rev.8 incorporates primary-source-reverified structure corrections while preserving the immutable archived scientific snapshot 3.0.2.');
  body=all(body,'Rev.7 completes a full structure-truth re-audit across the 946-row Current Curated snapshot while preserving the immutable archived scientific snapshot 3.0.2.','Rev.8 incorporates primary-source-reverified structure corrections while preserving the immutable archived scientific snapshot 3.0.2.');
  return body;
}

function enhanceHtml(input){
  if(typeof input!=='string'||!input.includes('</head>')||!input.includes('</body>'))return input;
  let body=promoteRev8(input);
  body=all(body,'<meta name="robots" content="index,follow,max-image-preview:large">',ROBOTS_META);
  body=body.split('<nav class="nav" id="nav" aria-label="Primary"><a data-route="home" href="#home">Overview</a><a data-route="articles" href="#articles">Explore</a><a data-route="structures" href="#structures">Structures</a><a data-route="polar" href="#polar">Polar Set</a><a data-route="rag" href="#rag">Smart RAG</a><a data-route="watch" href="#watch">Literature Watch</a><a data-route="methods" href="#methods">Methods</a><a data-route="citation" href="#citation">Citation</a></nav>').join('<nav class="nav" id="nav" aria-label="Primary"><a data-route="home" href="#home">Overview</a><a data-route="articles" href="#articles">Literature</a><a data-route="structures" href="#structures">Structures</a><a href="/motifs">Motifs</a><a data-route="polar" href="#polar">Polar</a><a data-route="rag" href="#rag">Smart RAG</a><a data-route="citation" href="#citation">About data</a></nav>');
  body=body.split('Citation & data availability').join('Data provenance & citation');
  body=body.split('Use and cite CuHalide Atlas').join('Cite the living atlas or reproduce a snapshot');
  body=body.split('Citation metadata').join('Snapshot citation metadata');
  body=body.split('Release manifest').join('Machine provenance');
  body=body.split('Evidence-grounded Smart RAG query access').join('Evidence-grounded Research Assistant query access');
  body=body.split('<summary>Smart RAG evidence boundary</summary>').join('<summary>Research Assistant evidence boundary</summary>');
  body=body.split('<div class="footer-links"><a href="#methods">Methods</a><a href="#citation">Citation</a><a href="#watch">Literature Watch</a></div>').join('<div class="footer-links"><a href="#methods">Methods</a><a href="#citation">Data provenance</a><a href="#watch">Literature Watch</a></div>');
  if(!body.includes('/ui-v48-2.css'))body=body.replace('</head>',`${ICON_LINK}\n${STYLE_LINK}\n${LIVING_STYLE_LINK}\n</head>`);
  if(!body.includes('/ui-v48-2.js'))body=body.replace('</body>',`${SCRIPT_LINK}\n${UI_MARKER}\n</body>`);
  body=applyRootPrepublicationGovernance(body);
  for(const token of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R8','CUHALIDE_UI_V50_2_CURRENT_R8','Curated through 19 Aug 2026','curated through 19 August 2026','Core-Included · n=886','All structure / phase rows · n=946','Rev.8 incorporates primary-source-reverified structure corrections',ROBOTS_META,'name="cuhalide-publication-state" content="prepublication-review"'])if(!body.includes(token))throw new Error(`v50/rev8 UI contract missing: ${token}`);
  for(const stale of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R6','CUHALIDE_UI_V50_2_CURRENT_R6','Current Curated rev.6','Current Curated rev.7','CUHALIDE_SITE_V50_CURRENT_CURATED_R7','CUHALIDE_UI_V50_2_CURRENT_R7','Curated through 18 Aug 2026','Curated through 18 August 2026','Core-Included · n=864','All structure / phase rows · n=924','cc.live_revision||6','cc.live_revision||7','This revision adds four primary-evidence-reviewed articles and eight SCXRD structure determinations','<meta name="robots" content="index,follow,max-image-preview:large">'])if(body.includes(stale))throw new Error(`stale UI token: ${stale}`);
  return body;
}

function inlineScriptHashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))!==null){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const current=String(res.getHeader?.('Content-Security-Policy')||'');if(!current)return;const hashes=inlineScriptHashes(html);if(!hashes.length)return;const next=current.replace(/\bscript-src\s+[^;]*;/i,`script-src 'self' ${hashes.join(' ')};`);if(/script-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline is forbidden');res.setHeader('Content-Security-Policy',next)}

export default async function handler(req,res){
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('X-CuHalide-UI-Version',UI_VERSION);
  res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
  res.setHeader('X-CuHalide-Publication-State',PUBLICATION_STATE);
  res.setHeader('Last-Modified',LAST_MODIFIED);
  const bridge={setHeader:(name,value)=>{const lower=String(name).toLowerCase();if(lower==='x-robots-tag')return res.setHeader(name,'noindex, nofollow, noarchive');if(lower==='x-cuhalide-current-curated-revision')return res.setHeader(name,CURRENT_REVISION);if(lower==='x-cuhalide-publication-state')return res.setHeader(name,PUBLICATION_STATE);if(lower==='last-modified')return res.setHeader(name,LAST_MODIFIED);return res.setHeader(name,value)},getHeader:name=>res.getHeader?.(name),removeHeader:name=>res.removeHeader?.(name),end:body=>{const out=enhanceHtml(body);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return siteHandler(req,bridge);
}
