import crypto from 'node:crypto';
import assistantHandler from './ui-assistant.js';
import {applyRootPrepublicationGovernance,PUBLICATION_STATE} from '../lib/prepublication-governance.js';

const CURRENT_REVISION='7';
const CONTENT_DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();
const SAMPLE_GRAIN_MARKER='CUHALIDE_PHOTOPHYSICS_SAMPLE_GRAIN_UI_V1';
const VISIBLE_PHOTOPHYSICS_MARKER='CUHALIDE_VISIBLE_PHOTOPHYSICS_UI_V1';
const PHOTOPHYSICS_ROUTE_MARKER='CUHALIDE_PHOTOPHYSICS_NATIVE_ROUTE_V1';
const PORTAL_UX_MARKER='CUHALIDE_PORTAL_UX_V1';
const PORTAL_UX_SHELL_MARKER='CUHALIDE_PORTAL_UX_SHELL_V1';

function hardenSourceCards(body){
  if(!body.includes('function renderSources(rows)'))return body;
  const pattern=/function renderSources\(rows\)\{[\s\S]*?\}\nasync function loadWatch/;
  const matches=body.match(new RegExp(pattern.source,'g'))||[];
  if(matches.length!==1)throw new Error(`photophysics sample-grain renderer: expected one source renderer, found ${matches.length}`);
  const hardened=`function sourceKind(s,fallback){const isPhoto=String(s.evidence_scope||'').toLowerCase().includes('photophysics'),form=String(s.sample_form||'').toLowerCase();if(!isPhoto)return fallback;if(form==='crystal'||form==='single_crystal')return 'Crystal photophysics sample';if(form==='powder')return 'Powder photophysics sample';if(form==='pellet')return 'Pellet photophysics sample';if(form==='composite'||form==='film')return 'Composite photophysics sample';if(form==='device')return 'Device photophysics sample';return 'Photophysics sample'}
function sourceScopeLine(s,fallback){const isPhoto=String(s.evidence_scope||'').toLowerCase().includes('photophysics');if(!isPhoto)return scopeLine(s,fallback);const parts=[s.evidence_scope||fallback];if(s.sample_form)parts.push('form='+String(s.sample_form).replaceAll('_',' '));if(s.mapping_status)parts.push('mapping='+s.mapping_status);if(s.property_scope)parts.push('scope='+s.property_scope);if(s.photophysics_analysis_eligible===true)parts.push('quantitative-correlation eligible');else if(s.photophysics_analysis_eligible===false)parts.push('not quantitative-correlation eligible');return '<small class="scope">'+esc(parts.join(' · '))+'</small>'}
function renderSources(rows){$('sources').innerHTML=rows.length?rows.map(s=>s.type==='structure'?'<div class="source"><button data-structure="'+esc(s.id)+'">[S:'+esc(s.id)+'] '+esc(compact(s.title||'Structure',78))+'</button><small>'+esc(sourceKind(s,'Structure'))+' · Record '+esc(s.record_id||'—')+'</small>'+sourceScopeLine(s,'structure identity/crystallography only')+'</div>':s.type==='article'?'<div class="source"><button data-article="'+esc(s.id)+'">[A:'+esc(s.id)+'] '+esc(compact(s.title||'Article',78))+'</button><small>'+esc(sourceKind(s,'Article'))+(s.doi?' · '+esc(s.doi):'')+'</small>'+sourceScopeLine(s,'article-grain curated evidence')+'</div>':s.type==='web'?'<div class="source"><a href="'+safeUrl(s.url)+'" target="_blank" rel="noreferrer">'+esc(compact(s.title||s.doi||'Candidate',78))+'</a><small>Literature Watch candidate · not yet curated evidence</small></div>':'').join(''):'<div class="no-evidence"><strong>Conversational reply</strong><p>No database evidence was needed for this answer.</p></div>'}
/* ${SAMPLE_GRAIN_MARKER} */
async function loadWatch`;
  const out=body.replace(pattern,hardened);
  if(!out.includes(SAMPLE_GRAIN_MARKER))throw new Error('photophysics sample-grain renderer marker missing');
  return out;
}

