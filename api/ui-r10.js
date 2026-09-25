import crypto from 'node:crypto';
import rev9Ui from './ui-r9.js';
import { integrateKnowledge } from '../lib/integrated-ui.mjs';
const REV='10',UI='52.0',SITE='52',STATE='prepublication-review',CONTENT_DATE='2026-09-25';
const all=(s,a,b)=>String(s).split(a).join(b);
function patch(body){
 if(typeof body!=='string')return body;let x=body;
 x=x.replace(/Current Curated rev\.9/gi,'Current Curated rev.10').replace(/current-curated-r9/gi,'current-curated-r10').replace(/current-r9/gi,'current-r10').replace(/\brev\.9\b/gi,'rev.10');
 x=all(x,'19 Aug 2026','14 Sep 2026');x=all(x,'2026-08-19','2026-09-14');x=all(x,'CUHALIDE_UI_V51_0_CURRENT_R9','CUHALIDE_UI_V52_0_CURRENT_R10');x=all(x,'CUHALIDE_SITE_V51_CURRENT_CURATED_R9','CUHALIDE_SITE_V52_CURRENT_CURATED_R10');x=all(x,'<meta name="cuhalide-site-version" content="51">','<meta name="cuhalide-site-version" content="52">');
 x=all(x,'cc.canonical_verified_articles||370','cc.canonical_verified_articles||372');x=all(x,'cc.core_included_structure_rows||890','cc.core_included_structure_rows||901');x=all(x,'cc.verified_space_group_rows||720','cc.verified_space_group_rows||734');x=all(x,'cc.strict_polar_rows||91','cc.strict_polar_rows||94');x=all(x,'cc.strict_polar_articles||57','cc.strict_polar_articles||60');x=all(x,'cc.structure_phase_rows||947','cc.structure_phase_rows||939');x=all(x,'cc.resolved_space_group_rows||747','cc.resolved_space_group_rows||761');x=all(x,'all 947 structure/phase rows','all 939 structure/phase rows');x=all(x,'947 structure/phase rows','939 structure/phase rows');x=all(x,'1,330-document Current Curated rev.10','1,322-document Current Curated rev.10');x=all(x,'1,330 / 1,330','1,322 / 1,322');x=all(x,'Smart RAG 9.20.0','Smart RAG 10.0.0');x=all(x,'Research Assistant 10.5.0','Research Assistant 10.6.0');x=all(x,'Public Data 2.17.1','Public Data 2.18.0');
 x=integrateKnowledge(x);
 x=all(x,'/ui-photophysics-v1.css?v=1.4.0','/ui-photophysics-v1.css?v=1.4.0-ui52.2');
 x=all(x,'/ui-photophysics-v1.js?v=1.4.0','/ui-photophysics-v1.js?v=1.4.0-ui52.2');
 x=all(x,'Latest strict-polar subset. Polar symmetry does not by itself establish ferroelectric switching.','Strict-polar subset · highest evidence level only.');
 x=all(x,'<a href="#citation">Data provenance</a>','<a href="#citation">About data</a>');
 x=all(x,'Search curated literature, crystallographic structures, local Cu–X motifs and sample-resolved photophysics, or use CuXplore to search and connect source-linked evidence.','Search the literature corpus, crystallographic structures, local Cu–X motifs and sample-resolved photophysics, or use CuXplore to connect source-linked evidence.');
 x=all(x,'Searches the curated literature and Core-Included structure register.','Searches the 410-article literature corpus and Core-Included structure register.');
 x=all(x,'<span>Primary-evidence reviewed</span>','<span>Source coverage tracked</span>');
 x=all(x,'Search the latest curated literature, structures and measurements. Detailed provenance remains available under About data.','Search the current literature corpus, structures and measurements. Detailed provenance remains available under About data.');
 x=all(x,'<p class="eyebrow">Curated literature</p><h1>Explore articles</h1><p>Search the latest primary-evidence-reviewed literature. Archived snapshots are retained for reproducibility rather than exposed as a routine browsing mode.</p>','<p class="eyebrow">Literature corpus</p><h1>Explore articles</h1><p>Search the 410-article DOI-deduplicated corpus. Full-text, structured-data and source-review coverage are shown as article-level attributes rather than separate article totals.</p>');
 x=all(x,'Search curated literature, structures and measurements; source publications remain linked by DOI.','Search the literature corpus, structures and measurements; source publications remain linked by DOI.');
 if(!x.includes('/ui-quality-v52.css'))x=x.replace('</head>','<link rel="stylesheet" href="/ui-quality-v52.css?v=52.1"></head>');
 if(!x.includes('/ui-quality-v52.js'))x=x.replace('</body>','<script src="/ui-quality-v52.js?v=52.1" defer></script></body>');
 x=all(x,"['Publications',cc.canonical_verified_articles||372]","['Articles',S.boot.literature?.articles||410]");
 x=all(x,"['Publications',cc.canonical_verified_articles||372,'curated articles']","['Articles',S.boot.literature?.articles||410,'DOI-deduplicated literature corpus']");
 x=all(x,"['Canonical articles',r.canonical_verified_articles]","['Articles',410]");
 x=all(x,"[['Article audit',r.article_audit_records,'all audited DOI records'],['Canonical articles',r.canonical_verified_articles,'scientific core']","[['Articles',410,'DOI-deduplicated literature corpus'],['Full-text coverage',403,'articles represented in full-text v2']");
 x=all(x,'<p class="eyebrow">Curated literature</p><h1>Explore articles</h1><p>The default view is the canonical scientific core. Switch to an audit view only when you explicitly need boundary, excluded or primary-evidence-pending records.</p>','<p class="eyebrow">Literature corpus</p><h1>Explore articles</h1><p>Browse one DOI-deduplicated literature corpus. Structured-data and source availability are shown per article rather than defining separate article classes.</p>');
 x=all(x,'<label class="field"><span>Dataset view</span><select id="arel"><option value="Core - Verified" selected>Canonical core</option><option value="">All audit records</option><option value="Context - Boundary">Boundary context</option><option value="Excluded - Curated Audit">Excluded audit</option><option value="Pending - Primary Evidence Unavailable">Primary evidence pending</option></select></label>','<input id="arel" type="hidden" value="Core - Verified">');
 x=all(x,'Reset to canonical core','Reset filters');
 x=all(x,'Canonical release status = Core - Verified.','Articles with linked structured scientific records.');
 x=all(x,'Canonical publications by year','Structured-data publications by year');
 x=all(x,'Canonical literature by year','Structured-data literature by year');
 x=x.replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/g,'"dateModified":"'+CONTENT_DATE+'"');
 x=all(x,'<!-- CUHALIDE_UI_V51_0_CONVERSATIONAL_RESEARCH_ASSISTANT -->','<!-- CUHALIDE_UI_V52_0_CUXPLORE -->');
 x=all(x,'/ui-living-knowledge.css?v=20260819','/ui-living-knowledge.css?v=20260925');
 x=all(x,'Archived scientific snapshot 3.0.2 remains the immutable historical baseline, verified through 2026-06-30.','Archived scientific snapshot 3.0.2 remains the immutable historical baseline. Scientific cutoff: 30 June 2026; archived release issued: 11 August 2026.');
 x=all(x,'Known release erratum:','Archived-release erratum:');
 x=all(x,'CuHalide Research Assistant','CuXplore');
 x=all(x,'CuXplore Research Assistant','CuXplore');
 x=all(x,'Research Assistant','CuXplore');
 x=all(x,'Smart RAG','CuXplore');
 x=all(x,'Conversational LLM + evidence-grounded retrieval','Literature-grounded research');
 x=all(x,'Conversational LLM','general scientific reasoning');
 x=all(x,'Checking assistant…','Checking CuXplore…');
 x=all(x,'18 Aug 2026','14 Sep 2026');x=all(x,'2026-08-18','2026-09-14');
 if(/(?:Smart RAG|Research Assistant|Conversational LLM)/i.test(x.replace(/<script[\s\S]*?<\/script>/gi,'')))throw new Error('legacy research-interface branding remains visible');
 return x;
}
function scriptHashes(html){const out=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;while((m=re.exec(String(html)))){if(/\bsrc\s*=/i.test(m[1]))continue;out.push(`'sha256-${crypto.createHash('sha256').update(m[2]).digest('base64')}'`)}return[...new Set(out)]}
function syncCsp(html,res){const c=String(res.getHeader?.('Content-Security-Policy')||'');if(!c)return;let next=c;const hs=scriptHashes(html);if(hs.length&&/script-src\s+[^;]*;/i.test(next))next=next.replace(/script-src\s+[^;]*;/i,`script-src 'self' ${hs.join(' ')};`);const styles=[...String(html).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>`'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);if(styles.length&&/style-src\s+[^;]*;/i.test(next))next=next.replace(/style-src\s+[^;]*;/i,`style-src 'self' ${[...new Set(styles)].join(' ')};`);if(/(?:^|;\s*)(?:script-src|style-src)\s+[^;]*'unsafe-inline'/i.test(next))throw new Error('unsafe-inline forbidden');res.setHeader('Content-Security-Policy',next)}
export default async function handler(req,res){
 res.setHeader('X-CuHalide-Current-Curated-Revision',REV);res.setHeader('X-CuHalide-Site-Version',SITE);res.setHeader('X-CuHalide-UI-Version',UI);res.setHeader('X-CuHalide-Publication-State',STATE);res.setHeader('X-CuHalide-Knowledge-Contract','1.3.0');
 const bridge={setHeader:(k,v)=>{const n=String(k).toLowerCase();if(n==='x-cuhalide-current-curated-revision')v=REV;if(n==='x-cuhalide-site-version')v=SITE;if(n==='x-cuhalide-ui-version')v=UI;if(n==='x-cuhalide-publication-state')v=STATE;return res.setHeader(k,v)},getHeader:k=>res.getHeader?.(k),removeHeader:k=>res.removeHeader?.(k),end:body=>{const out=patch(body);if(typeof out==='string'&&out.includes('</html>'))syncCsp(out,res);res.removeHeader?.('Content-Length');return res.end(out)}};
 Object.defineProperty(bridge,'statusCode',{get:()=>res.statusCode,set:v=>{res.statusCode=v}});return rev9Ui(req,bridge);
}
