import siteHandler from './site.js';

const UI_VERSION='50.2';
const CURRENT_REVISION='6';
const CONTENT_DATE='2026-08-18';
const LAST_MODIFIED=new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();
const ICON_LINK='<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
const STYLE_LINK='<link rel="stylesheet" href="/ui-v48-2.css?v=50.2">';
const LIVING_STYLE_LINK='<link rel="stylesheet" href="/ui-living-knowledge.css?v=20260818">';
const SCRIPT_LINK='<script src="/ui-v48-2.js?v=50.2" defer></script>';
const UI_MARKER='<!-- CUHALIDE_UI_V50_2_CURRENT_R6 -->';

function enhanceHtml(input){
  if(typeof input!=='string'||!input.includes('</head>')||!input.includes('</body>'))return input;
  let body=input;
  body=body.split('<nav class="nav" id="nav" aria-label="Primary"><a data-route="home" href="#home">Overview</a><a data-route="articles" href="#articles">Explore</a><a data-route="structures" href="#structures">Structures</a><a data-route="polar" href="#polar">Polar Set</a><a data-route="rag" href="#rag">Smart RAG</a><a data-route="watch" href="#watch">Literature Watch</a><a data-route="methods" href="#methods">Methods</a><a data-route="citation" href="#citation">Citation</a></nav>').join('<nav class="nav" id="nav" aria-label="Primary"><a data-route="home" href="#home">Overview</a><a data-route="articles" href="#articles">Literature</a><a data-route="structures" href="#structures">Structures</a><a href="/motifs">Motifs</a><a data-route="polar" href="#polar">Polar</a><a data-route="rag" href="#rag">Smart RAG</a><a data-route="citation" href="#citation">About data</a></nav>');
  body=body.split('Citation & data availability').join('Data provenance & citation');
  body=body.split('Use and cite CuHalide Atlas').join('Cite the living atlas or reproduce a snapshot');
  body=body.split('Citation metadata').join('Snapshot citation metadata');
  body=body.split('Release manifest').join('Machine provenance');
  body=body.split('<div class="footer-links"><a href="#methods">Methods</a><a href="#citation">Citation</a><a href="#watch">Literature Watch</a></div>').join('<div class="footer-links"><a href="#methods">Methods</a><a href="#citation">Data provenance</a><a href="#watch">Literature Watch</a></div>');
  if(!body.includes('/ui-v48-2.css'))body=body.replace('</head>',`${ICON_LINK}\n${STYLE_LINK}\n${LIVING_STYLE_LINK}\n</head>`);
  if(!body.includes('/ui-v48-2.js'))body=body.replace('</body>',`${SCRIPT_LINK}\n${UI_MARKER}\n</body>`);
  for(const token of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R5','CUHALIDE_UI_V50_2_CURRENT_R6','Curated through 18 Aug 2026','Core-Included · n=886','All structure / phase rows · n=946'])if(!body.includes(token))throw new Error(`v50 UI contract missing: ${token}`);
  for(const stale of ['Current Curated rev.4','Core-Included · n=864','All structure / phase rows · n=924'])if(body.includes(stale))throw new Error(`stale rev.4 UI token: ${stale}`);
  return body;
}

export default async function handler(req,res){
  res.setHeader('X-CuHalide-UI-Version',UI_VERSION);
  res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
  res.setHeader('Last-Modified',LAST_MODIFIED);
  const bridge={setHeader:(name,value)=>{const lower=String(name).toLowerCase();if(lower==='x-cuhalide-current-curated-revision')return res.setHeader(name,CURRENT_REVISION);if(lower==='last-modified')return res.setHeader(name,LAST_MODIFIED);return res.setHeader(name,value)},end:body=>res.end(enhanceHtml(body))};
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return siteHandler(req,bridge);
}