function extendPhotophysicsRoute(body){
  if(body.includes(PHOTOPHYSICS_ROUTE_MARKER))return body;
  const from="const name=['home','articles','structures','polar','rag','watch','methods','citation'].includes(base)?base:'home';";
  const to="const name=['home','articles','structures','photophysics','polar','rag','watch','methods','citation'].includes(base)?base:'home';/* "+PHOTOPHYSICS_ROUTE_MARKER+" */";
  const count=body.split(from).length-1;
  if(count!==1)throw new Error(`visible photophysics route: expected one core route allowlist, found ${count}`);
  const out=body.replace(from,to);
  if(!out.includes(PHOTOPHYSICS_ROUTE_MARKER))throw new Error('visible photophysics route marker missing');
  return out;
}

function injectVisiblePhotophysicsAssets(body){
  if(body.includes(VISIBLE_PHOTOPHYSICS_MARKER))return body;
  if(!body.includes('</head>')||!body.includes('</body>'))throw new Error('visible photophysics UI: document shell markers missing');
  let out=body.replace('</head>',`<link rel="stylesheet" href="/ui-photophysics-v1.css?v=1.0.0">\n<!-- ${VISIBLE_PHOTOPHYSICS_MARKER} -->\n</head>`);
  out=out.replace('</body>','<script src="/ui-photophysics-v1.js?v=1.0.0" defer></script>\n</body>');
  if(!out.includes(VISIBLE_PHOTOPHYSICS_MARKER)||!out.includes('ui-photophysics-v1.js'))throw new Error('visible photophysics UI injection failed');
  return out;
}

function injectPortalUxShell(body){
  if(body.includes(PORTAL_UX_SHELL_MARKER))return body;
  let out=body;
  const oldHero='<h1>Evidence-grounded Cu(I) halide literature and structures.</h1><p class="hero-copy">Search primary-evidence-reviewed literature, 946 atomic/context structure records and structure-resolved relationships. Current Curated rev.7 explicitly separates reported composition, local Cu–X motif and global connectivity dimensionality; unresolved values remain unresolved rather than inferred.</p>';
  const newHero='<h1>Evidence-grounded Cu(I) halide knowledge, from structure to photophysics.</h1><p class="hero-copy">Search curated literature, crystallographic structures, local Cu–X motifs and sample-resolved photophysics, or ask the Research Assistant for evidence-linked scientific synthesis.</p>';
  if(out.includes(oldHero))out=out.replace(oldHero,newHero);
  else if(!out.includes('from structure to photophysics.'))throw new Error('portal UX shell: hero copy anchor missing');

  out=out.split('<a data-route="rag" href="#rag">Smart RAG</a>').join('<a data-route="rag" href="#rag">Research Assistant</a>');
  if(!out.includes('data-route="photophysics"')){
    const polar='<a data-route="polar" href="#polar">Polar</a>';
    const count=out.split(polar).length-1;
    if(count!==1)throw new Error(`portal UX shell: expected one Polar navigation anchor, found ${count}`);
    out=out.replace(polar,'<a data-route="photophysics" href="#photophysics">Photophysics</a>'+polar);
  }
  if(!out.includes('<a data-route="rag" href="#rag">Research Assistant</a>')||!out.includes('<a data-route="photophysics" href="#photophysics">Photophysics</a>'))throw new Error('portal UX shell: primary navigation normalization failed');

  if(!out.includes('id="uxHeroSearch"')){
    const tag='<div class="tags">';
    const count=out.split(tag).length-1;
    if(count<1)throw new Error('portal UX shell: hero tags anchor missing');
    out=out.replace(tag,'<form class="ux-hero-search" id="uxHeroSearch"><label class="sr-only" for="uxHeroSearchInput">Search CuHalide Atlas</label><input id="uxHeroSearchInput" type="search" autocomplete="off" placeholder="Search title, DOI, formula, space group…"><button type="submit">Search</button></form><small class="ux-hero-search-hint">Searches the curated literature and Core-Included structure register.</small>'+tag);
  }

  if(!out.includes('<section class="shell ux-start">')){
    const dashboard='<div class="shell dashboard section">';
    const count=out.split(dashboard).length-1;
    if(count!==1)throw new Error(`portal UX shell: expected one home dashboard anchor, found ${count}`);
    const paths='<section class="shell ux-start"><div class="ux-start-head"><div><p class="eyebrow">Research paths</p><h2>Start with the evidence layer you need.</h2></div><p>Each route preserves its own scientific grain. Article evidence, structure identity and sample-resolved photophysics are not silently merged.</p></div><div class="ux-start-grid"><a class="ux-start-card" href="#articles"><span>01 · Literature</span><strong>Find the source article</strong><small>Search DOI, title, compound families and curated article-level evidence.</small><i aria-hidden="true">→</i></a><a class="ux-start-card" href="#structures"><span>02 · Structures</span><strong>Resolve crystallography</strong><small>Inspect formula, phase, dimensionality, space group, confidence and source mapping.</small><i aria-hidden="true">→</i></a><a class="ux-start-card" href="#photophysics"><span>03 · Photophysics</span><strong>Inspect measurements</strong><small>Keep crystal, powder, composite, film and device measurements at the correct sample grain.</small><i aria-hidden="true">→</i></a><a class="ux-start-card" href="#rag"><span>04 · Research Assistant</span><strong>Ask across evidence</strong><small>Use conversational LLM synthesis with automatic retrieval when Atlas evidence is required.</small><i aria-hidden="true">→</i></a></div></section>';
    out=out.replace(dashboard,paths+dashboard);
  }
  out=out.replace('</main>',`<!-- ${PORTAL_UX_SHELL_MARKER} -->\n</main>`);
  if(!out.includes(PORTAL_UX_SHELL_MARKER)||!out.includes('id="uxHeroSearch"')||!out.includes('<section class="shell ux-start">'))throw new Error('portal UX shell injection failed');
  return out;
}

