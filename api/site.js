import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RELEASE = '3.0.2';
const RELEASE_DATE = '2026-08-11';
const CONTENT_DATE = '2026-08-12';
const SITE_VERSION = '48';
const CURRENT_REVISION = '1';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'index.html');

function one(text, from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one occurrence, found ${count}`);
  return text.replace(from, to);
}
function regexOne(text, pattern, to, label) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = text.match(new RegExp(pattern.source, flags)) || [];
  if (matches.length !== 1) throw new Error(`${label}: expected one match, found ${matches.length}`);
  return text.replace(pattern, to);
}
function sha(text) {
  return `'sha256-${crypto.createHash('sha256').update(text).digest('base64')}'`;
}

function buildPortal() {
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  html = one(html, '<meta name="cuhalide-release" content="3.0.1">', '<meta name="cuhalide-release" content="3.0.2">', 'release meta');
  html = one(html, '<meta name="cuhalide-site-version" content="47">', '<meta name="cuhalide-site-version" content="48">', 'site meta');
  html = regexOne(html, /"dateModified":"[^"]+"/, `"dateModified":"${CONTENT_DATE}"`, 'JSON-LD dateModified');
  if (!html.includes('property="og:image"')) {
    html = one(html,
      `<meta property="og:url" content="${PUBLIC_ORIGIN}/">`,
      `<meta property="og:url" content="${PUBLIC_ORIGIN}/">\n<meta property="og:image" content="${PUBLIC_ORIGIN}/og-image.svg">\n<meta property="og:image:alt" content="CuHalide Atlas — evidence-grounded Cu(I) halide knowledge portal">`,
      'Open Graph image');
  }
  html = one(html,
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${PUBLIC_ORIGIN}/og-image.svg">`,
    'Twitter card image');
  if (/<!-- CUHALIDE_SITE_V\d+_[^>]+ -->/.test(html)) html = html.replace(/<!-- CUHALIDE_SITE_V\d+_[^>]+ -->/, '<!-- CUHALIDE_SITE_V48_CURRENT_CURATED -->');
  else html = html.replace('</body>', '<!-- CUHALIDE_SITE_V48_CURRENT_CURATED -->\n</body>');

  html = one(html, '<span class="ver">Release 3.0.1</span>', '<span class="ver">Frozen Release 3.0.2</span>', 'release badge');
  html = regexOne(html, /<p class="release-note">Frozen literature cutoff:[\s\S]*?<\/p>/,
    '<p class="release-note"><strong>Frozen Release 3.0.2</strong> has a literature cutoff of June 2026, inclusive through 2026-06-30, and remains immutable. <strong>Current Curated rev.1</strong> is separately curated through 2026-08-12 and adds 14 cutoff-period coverage backfills plus 2 post-cutoff articles after primary-evidence QC.</p>', 'release temporal note');

  html = one(html,
    '<article class="panel"><p class="eyebrow">Interpretation note</p><h2>Denominators are explicit</h2><p class="fine">Article, structure, resolved-space-group and verified one-to-one subsets answer different questions. The interface labels each denominator rather than presenting them as interchangeable corpus sizes.</p></article>',
    '<article class="panel"><p class="eyebrow">Rolling curation</p><h2>Current Curated rev.1</h2><p class="fine" id="currentCuratedText">Loading Current Curated status…</p><p class="fine">Primary article/SI/CIF and crystallographic QC are required before promotion. Frozen Release 3.0.2 remains immutable and independently citable.</p></article>', 'Current Curated panel');

  html = one(html,
    '<span class="denom">Canonical articles · n = 332</span>',
    '<span class="denom">Current canonical articles · n = 348 · Frozen Release = 332</span>',
    'article denominator');
  html = one(html,
    '<span class="denom">Core-included structure rows · n = 816</span>',
    '<span class="denom">Current Core-Included structure rows · n = 859 · Frozen Release = 816</span>',
    'structure denominator');
  html = one(html,
    '<span class="denom">Resolved structure rows · n = 650</span>',
    '<span class="denom">Current resolved structure rows · n = 693 · Frozen Release = 650</span>',
    'resolved denominator');

  html = regexOne(html, /<select id="arel">[\s\S]*?<\/select>/,
    '<select id="arel"><option value="Current canonical" selected>Current canonical · n=348</option><option value="Core - Verified">Frozen Release core · n=332</option><option value="Current Curated - Verified">Current Curated additions · n=16</option><option value="">All current audit records · n=362</option><option value="Context - Boundary">Boundary context</option><option value="Excluded - Curated Audit">Excluded audit</option><option value="Pending - Primary Evidence Unavailable">Primary evidence pending</option></select>', 'article dataset selector');
  html = one(html, 'Reset to canonical core', 'Reset to Current canonical', 'article reset label');
  html = one(html, 'Canonical release status = Core - Verified.', 'Default data layer = Current canonical; Frozen Release core remains selectable.', 'article count note');
  html = one(html,
    'The default view is the canonical scientific core. Switch to an audit view only when you explicitly need boundary, excluded or primary-evidence-pending records.',
    'The default view is Current Curated canonical evidence (Frozen Release 3.0.2 plus primary-evidence-reviewed rev.1 additions). Frozen core and audit views remain explicitly selectable.',
    'article intro');

  html = one(html,
    '<label class="field"><span>Halogen</span><select id="ahal"><option value="">All</option></select></label><label class="field"><span>Dimensionality</span><select id="adim">',
    '<label class="field"><span>Halogen set</span><select id="ahal"><option value="">All</option></select></label><p class="fine" id="articleHalogenNote">Single-halogen filters include mixed records containing that halogen; mixed labels are exact curated categories.</p><label class="field"><span>Dimensionality</span><select id="adim">',
    'article halogen filter semantics');

  html = one(html, '<option value="Core - Included" selected>Core-Included · n=816</option><option value="">All 878 rows</option>', '<option value="Core - Included" selected>Current Core-Included · n=859</option><option value="">All current rows · n=921</option>', 'structure selector counts');
  html = one(html,
    'The default view contains only canonical Core-Included structure/phase rows. Search is restricted to structure-grain identity and crystallographic fields; article titles, article-level photophysics and unmapped motif text are excluded from structure search.',
    'The default view contains Current Curated Core-Included structure/phase rows. Frozen Release rows remain the immutable base; structure search is restricted to identity and crystallographic fields, with article-level photophysics and unmapped motif text excluded.',
    'structure intro');
  html = one(html, 'Canonical Structure Dataset Eligibility = Core - Included.', 'Current Curated Structure Dataset Eligibility = Core - Included.', 'structure note');
  html = one(html, '<div class="polar-num"><strong>67</strong><small>structure / phase rows · 42 articles</small></div>', '<div class="polar-num"><strong>77</strong><small>Current strict-polar rows · 46 articles</small></div>', 'polar hero');
  html = one(html, '<strong id="pcount">67 rows</strong><small>Strict-polar denominator is fixed by the frozen release rules.</small>', '<strong id="pcount">77 rows</strong><small>Current Curated strict-polar subset; Frozen Release 3.0.2 remains 67 rows across 42 articles.</small>', 'polar denominator');

  html = one(html,
    '<p>A read-only view of recently discovered publications that may fall within scope. Candidate metadata remains outside the frozen release until primary-source verification is complete.</p>',
    '<p>A read-only discovery queue for newly indexed publications. Literature Watch timestamps describe discovery operations, not the Frozen Release cutoff or the Current Curated coverage date. Candidates remain outside both evidence layers until primary-source review and QC.</p>', 'Literature Watch intro');
  html = regexOne(html, /<p class="fine">Public display is limited to title, year, journal, DOI and review status\.[\s\S]*?<\/div>/,
    '<p class="fine">Workflow: discovery → DOI deduplication → scope triage → primary article/SI/CIF acquisition → evidence extraction → QC → Current Curated → later formal release. Candidate abstracts, scores, reason codes and internal adjudication remain private.</p><div class="notice">Candidate metadata is a prompt for primary-source review, not scientific evidence for either Frozen Release or Current Curated.</div>', 'Literature Watch workflow');

  html = regexOne(html, /<details><summary>Smart RAG runtime boundary<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
    '<details><summary>Smart RAG runtime boundary</summary><p class="fine">Smart RAG 9.13.0 searches the immutable Frozen Release 3.0.2 evidence base together with Current Curated rev.1 using a unified 1,283-document BGE-M3/RRF retrieval layer. Exact counts, temporal scope and protected scientific boundaries are deterministic; structure-grain identity/crystallography remains separated from article-grain photophysics and unmapped motif interpretation.</p></details>', 'RAG methods');
  html = regexOne(html, /<details><summary>Known release erratum<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
    '<details><summary>Record 13 correction history</summary><p class="fine">Frozen Release 3.0.2 physically incorporates the four confirmed Record 13 structure-dimensionality corrections. Historical release 3.0.1 remains immutable and retains the errata record for auditability; no frozen scientific denominator changed.</p></details>', 'Record 13 history');

  html = one(html, 'CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'CuHalide Atlas. Frozen Release 3.0.2 (11 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'citation');
  html = regexOne(html, /<p class="fine">Frozen literature cutoff: June 2026\. Include an access date[\s\S]*?<\/p>/,
    '<p class="fine">Frozen Release 3.0.2 literature cutoff: June 2026, inclusive through 2026-06-30. When citing rolling Current Curated results, also report the access date and live revision (currently rev.1, curated through 2026-08-12).</p>', 'citation note');
  html = one(html, 'Evidence-grounded Cu(I) halide knowledge portal · Release 3.0.1 · cutoff 2026-06', 'Evidence-grounded Cu(I) halide knowledge portal · Frozen Release 3.0.2 · cutoff through 2026-06-30 · Current Curated rev.1 through 2026-08-12', 'footer');

  html = one(html, 'function renderHome(){const r=S.boot.release,o=S.boot.overview;', 'function renderHome(){const r=S.boot.release,o=S.boot.overview,cc=S.boot.current_curated||{};', 'Current Curated binding');
  html = one(html,
    "$('releaseDl').innerHTML=[['Canonical articles',r.canonical_verified_articles],['Core structures',r.core_included_structure_rows||816],['Verified SG mappings',r.verified_space_group_rows],['Strict polar',r.strict_polar_rows],['Literature cutoff','2026-06']].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');",
    "$('releaseDl').innerHTML=[['Frozen cutoff','through 2026-06-30'],['Frozen canonical',r.canonical_verified_articles],['Current curated through',cc.current_curated_through||'2026-08-12'],['Current revision',cc.live_revision??1],['Current canonical',cc.canonical_verified_articles||348],['Current Core structures',cc.core_included_structure_rows||859]].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');",
    'release card temporal layers');
  html = one(html,
    "$('kpis').innerHTML=[['Article audit',r.article_audit_records,'all audited DOI records'],['Canonical articles',r.canonical_verified_articles,'scientific core'],['Structures / phases',r.structure_phase_rows,'all structure-grain rows'],['Verified mappings',r.verified_space_group_rows,'one-to-one SG mappings'],['Strict polar',r.strict_polar_rows,`${r.strict_polar_articles} articles`]].map(([a,b,c])=>`<article class=\"kpi\"><span>${a}</span><strong>${b}</strong><small>${c}</small></article>`).join('');",
    "$('kpis').innerHTML=[['Article audit',cc.article_audit_records||362,'Current Curated audit'],['Canonical articles',cc.canonical_verified_articles||348,'Current canonical'],['Structures / phases',cc.structure_phase_rows||921,'Current structure-grain rows'],['Verified mappings',cc.verified_space_group_rows||668,'Current one-to-one SG mappings'],['Strict polar',cc.strict_polar_rows||77,`${cc.strict_polar_articles||46} articles`]].map(([a,b,c])=>`<article class=\"kpi\"><span>${a}</span><strong>${b}</strong><small>${c}</small></article>`).join('');",
    'Current KPI renderer');
  html = one(html,
    "$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12).map(x=>`<div class=\"sg\"><strong>${esc(x.space_group)}</strong><small>${x.structure_count} structures · ${x.article_count} articles</small></div>`).join('')}",
    "$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12).map(x=>`<div class=\"sg\"><strong>${esc(x.space_group)}</strong><small>${x.structure_count} structures · ${x.article_count} articles</small></div>`).join('');const cct=$('currentCuratedText');if(cct)cct.textContent=`Current Curated through ${cc.current_curated_through||'2026-08-12'} · live revision ${Number(cc.live_revision||1)} · Frozen base ${cc.base_release||r.version||'3.0.2'}.`}",
    'Current Curated renderer');
  html = one(html, "a.release_status==='Core - Verified'?'':'audit'", "['Core - Verified','Current Curated - Verified'].includes(a.release_status)?'':'audit'", 'Current article badge');
  html = one(html, "'Audit view: all 878 structure/phase rows.'", "'Audit view: all 921 current structure/phase rows.'", 'structure audit note');
  html = one(html, "$('arel').value='Core - Verified'", "$('arel').value='Current canonical'", 'article reset state');

  if (html.includes('2026.06')) throw new Error('Stale 2026.06 display found');
  if (!html.includes('Display window 2006–2026')) throw new Error('2026 publication-growth display missing');
  if (!html.includes('CUHALIDE_SITE_V48_CURRENT_CURATED')) throw new Error('v48 marker missing');
  if (!html.includes(`\"dateModified\":\"${CONTENT_DATE}\"`)) throw new Error('JSON-LD current content date drift');
  if (!html.includes('Frozen Release 3.0.2')) throw new Error('Frozen Release temporal label missing');
  if (!html.includes('2026-06-30')) throw new Error('Frozen inclusive cutoff missing');
  if (!html.includes('Current Curated rev.1')) throw new Error('Current Curated revision label missing');
  if (!html.includes('2026-08-12')) throw new Error('Current Curated coverage date missing');
  if (!html.includes('Current canonical · n=348')) throw new Error('Current canonical article default missing');
  if (!html.includes('Current Core-Included · n=859')) throw new Error('Current structure default missing');
  if (!html.includes('Single-halogen filters include mixed records')) throw new Error('Article halogen filter semantics missing');
  if (!html.includes(`${PUBLIC_ORIGIN}/og-image.svg`)) throw new Error('Open Graph image metadata missing');

  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => sha(m[1]));
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !/\bsrc\s*=/i.test(m[1] || '')).map(m => sha(m[2]));
  if (styles.length !== 1 || scripts.length < 1) throw new Error(`Unexpected CSP sources: ${styles.length} style / ${scripts.length} script`);
  const csp = `default-src 'self'; img-src 'self' data: https:; style-src-elem 'self' ${styles.join(' ')}; style-src-attr 'unsafe-inline'; script-src 'self' ${scripts.join(' ')}; script-src-attr 'none'; connect-src 'self'; font-src 'self' data:; object-src 'none'; media-src 'none'; worker-src 'none'; child-src 'none'; manifest-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`;
  return { html, csp };
}

const portal = buildPortal();

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="index.html"');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Security-Policy', portal.csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-CuHalide-Release', RELEASE);
  res.setHeader('X-CuHalide-Site-Version', SITE_VERSION);
  res.setHeader('X-CuHalide-Current-Curated-Revision', CURRENT_REVISION);
  res.setHeader('Last-Modified', new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString());
  if (req.method === 'HEAD') return res.end();
  return res.end(portal.html);
}
