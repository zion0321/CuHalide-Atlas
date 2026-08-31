import crypto from 'node:crypto';
import currentUi from './ui-assistant-current.js';

const REV='9',UI='51.0',SITE='51',PUBLICATION_STATE='prepublication-review',DATE='2026-08-19';
const LAST_MODIFIED=new Date(`${DATE}T00:00:00Z`).toUTCString();
const all=(s,a,b)=>String(s).split(a).join(b);

function simplifyPublicUi(input){
  let x=String(input);

  // Overview: prioritize research content instead of release-engineering state.
  x=all(x,'<span class="ver">Latest curated state</span>','<span class="ver">Updated collection</span>');
  x=x.replace(/<p class="release-note">Current Curated rev\.9[\s\S]*?<\/p>/,'<p class="release-note">Search the latest curated literature, structures and measurements. Detailed provenance remains available under About data.</p>');
  x=all(x,"$('releaseDl').innerHTML=[['Curated through','19 Aug 2026'],['Canonical articles',cc.canonical_verified_articles||370],['Core structures',cc.core_included_structure_rows||890],['Verified SG mappings',cc.verified_space_group_rows||720],['Strict polar',cc.strict_polar_rows||91]].map","$('releaseDl').innerHTML=[['Updated','19 Aug 2026'],['Publications',cc.canonical_verified_articles||370],['Structures',cc.core_included_structure_rows||890]].map");
  x=all(x,"$('kpis').innerHTML=[['Article audit',cc.article_audit_records||383,'reviewed DOI records'],['Canonical articles',cc.canonical_verified_articles||370,'in-scope verified'],['Structures / phases',cc.structure_phase_rows||947,'atomic/context structure rows'],['Verified mappings',cc.verified_space_group_rows||720,'one-to-one SG mappings'],['Strict polar',cc.strict_polar_rows||91,`${cc.strict_polar_articles||57} articles`]].map","$('kpis').innerHTML=[['Publications',cc.canonical_verified_articles||370,'curated articles'],['Structures',cc.core_included_structure_rows||890,'curated determinations'],['Resolved space groups',cc.resolved_space_group_rows||747,'structure records'],['Polar structures',cc.strict_polar_rows||91,`${cc.strict_polar_articles||57} articles`]].map");
  x=all(x,'.kpis{display:grid;grid-template-columns:repeat(5,1fr);','.kpis{display:grid;grid-template-columns:repeat(4,1fr);');
  x=all(x,'@media(max-width:1120px){.nav','@media(max-width:1120px){.nav');
  x=all(x,'.kpis{grid-template-columns:repeat(3,1fr)}.dashboard','.kpis{grid-template-columns:repeat(2,1fr)}.dashboard');
  x=x.replace(/<article class="panel curation-panel"><p class="eyebrow">Living knowledge base<\/p><h2>Current Curated rev\.9<\/h2><p class="fine" id="currentCuratedText">[\s\S]*?<\/article>/,'<article class="panel curation-panel"><p class="eyebrow">Coverage</p><h2>Continuously curated</h2><p class="fine" id="currentCuratedText">Curated through 19 Aug 2026.</p><p class="fine">New evidence is reviewed before it appears in the Atlas. Methods and provenance are available under About data.</p></article>');
  x=all(x,"if(cct)cct.textContent=`Primary-evidence reviewed through ${cc.current_curated_through||'2026-08-19'} · live revision ${Number(cc.live_revision||9)} · full current atomic-structure snapshot.`","if(cct)cct.textContent='Curated through 19 Aug 2026. New evidence is reviewed before it appears in the Atlas.'");

  // Public literature view is always the canonical collection. Internal audit states remain in the database only.
  x=x.replace(/<label class="field"><span>Dataset view<\/span><select id="arel">[\s\S]*?<\/select><\/label>/,'<input type="hidden" id="arel" value="Current canonical">');
  x=x.replace(/<p class="fine" id="articleDimensionNote">[\s\S]*?<\/p>/,'');
  x=x.replace(/<label class="field"><span>Article index class<\/span><select id="adim">[\s\S]*?<\/select><\/label>/,'');
  x=x.replace(/<label class="field"><span>Evidence<\/span><select id="aev">[\s\S]*?<\/select><\/label>/,'');
  x=x.replace(/<label class="field"><span>Scope<\/span><select id="ascope">[\s\S]*?<\/select><\/label>/,'');
  x=all(x,"$('acountNote').textContent=$('arel').value?`Release status = ${$('arel').value}.`:'Audit view: includes non-canonical records.'","$('acountNote').textContent='Curated literature.'");
  x=all(x,'<div class="badges"><span class="badge">${esc(a.halogen)}</span><span class="badge">Article index · ${esc(a.dimensionality_class)}</span><span class="badge">${esc(a.category)}</span><span class="badge a">${esc(a.evidence_level)}</span><span class="badge ${[\'Core - Verified\',\'Current Curated - Verified\'].includes(a.release_status)?\'\':\'audit\'}">${esc(a.release_status)}</span></div>','<div class="badges"><span class="badge">${esc(a.halogen)}</span><span class="badge">${esc(a.category)}</span></div>');
  x=all(x,"['ahal','adim','acat','aev','ascope'].forEach(id=>$(id).selectedIndex=0)","['ahal','acat'].forEach(id=>$(id).selectedIndex=0)");
  x=x.replace(/<section class="block"><h3>Classification<\/h3><dl class="kv"><dt>Halogen<\/dt><dd>\$\{esc\(x\.halogen\)\}<\/dd><dt>Article index class<\/dt><dd>\$\{esc\(x\.dimensionality_class\)\}<\/dd><dt>Category<\/dt><dd>\$\{esc\(x\.category\)\}<\/dd><dt>Scope<\/dt><dd>\$\{esc\(x\.scope_status\)\}<\/dd><dt>Evidence<\/dt><dd>\$\{esc\(x\.evidence_level\)\}<\/dd><dt>Release<\/dt><dd>\$\{esc\(x\.release_status\)\}<\/dd><\/dl><\/section>/,'<section class="block"><h3>Material</h3><dl class="kv"><dt>Halogen</dt><dd>${esc(x.halogen)}</dd><dt>Category</dt><dd>${esc(x.category)}</dd></dl></section>');
  x=all(x,'<dt>Last verified</dt><dd>${esc(x.last_verified||\'—\')}</dd>','');

  // Public structure view is always Core-Included. Confidence/eligibility fields remain internal QA metadata.
  x=x.replace(/<label class="field"><span>Dataset eligibility<\/span><select id="selig">[\s\S]*?<\/select><\/label>/,'<input type="hidden" id="selig" value="Core - Included">');
  x=x.replace(/<label class="field"><span>SG confidence<\/span><select id="sconf">[\s\S]*?<\/select><\/label>/,'');
  x=all(x,'<th>Structure</th><th>Formula / phase</th><th>Halogen</th><th>Dim.</th><th>Space group</th><th>Polar</th><th>Confidence</th><th>Source</th>','<th>Structure</th><th>Formula / phase</th><th>Halogen</th><th>Dim.</th><th>Space group</th><th>Polar</th><th>Source</th>');
  x=all(x,"$('scountNote').textContent=$('selig').value?`Eligibility = ${$('selig').value}.`:'Audit view: all 947 structure/phase rows.'","$('scountNote').textContent='Curated structure records.'");
  x=all(x,"['shal','sdim','ssg','sconf','spolar'].forEach(id=>$(id).selectedIndex=0)","['shal','sdim','ssg','spolar'].forEach(id=>$(id).selectedIndex=0)");
  x=all(x,'<td>${esc(s.halogen||\'Unresolved\')}<br><small>${esc(s.halogen_scope||\'unresolved\')} · ${esc(s.halogen_confidence||\'Unresolved\')}</small></td><td>${esc(s.dimensionality_class)}${s.known_erratum?\' †\':\'\'}</td><td>${s.space_group?`<span class="sg-token">${esc(s.space_group)}</span>`:\'Unresolved\'}</td><td>${esc(s.polar||\'Unresolved\')}</td><td>${esc(s.sg_confidence)} / ${esc(s.mapping_confidence||\'—\')}</td><td><a href="${safeUrl(s.doi_url)}" target="_blank" rel="noreferrer">Record ${esc(s.record_id)}</a></td>','<td>${esc(shown(s.halogen))}</td><td>${esc(shown(s.dimensionality_class))}${s.known_erratum?\' †\':\'\'}</td><td>${s.space_group&&!/^unresolved/i.test(String(s.space_group))?`<span class="sg-token">${esc(s.space_group)}</span>`:\'—\'}</td><td>${esc(shown(s.polar))}</td><td><a href="${safeUrl(s.doi_url)}" target="_blank" rel="noreferrer">Record ${esc(s.record_id)}</a></td>');
  x=all(x,'<tr><td colspan="8">No matching structures.</td></tr>','<tr><td colspan="7">No matching structures.</td></tr>');
  x=all(x,'<tr><td colspan="8">${esc(e.message)}</td></tr>','<tr><td colspan="7">${esc(e.message)}</td></tr>');
  x=all(x,'const compact=(v,n=240)=>{const s=String(v??\'\').replace(/\\s+/g,\' \').trim();return s.length>n?s.slice(0,n-1).trim()+\'…\':s};','const compact=(v,n=240)=>{const s=String(v??\'\').replace(/\\s+/g,\' \').trim();return s.length>n?s.slice(0,n-1).trim()+\'…\':s};\nconst shown=v=>!v||/^unresolved$/i.test(String(v).trim())?\'—\':v;const detail=v=>!v||/^unresolved$/i.test(String(v).trim())?\'Not established from available evidence\':v;');
  x=all(x,'<dt>Halogen evidence</dt><dd>${esc(x.halogen_scope||\'unresolved\')} · ${esc(x.halogen_confidence||\'Unresolved\')}</dd><dt>Halogen basis</dt><dd>${esc(x.halogen_basis||\'Not resolved\')}</dd>','');
  x=all(x,'<dt>Eligibility</dt><dd>${esc(x.eligibility||\'—\')}</dd>','');
  x=all(x,'${esc(x.motif||\'No independently mapped structure-grain motif is exposed.\')}','${esc(detail(x.motif))}');
  x=x.replace(/<section class="block"><h3>Evidence<\/h3><dl class="kv"><dt>SG confidence<\/dt><dd>\$\{esc\(x\.sg_confidence\)\}<\/dd><dt>Mapping<\/dt><dd>\$\{esc\(x\.mapping_confidence\)\}<\/dd><dt>Method<\/dt><dd>\$\{esc\(x\.determination_method\)\}<\/dd><dt>CCDC \/ CIF ID<\/dt><dd>\$\{esc\(x\.ccdc_cif\|\|\'Not recorded\'\)\}<\/dd><\/dl><\/section>/,'<section class="block"><h3>Crystallographic record</h3><dl class="kv"><dt>CCDC / CIF ID</dt><dd>${esc(x.ccdc_cif||\'Not recorded\')}</dd></dl></section>');
  x=all(x,"esc(x.emission_assignment||'No independently mapped structure-grain photophysics is exposed.')","esc(x.emission_assignment||'No measurement is linked uniquely to this structure.')");

  // Research Assistant: expose the scientific function, not routing implementation.
  x=x.replace(/<aside class="panel rag-side assistant-guide">[\s\S]*?<\/aside><section class="panel rag-work">/,'<aside class="panel rag-side assistant-guide"><p class="eyebrow">Research Assistant</p><h2>Ask about the Atlas</h2><p class="fine">Ask about materials, structures, literature or photophysical properties. Source-linked records appear when the answer uses Atlas evidence.</p><p class="eyebrow assistant-examples-title">Examples</p><div class="prompts"><button data-prompt="Explain self-trapped excitons in simple terms.">Explain STEs simply</button><button data-prompt="Compare evidence for isolated 0D Cu2I4 units and STE emission, keeping structure-grain and article-grain evidence separate.">Cu₂I₄ · STE evidence</button></div><button class="btn secondary" id="newchat" type="button" style="margin-top:12px">New chat</button></aside><section class="panel rag-work">');
  x=all(x,'Auto evidence routing · read-only · private primary files are never exposed','Source-linked scientific answers');
  for(const [a,b] of [
    ['Conversation + evidence tools ready','Ready'],
    ['Evidence tools ready · conversational LLM temporarily limited','Evidence search ready'],
    ['Deterministic evidence boundary applied','Evidence checked'],
    ['Conversational LLM · no database evidence required','Ready'],
    ['Curated evidence + Literature Watch','Evidence checked'],
    ['Evidence-grounded Atlas answer','Evidence checked'],
    ['Evidence retrieval available · LLM synthesis temporarily limited','Evidence search ready'],
    ['Conversational LLM temporarily limited · evidence tools remain available','Evidence search ready']
  ])x=all(x,a,b);

  // About data: retain attribution and method access without enumerating private/internal assets.
  x=x.replace(/<article class="panel availability"><p class="eyebrow">Data availability<\/p>[\s\S]*?<\/article>/,'<article class="panel availability"><p class="eyebrow">Data availability</p><h2>Browse and cite the Atlas</h2><p class="fine">The site provides curated literature, structure and photophysics records for search and scientific inspection. Source publications remain linked by DOI. Detailed methods and provenance are retained for reproducibility without exposing internal curation artifacts in the browsing interface.</p><div class="notice">Use the access date and current revision when referencing a living Atlas result.</div></article>');
  x=all(x,'Review access is query-and-view. Complete normalized tables and primary evidence remain private research assets.','Search curated literature, structures and measurements; source publications remain linked by DOI.');

  return x;
}

function patch(input){
  if(typeof input!=='string')return input;
  let x=input;
  for(const a of ['Current Curated rev.8','Current Curated rev.7','Current Curated rev.6'])x=all(x,a,'Current Curated rev.9');
  for(const a of ['current-curated-r8','current-curated-r7','current-curated-r6'])x=all(x,a,'current-curated-r9');
  for(const a of ['current-r8','current-r7','current-r6'])x=all(x,a,'current-r9');
  for(const a of ['CUHALIDE_UI_V50_2_CURRENT_R8','CUHALIDE_UI_V50_2_CURRENT_R7','CUHALIDE_UI_V50_2_CURRENT_R6'])x=all(x,a,'CUHALIDE_UI_V51_0_CURRENT_R9');
  for(const a of ['CUHALIDE_SITE_V50_CURRENT_CURATED_R8','CUHALIDE_SITE_V50_CURRENT_CURATED_R7','CUHALIDE_SITE_V50_CURRENT_CURATED_R6'])x=all(x,a,'CUHALIDE_SITE_V51_CURRENT_CURATED_R9');
  x=all(x,'CUHALIDE_UI_V48_5','CUHALIDE_UI_V51_0');
  x=all(x,'<meta name="cuhalide-site-version" content="50">','<meta name="cuhalide-site-version" content="51">');

  x=all(x,'/ui-v48-2.css?v=50.2','/ui-v51-core.css?v=51.0');
  x=all(x,'/ui-v48-2.js?v=50.2','/ui-v51-core.js?v=51.0');
  x=all(x,'/ui-assistant-v48-5.css?v=20260818','/ui-assistant-v51.css?v=51.0');
  x=all(x,'/ui-photophysics-v1.css?v=1.0.0','/ui-photophysics-v1.css?v=1.4.0');
  x=all(x,'/ui-photophysics-v1.js?v=1.0.0','/ui-photophysics-v1.js?v=1.4.0');
  x=all(x,'/ui-ux-v1.css?v=1.0.0','/ui-ux-v1.css?v=51.0');
  x=all(x,'/ui-ux-v1.js?v=1.0.0','/ui-ux-v1.js?v=51.0');

  x=all(x,'946 atomic/context structure records','947 atomic/context structure records');
  x=all(x,'946 structure/phase rows','947 structure/phase rows');
  x=all(x,'946 structure rows','947 structure rows');
  x=all(x,'946-row Current Curated snapshot','947-row Current Curated snapshot');
  x=all(x,'946-row taxonomy','947-row taxonomy');
  x=all(x,'All structure / phase rows · n=946','All structure / phase rows · n=947');
  x=all(x,'All structure / phase rows · n = 946','All structure / phase rows · n = 947');
  x=all(x,'Core-Included · n=886','Core-Included · n=890');
  x=all(x,'Core-Included · n=887','Core-Included · n=890');
  x=all(x,'Core-Included structure rows · n = 886','Core-Included structure rows · n = 890');
  x=all(x,'Core-Included structure rows · n = 887','Core-Included structure rows · n = 890');
  x=all(x,'Resolved structure rows · n = 710','Resolved structure rows · n = 747');
  x=all(x,'Resolved structure rows · n = 744','Resolved structure rows · n = 747');
  x=all(x,'cc.core_included_structure_rows||886','cc.core_included_structure_rows||890');
  x=all(x,'cc.core_included_structure_rows||887','cc.core_included_structure_rows||890');
  x=all(x,'cc.structure_phase_rows||946','cc.structure_phase_rows||947');
  x=all(x,'cc.canonical_verified_articles||369','cc.canonical_verified_articles||370');
  x=all(x,'cc.verified_space_group_rows||684','cc.verified_space_group_rows||720');
  x=all(x,'cc.verified_space_group_rows||717','cc.verified_space_group_rows||720');
  x=all(x,'cc.resolved_space_group_rows||744','cc.resolved_space_group_rows||747');
  x=all(x,"'Audit view: all 946 structure/phase rows.'","'Audit view: all 947 structure/phase rows.'");
  x=all(x,'<div class="polar-num"><strong>87</strong><small>strict-polar rows · 54 articles</small></div>','<div class="polar-num"><strong>91</strong><small>strict-polar rows · 57 articles</small></div>');
  x=all(x,'<strong id="pcount">87 rows</strong>','<strong id="pcount">91 rows</strong>');
  x=all(x,'cc.strict_polar_rows||87','cc.strict_polar_rows||91');
  x=all(x,'cc.strict_polar_articles||54','cc.strict_polar_articles||57');
  for(const n of ['6','7','8'])x=all(x,`cc.live_revision||${n}`,'cc.live_revision||9');
  x=all(x,'1,329-document Current Curated rev.9','1,330-document Current Curated rev.9');
  x=all(x,'1,329 BGE-M3','1,330 BGE-M3');
  x=all(x,'1329-document','1330-document');
  x=all(x,'1329 documents','1330 documents');
  x=all(x,'Smart RAG 9.19.0','Smart RAG 9.20.0');
  x=all(x,'Research Assistant 10.4.1','Research Assistant 10.5.0');
  x=all(x,'Public Data 2.16.0','Public Data 2.17.1');
  for(const v of ['1.3.0','1.3.1','1.3.2','1.3.3']){x=all(x,`Structured Photophysics ${v}`,'Structured Photophysics 1.4.0');x=all(x,`Photophysics ${v}`,'Photophysics 1.4.0')}
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

  x=simplifyPublicUi(x);

  if(!x.includes('CUHALIDE_UI_V51_0_CURRENT_R9')||!x.includes('Current Curated rev.9'))throw new Error('rev.9 UI adapter contract missing');
  for(const stale of ['Core-Included structure rows · n = 886','Core-Included structure rows · n = 887','cc.core_included_structure_rows||886','cc.core_included_structure_rows||887','cc.canonical_verified_articles||369','cc.resolved_space_group_rows||744','cc.verified_space_group_rows||717','cc.structure_phase_rows||946','Audit view: all 946 structure/phase rows.','1,329-document Current Curated rev.9','<meta name="cuhalide-site-version" content="50">','/ui-v48-2.','ui-assistant-v48-5','v=50.2','CUHALIDE_UI_V48_5','/ui-photophysics-v1.js?v=1.0.0','/ui-ux-v1.js?v=1.0.0'])if(x.includes(stale))throw new Error(`stale rev.9 display/browser token: ${stale}`);
  for(const required of ['<input type="hidden" id="arel" value="Current canonical">','<input type="hidden" id="selig" value="Core - Included">','/ui-v51-core.css?v=51.0','/ui-v51-core.js?v=51.0','/ui-assistant-v51.css?v=51.0','/ui-photophysics-v1.js?v=1.4.0','/ui-ux-v1.js?v=51.0'])if(!x.includes(required))throw new Error(`UI 51 public contract guard missing: ${required}`);
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