function injectPortalUxAssets(body){
  if(body.includes(PORTAL_UX_MARKER))return body;
  if(!body.includes('</head>')||!body.includes('</body>'))throw new Error('portal UX: document shell markers missing');
  let out=body.replace('</head>',`<link rel="stylesheet" href="/ui-ux-v1.css?v=1.0.0">\n<!-- ${PORTAL_UX_MARKER} -->\n</head>`);
  out=out.replace('</body>','<script src="/ui-ux-v1.js?v=1.0.0" defer></script>\n</body>');
  if(!out.includes(PORTAL_UX_MARKER)||!out.includes('ui-ux-v1.js'))throw new Error('portal UX asset injection failed');
  return out;
}

function normalize(body){
  if(typeof body!=='string')return body;
  let out=body
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
  out=hardenSourceCards(out);
  out=extendPhotophysicsRoute(out);
  out=injectVisiblePhotophysicsAssets(out);
  out=injectPortalUxShell(out);
  out=injectPortalUxAssets(out);
  out=applyRootPrepublicationGovernance(out);
  return out;
}

function inlineScriptHashes(html){
  const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;
  while((m=re.exec(String(html)))!==null){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}
  return [...new Set(out)];
}
function syncCsp(html,res){
  const current=String(res.getHeader?.('Content-Security-Policy')||'');
  if(!current)throw new Error('Missing Content-Security-Policy after assistant rendering');
  const hashes=inlineScriptHashes(html);
  if(!hashes.length)throw new Error('No inline scripts found after sample-grain UI rewrite');
  const next=current.replace(/\bscript-src\s+[^;]*;/i,`script-src 'self' ${hashes.join(' ')};`);
  if(next===current)throw new Error('Content-Security-Policy script-src could not be resynchronized');
  if(/script-src[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline is forbidden');
  res.setHeader('Content-Security-Policy',next);
}

export default async function handler(req,res){
  res.setHeader('X-CuHalide-Current-Curated-Revision',CURRENT_REVISION);
  res.setHeader('X-CuHalide-Publication-State',PUBLICATION_STATE);
  res.setHeader('Last-Modified',LAST_MODIFIED);
  const bridge={
    setHeader:(name,value)=>{const k=String(name).toLowerCase();if(k==='x-cuhalide-current-curated-revision')return res.setHeader(name,CURRENT_REVISION);if(k==='x-cuhalide-publication-state')return res.setHeader(name,PUBLICATION_STATE);if(k==='last-modified')return res.setHeader(name,LAST_MODIFIED);return res.setHeader(name,value)},
    getHeader:name=>res.getHeader?.(name),
    removeHeader:name=>res.removeHeader?.(name),
    end:body=>{const out=normalize(body);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}
  };
  Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:value=>{res.statusCode=value}});
  return assistantHandler(req,bridge);
}
