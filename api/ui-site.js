import crypto from 'node:crypto';
import siteHandler from './site.js';

const UI_VERSION = '48.4';
const CURRENT_REVISION = '3';
const CONTENT_DATE = '2026-08-14';
const LAST_MODIFIED = new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();
const ICON_LINK = '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
const STYLE_LINK = '<link rel="stylesheet" href="/ui-v48-2.css?v=48.2">';
const LIVING_STYLE_LINK = '<link rel="stylesheet" href="/ui-living-knowledge.css?v=20260814">';
const SCRIPT_LINK = '<script src="/ui-v48-2.js?v=48.2" defer></script>';
const UI_MARKER = '<!-- CUHALIDE_UI_V48_4_LIVING_KNOWLEDGE -->';
const SCIENCE_MARKER = '<!-- CUHALIDE_SITE_V48_MOTIF_ATLAS -->';

function required(body, from, to, label) {
  const count = body.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
  return body.replace(from, to);
}

function all(body, from, to) {
  return body.split(from).join(to);
}

function regexRequired(body, pattern, to, label) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = body.match(new RegExp(pattern.source, flags)) || [];
  if (matches.length !== 1) throw new Error(`${label}: expected one match, found ${matches.length}`);
  return body.replace(pattern, to);
}

function enhanceHtml(input) {
  if (typeof input !== 'string' || !input.includes('</head>') || !input.includes('</body>')) return input;
  if (input.includes('ui-v48-2.css') || input.includes('ui-v48-2.js') || input.includes('ui-living-knowledge.css')) throw new Error('UI assets already injected');
  let body = input;

  const rev3 = [
    ['"dateModified":"2026-08-12"', `"dateModified":"${CONTENT_DATE}"`],
    ['Current canonical articles · n = 348 · Frozen Release = 332', 'Latest curated corpus · n = 359 canonical articles'],
    ['Current Core-Included structure rows · n = 859 · Frozen Release = 816', 'Latest curated corpus · n = 887 Core-Included determinations'],
    ['Current resolved structure rows · n = 693 · Frozen Release = 650', 'Latest curated corpus · n = 719 resolved structure rows'],
    ['Current canonical · n=348', 'Curated literature · n=359'],
    ['Current Curated additions · n=16', 'Current Curated additions · n=27'],
    ['All current audit records · n=362', 'All reviewed / audit records · n=373'],
    ['Current Core-Included · n=859', 'Core-Included · n=887'],
    ['All current rows · n=921', 'All structure / phase rows · n=949'],
    ['Current Curated rev.1 additions', 'Current Curated rev.3 additions'],
    ['using a unified 1,283-document BGE-M3/RRF retrieval layer', 'using a unified 1,322-document BGE-M3/RRF retrieval layer'],
    ['Smart RAG 9.13.0 searches', 'Smart RAG searches'],
    ['together with Current Curated rev.1', 'together with the latest reviewed additions'],
    ['currently rev.1, curated through 2026-08-12', 'curated through 2026-08-14'],
    ['Current Curated rev.1 through 2026-08-12', 'curated through 2026-08-14'],
    ['all 921 current structure/phase rows', 'all 949 structure/phase rows'],
    ["cc.current_curated_through||'2026-08-12'", "cc.current_curated_through||'2026-08-14'"],
    ['cc.live_revision??1', 'cc.live_revision??3'],
    ['cc.canonical_verified_articles||348', 'cc.canonical_verified_articles||359'],
    ['cc.core_included_structure_rows||859', 'cc.core_included_structure_rows||887'],
    ['cc.article_audit_records||362', 'cc.article_audit_records||373'],
    ['cc.structure_phase_rows||921', 'cc.structure_phase_rows||949'],
    ['cc.verified_space_group_rows||668', 'cc.verified_space_group_rows||694'],
    ['Number(cc.live_revision||1)', 'Number(cc.live_revision||3)'],
  ];
  for (const [from, to] of rev3) body = all(body, from, to);

  body = required(body,
    '<span><strong>CuHalide Atlas</strong><small>Evidence-grounded Cu(I) halide knowledge portal</small></span>',
    '<span><strong>CuHalide Atlas</strong><small>Cu(I) halide knowledge base</small></span>', 'brand subtitle');
  body = required(body,
    '<nav class="nav" id="nav" aria-label="Primary"><a data-route="home" href="#home">Overview</a><a data-route="articles" href="#articles">Explore</a><a data-route="structures" href="#structures">Structures</a><a data-route="polar" href="#polar">Polar Set</a><a data-route="rag" href="#rag">Smart RAG</a><a data-route="watch" href="#watch">Literature Watch</a><a data-route="methods" href="#methods">Methods</a><a data-route="citation" href="#citation">Citation</a></nav>',
    '<nav class="nav" id="nav" aria-label="Primary"><a data-route="home" href="#home">Overview</a><a data-route="articles" href="#articles">Literature</a><a data-route="structures" href="#structures">Structures</a><a href="/motifs">Motifs</a><a data-route="polar" href="#polar">Polar</a><a data-route="rag" href="#rag">Smart RAG</a><a data-route="citation" href="#citation">About data</a></nav>', 'primary navigation');
  body = required(body,
    '<p class="eyebrow">CuHalide Atlas · public scientific interface</p><h1>Structure-resolved knowledge for Cu(I) halide materials.</h1><p class="hero-copy">Explore curated literature, compounds, crystallographic assignments and evidence-aware scientific relationships. Public access is deliberately separated from the private primary-evidence and curation archive.</p>',
    '<p class="eyebrow">Continuously curated scientific knowledge</p><h1>Evidence-grounded Cu(I) halide literature and structures.</h1><p class="hero-copy">Search the latest primary-evidence-reviewed literature, crystallographic determinations and structure-resolved relationships. The public corpus is continuously curated as new evidence is verified.</p>', 'hero copy');
  body = required(body,
    '<div class="actions"><a class="btn primary" href="#structures">Explore structures</a><a class="btn secondary" href="#rag">Ask Smart RAG</a></div>',
    '<div class="actions"><a class="btn primary" href="#articles">Explore literature</a><a class="btn secondary" href="#structures">Browse structures</a><a class="btn secondary" href="#rag">Ask Smart RAG</a></div>', 'hero actions');
  body = required(body,
    '<div class="tags"><span>Query-and-view access</span><span>Missing values are not inferred</span><span>Primary PDF / SI / CIF archive remains private</span></div>',
    '<div class="tags"><span>Curated through 14 Aug 2026</span><span>Primary-evidence reviewed</span><span>Missing values remain unresolved</span></div>', 'hero status tags');

  body = required(body, '<span class="ver">Frozen Release 3.0.2</span>', '<span class="ver">Latest curated state</span>', 'status badge');
  body = regexRequired(body, /<p class="release-note"><strong>Frozen Release 3\.0\.2<\/strong>[\s\S]*?<\/p>/,
    '<p class="release-note">Continuously updated after primary-evidence review. <a href="#citation">Archived scientific snapshot 3.0.2</a> is retained for reproducibility and historical denominator checks.</p>', 'status provenance note');
  body = required(body,
    '<article class="panel"><p class="eyebrow">Rolling curation</p><h2>Current Curated rev.1</h2><p class="fine" id="currentCuratedText">Loading Current Curated status…</p><p class="fine">Primary article/SI/CIF and crystallographic QC are required before promotion. Frozen Release 3.0.2 remains immutable and independently citable.</p></article>',
    '<article class="panel curation-panel"><p class="eyebrow">Living knowledge base</p><h2>Continuously curated</h2><p class="fine" id="currentCuratedText">Loading curation status…</p><p class="fine">New literature enters the public corpus only after DOI deduplication, primary-evidence review and QC. <a href="#watch">Literature Watch</a> shows newly discovered candidates before promotion.</p></article>', 'living curation panel');

  body = regexRequired(body, /<select id="arel">[\s\S]*?<\/select>/,
    '<select id="arel"><option value="Current canonical" selected>Curated literature · n=359</option><option value="">All reviewed / audit records · n=373</option><option value="Context - Boundary">Boundary context</option><option value="Excluded - Curated Audit">Excluded audit</option><option value="Pending - Primary Evidence Unavailable">Primary evidence pending</option></select>', 'article dataset selector');
  body = all(body, 'Reset to Current canonical', 'Reset to curated literature');
  body = all(body, 'Default data layer = Current canonical; Frozen Release core remains selectable.', 'Latest reviewed corpus.');
  body = all(body,
    'The default view is Current Curated canonical evidence (the latest primary-evidence-reviewed CuHalide Atlas corpus). Frozen core and audit views remain explicitly selectable.',
    'Search the latest primary-evidence-reviewed literature. Archived snapshots are kept under Data provenance for reproducibility rather than exposed as a routine browsing mode.');

  body = all(body,
    'The default view contains Current Curated Core-Included structure/phase rows. Frozen Release rows remain the immutable base; structure search is restricted to identity and crystallographic fields, with article-level photophysics and unmapped motif text excluded.',
    'The default view contains the latest Core-Included structure/phase determinations. Search is restricted to structure-grain identity and crystallographic fields; article-level photophysics and unmapped motif text remain outside structure search.');
  body = all(body, 'Current Curated Structure Dataset Eligibility = Core - Included.', 'Latest curated structure register · Core-Included only.');
  body = all(body, '<div class="polar-num"><strong>77</strong><small>Current strict-polar rows · 46 articles</small></div>', '<div class="polar-num"><strong>77</strong><small>strict-polar rows · 46 articles</small></div>');
  body = all(body, '<strong id="pcount">77 rows</strong><small>Current Curated strict-polar subset; Frozen Release 3.0.2 remains 67 rows across 42 articles.</small>', '<strong id="pcount">77 rows</strong><small>Latest strict-polar subset. Polar does not imply ferroelectricity.</small>');

  body = all(body,
    '<p>A read-only discovery queue for newly indexed publications. Literature Watch timestamps describe discovery operations, not the Frozen Release cutoff or the Current Curated coverage date. Candidates remain outside both evidence layers until primary-source review and QC.</p>',
    '<p>A read-only discovery queue for newly indexed publications that have not yet completed primary-evidence review. Discovery metadata is not part of the curated scientific corpus.</p>');
  body = regexRequired(body, /<p class="fine">Workflow: discovery → DOI deduplication[\s\S]*?<\/div>/,
    '<p class="fine">Workflow: discovery → DOI deduplication → scope triage → primary article/SI/CIF review → evidence extraction → QC → curated corpus. Candidate abstracts, scores, reason codes and internal adjudication remain private.</p><div class="notice">Candidate metadata is a discovery signal, not curated scientific evidence.</div>', 'watch workflow');

  body = regexRequired(body, /<details><summary>Smart RAG runtime boundary<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
    '<details><summary>Smart RAG evidence boundary</summary><p class="fine">Smart RAG searches the latest reviewed evidence corpus. Exact counts, temporal scope and protected scientific boundaries remain deterministic; structure-grain identity and crystallography are kept separate from article-grain photophysics and unmapped motif interpretation. Archived temporal scopes are used only when a question explicitly requires historical reproducibility.</p></details>', 'RAG method copy');
  body = regexRequired(body, /<details><summary>Record 13 correction history<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
    '<details><summary>Record 13 correction history</summary><p class="fine">Archived scientific snapshot 3.0.2 incorporates the four confirmed Record 13 structure-dimensionality corrections. Earlier release history is retained only for auditability; current browsing uses the corrected values.</p></details>', 'Record 13 method copy');

  body = required(body,
    '<p class="eyebrow">Citation & data availability</p><h1>Use and cite CuHalide Atlas</h1><p>The portal supports query, inspection and evidence-grounded scientific use. The complete internal curation corpus is not distributed as a public bulk download.</p>',
    '<p class="eyebrow">Data provenance & citation</p><h1>Cite the living atlas or reproduce a snapshot</h1><p>The public site always opens on the latest reviewed knowledge. An archived scientific snapshot is retained separately for exact historical reproduction.</p>', 'citation heading');
  body = required(body, '<p class="eyebrow">Recommended citation</p>', '<p class="eyebrow">Current portal</p>', 'citation eyebrow');
  body = required(body, 'CuHalide Atlas. Frozen Release 3.0.2 (11 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'CuHalide Atlas. Continuously curated Cu(I) halide knowledge portal. Curated through 14 August 2026. https://cuhalide-atlas-v3.vercel.app/', 'living citation');
  body = regexRequired(body, /<p class="fine">Frozen Release 3\.0\.2 literature cutoff:[\s\S]*?<\/p>/,
    '<p class="fine">For results from the living atlas, report the access date. The internal live revision remains machine-readable but is not required for routine browsing.</p><div class="provenance-box"><strong>Archived scientific snapshot 3.0.2</strong><p>Immutable reproducibility baseline. Snapshot coverage was verified through 30 June 2026; that date is a boundary of the archived snapshot, not a limit on the living database.</p><span class="snapshot">Snapshot 3.0.2 · 30 Jun 2026</span></div>', 'snapshot provenance box');
  body = required(body,
    'Evidence-grounded Cu(I) halide knowledge portal · Frozen Release 3.0.2 · cutoff through 2026-06-30 · curated through 2026-08-14',
    'Continuously curated Cu(I) halide knowledge · reviewed through 14 Aug 2026', 'public footer');
  body = all(body,
    '<div class="footer-links"><a href="#methods">Methods</a><a href="#citation">Citation</a><a href="#watch">Literature Watch</a></div>',
    '<div class="footer-links"><a href="#methods">Methods</a><a href="#citation">Data provenance</a><a href="#watch">Literature Watch</a></div>');

  body = required(body,
    "$('releaseDl').innerHTML=[['Frozen cutoff','through 2026-06-30'],['Frozen canonical',r.canonical_verified_articles],['Current curated through',cc.current_curated_through||'2026-08-14'],['Current revision',cc.live_revision??3],['Current canonical',cc.canonical_verified_articles||359],['Current Core structures',cc.core_included_structure_rows||887]].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');",
    "$('releaseDl').innerHTML=[['Curated through','14 Aug 2026'],['Canonical articles',cc.canonical_verified_articles||359],['Core structures',cc.core_included_structure_rows||887],['Verified SG mappings',cc.verified_space_group_rows||694],['Strict polar',cc.strict_polar_rows||77]].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');", 'status card renderer');
  body = required(body,
    "$('kpis').innerHTML=[['Article audit',cc.article_audit_records||373,'Current Curated audit'],['Canonical articles',cc.canonical_verified_articles||359,'Current canonical'],['Structures / phases',cc.structure_phase_rows||949,'Current structure-grain rows'],['Verified mappings',cc.verified_space_group_rows||694,'Current one-to-one SG mappings'],['Strict polar',cc.strict_polar_rows||77,`${cc.strict_polar_articles||46} articles`]].map(([a,b,c])=>`<article class=\"kpi\"><span>${a}</span><strong>${b}</strong><small>${c}</small></article>`).join('');",
    "$('kpis').innerHTML=[['Article audit',cc.article_audit_records||373,'reviewed DOI records'],['Canonical articles',cc.canonical_verified_articles||359,'in-scope verified'],['Structures / phases',cc.structure_phase_rows||949,'crystallographic determinations'],['Verified mappings',cc.verified_space_group_rows||694,'one-to-one SG mappings'],['Strict polar',cc.strict_polar_rows||77,`${cc.strict_polar_articles||46} articles`]].map(([a,b,c])=>`<article class=\"kpi\"><span>${a}</span><strong>${b}</strong><small>${c}</small></article>`).join('');", 'KPI renderer');
  body = required(body,
    "const cct=$('currentCuratedText');if(cct)cct.textContent=`Current Curated through ${cc.current_curated_through||'2026-08-14'} · live revision ${Number(cc.live_revision||3)} · Frozen base ${cc.base_release||r.version||'3.0.2'}.`}",
    "const cct=$('currentCuratedText');if(cct)cct.textContent=`Primary-evidence reviewed through ${cc.current_curated_through||'2026-08-14'}. The public corpus updates after QC; archived snapshots remain available under Data provenance.`}", 'curation status renderer');
  body = required(body,
    "$('acountNote').textContent=$('arel').value?`Release status = ${$('arel').value}.`:'Audit view: includes non-canonical records.';",
    "$('acountNote').textContent=$('arel').value==='Current canonical'?'Latest reviewed corpus.':$('arel').value?`Filtered review status: ${$('arel').options[$('arel').selectedIndex]?.text||$('arel').value}.`:'Audit view: includes boundary and excluded records.';", 'article count note renderer');

  body = all(body,
    '<span class="badge ${[\'Core - Verified\',\'Current Curated - Verified\'].includes(a.release_status)?\'\':\'audit\'}">${esc(a.release_status)}</span>',
    '<span class="badge ${[\'Core - Verified\',\'Current Curated - Verified\'].includes(a.release_status)?\'\':\'audit\'}">${esc([\'Core - Verified\',\'Current Curated - Verified\'].includes(a.release_status)?\'Curated\':a.release_status===\'Context - Boundary\'?\'Boundary context\':a.release_status===\'Excluded - Curated Audit\'?\'Excluded\':a.release_status===\'Pending - Primary Evidence Unavailable\'?\'Evidence pending\':a.release_status)}</span>');
  body = all(body, '<dt>Release</dt><dd>${esc(x.release_status)}</dd>', '<dt>Curation status</dt><dd>${esc([\'Core - Verified\',\'Current Curated - Verified\'].includes(x.release_status)?\'Curated\':x.release_status)}</dd>');
  body = all(body, 'Literature Watch candidate · not frozen evidence', 'Literature Watch candidate · not yet curated evidence');
  body = all(body, "'Audit view: all 949 current structure/phase rows.'", "'Audit view: all 949 structure/phase rows.'");

  body = body.replace('</head>', `${ICON_LINK}\n${STYLE_LINK}\n${LIVING_STYLE_LINK}\n</head>`)
    .replace('</body>', `${SCRIPT_LINK}\n${SCIENCE_MARKER}\n${UI_MARKER}\n</body>`);

  for (const token of ['Latest curated state','Curated through 14 Aug 2026','Archived scientific snapshot 3.0.2','Curated literature · n=359','CUHALIDE_UI_V48_4_LIVING_KNOWLEDGE']) {
    if (!body.includes(token)) throw new Error(`Living knowledge output missing: ${token}`);
  }
  if (body.includes('Frozen Release core · n=332')) throw new Error('Archived snapshot must not remain a routine browsing mode');
  if (body.includes('Frozen Release 3.0.2 · cutoff through 2026-06-30')) throw new Error('Archived snapshot cutoff must not be presented as living-portal freshness');
  return body;
}

function finalInlineScriptHashes(html) {
  const hashes = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(String(html))) !== null) {
    if (/\bsrc\s*=/i.test(match[1])) continue;
    hashes.push(`'sha256-${crypto.createHash('sha256').update(match[2]).digest('base64')}'`);
  }
  return [...new Set(hashes)];
}

function synchronizeFinalCsp(html, res) {
  const current = String(res.getHeader?.('Content-Security-Policy') || '');
  if (!current) throw new Error('Missing Content-Security-Policy from site handler');
  const hashes = finalInlineScriptHashes(html);
  if (!hashes.length) throw new Error('No inline scripts found for strict CSP synchronization');
  if (!/\bscript-src\s+[^;]*;/i.test(current)) throw new Error('CSP script-src directive missing');
  const next = current.replace(/\bscript-src\s+[^;]*;/i, `script-src 'self' ${hashes.join(' ')};`);
  if (/script-src[^;]*'unsafe-inline'/i.test(next)) throw new Error('unsafe-inline is forbidden');
  res.setHeader('Content-Security-Policy', next);
}

export default async function handler(req, res) {
  res.setHeader('X-CuHalide-UI-Version', UI_VERSION);
  res.setHeader('X-CuHalide-Current-Curated-Revision', CURRENT_REVISION);
  res.setHeader('Last-Modified', LAST_MODIFIED);
  const bridge = {
    setHeader: (name, value) => {
      const lower = String(name).toLowerCase();
      if (lower === 'x-cuhalide-current-curated-revision') return res.setHeader(name, CURRENT_REVISION);
      if (lower === 'last-modified') return res.setHeader(name, LAST_MODIFIED);
      return res.setHeader(name, value);
    },
    end: body => {
      const finalBody = enhanceHtml(body);
      if (typeof finalBody === 'string' && finalBody.includes('</html>')) synchronizeFinalCsp(finalBody, res);
      return res.end(finalBody);
    },
  };
  Object.defineProperty(bridge, 'statusCode', { get: () => res.statusCode, set: value => { res.statusCode = value; } });
  return siteHandler(req, bridge);
}
