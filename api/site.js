import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RELEASE = '3.0.2';
const RELEASE_DATE = '2026-08-11';
const SITE_VERSION = '48';
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
  html = regexOne(html, /"dateModified":"[^"]+"/, `"dateModified":"${RELEASE_DATE}"`, 'JSON-LD dateModified');
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
  html = one(html, '<span class="ver">Release 3.0.1</span>', '<span class="ver">Release 3.0.2</span>', 'release badge');
  html = regexOne(html, /<p class="release-note">Frozen literature cutoff:[\s\S]*?<\/p>/,
    '<p class="release-note">Frozen literature cutoff: June 2026. Release 3.0.2 is a scientific hotfix over 3.0.1 that physically incorporates the four confirmed Record 13 dimensionality corrections. It adds no new literature and changes no frozen denominator. Rolling Current Curated additions are tracked separately.</p>', 'release note');
  html = one(html,
    '<article class="panel"><p class="eyebrow">Interpretation note</p><h2>Denominators are explicit</h2><p class="fine">Article, structure, resolved-space-group and verified one-to-one subsets answer different questions. The interface labels each denominator rather than presenting them as interchangeable corpus sizes.</p></article>',
    '<article class="panel"><p class="eyebrow">Rolling curation</p><h2>Current Curated</h2><p class="fine" id="currentCuratedText">Loading current curated status…</p><p class="fine">New literature enters this layer only after primary article/SI/CIF review and QC. Frozen releases remain immutable.</p></article>', 'Current Curated panel');
  html = one(html,
    '<label class="field"><span>Halogen</span><select id="ahal"><option value="">All</option></select></label><label class="field"><span>Dimensionality</span><select id="adim">',
    '<label class="field"><span>Halogen set</span><select id="ahal"><option value="">All</option></select></label><p class="fine" id="articleHalogenNote">Single-halogen filters include mixed records containing that halogen; mixed labels are exact curated categories.</p><label class="field"><span>Dimensionality</span><select id="adim">',
    'article halogen filter semantics');
  html = one(html,
    '<p>A read-only view of recently discovered publications that may fall within scope. Candidate metadata remains outside the frozen release until primary-source verification is complete.</p>',
    '<p>A read-only discovery queue for newly indexed publications. Candidates remain outside both the Frozen Release and Current Curated until primary article/SI/CIF evidence is reviewed and quality control passes.</p>', 'Literature Watch intro');
  html = regexOne(html, /<p class="fine">Public display is limited to title, year, journal, DOI and review status\.[\s\S]*?<\/div>/,
    '<p class="fine">Workflow: discovery → DOI deduplication → scope triage → primary article/SI/CIF acquisition → evidence extraction → QC → Current Curated → later formal release. Candidate abstracts, scores, reason codes and internal adjudication remain private.</p><div class="notice">Candidate metadata is a prompt for primary-source review, not scientific evidence for a frozen or live-curated claim.</div>', 'Literature Watch workflow');
  html = regexOne(html, /<details><summary>Smart RAG runtime boundary<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
    '<details><summary>Smart RAG runtime boundary</summary><p class="fine">Release 3.0.2 uses Smart RAG 9.12.0 with deterministic scientific guards, evidence-grain-safe retrieval and source-constrained claim validation. Fresh rag-benchmark-v1.6 passed 70/70 on release 3.0.2; Live Monitor candidate metadata remains isolated from model-supported frozen scientific claims.</p></details>', 'RAG methods');
  html = regexOne(html, /<details><summary>Known release erratum<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
    '<details><summary>Record 13 correction history</summary><p class="fine">Release 3.0.2 physically incorporates the four confirmed Record 13 structure-dimensionality corrections. Historical release 3.0.1 remains immutable and retains the errata record for auditability; the correction changes no article, structure, crystallographic or polar denominator.</p></details>', 'Record 13 history');
  html = one(html, 'CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'CuHalide Atlas. Release 3.0.2 (11 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'citation');
  html = regexOne(html, /<p class="fine">Frozen literature cutoff: June 2026\. Include an access date[\s\S]*?<\/p>/,
    '<p class="fine">Frozen literature cutoff: June 2026. Release 3.0.2 incorporates the confirmed Record 13 dimensionality corrections; the 3.0.1 errata remain available as historical audit metadata. Include an access date if required by the target journal.</p>', 'citation note');
  html = one(html, 'Evidence-grounded Cu(I) halide knowledge portal · Release 3.0.1 · cutoff 2026-06', 'Evidence-grounded Cu(I) halide knowledge portal · Release 3.0.2 · cutoff 2026-06', 'footer');
  html = one(html, 'function renderHome(){const r=S.boot.release,o=S.boot.overview;', 'function renderHome(){const r=S.boot.release,o=S.boot.overview,cc=S.boot.current_curated||{};', 'Current Curated binding');
  html = one(html, "['Strict polar',r.strict_polar_rows],['Literature cutoff','2026-06']]", "['Strict polar',r.strict_polar_rows],['Literature cutoff','2026-06'],['Current curated through',cc.current_curated_through||'2026-08-11']]", 'release card status');
  html = one(html,
    "$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12).map(x=>`<div class=\"sg\"><strong>${esc(x.space_group)}</strong><small>${x.structure_count} structures · ${x.article_count} articles</small></div>`).join('')}",
    "$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12).map(x=>`<div class=\"sg\"><strong>${esc(x.space_group)}</strong><small>${x.structure_count} structures · ${x.article_count} articles</small></div>`).join('');const cct=$('currentCuratedText');if(cct){const d=cc.current_curated_through||'not advanced';const rev=Number(cc.live_revision||0);cct.textContent=`Current Curated through ${d} · live revision ${rev}. Frozen base ${cc.base_release||r.version||'3.0.2'}.`}}", 'Current Curated renderer');

  if (html.includes('2026.06')) throw new Error('Stale 2026.06 display found');
  if (!html.includes('Display window 2006–2026')) throw new Error('2026 publication-growth display missing');
  if (!html.includes('CUHALIDE_SITE_V48_CURRENT_CURATED')) throw new Error('v48 marker missing');
  if (!html.includes(`"dateModified":"${RELEASE_DATE}"`)) throw new Error('JSON-LD release date drift');
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
  if (req.method === 'HEAD') return res.end();
  return res.end(portal.html);
}
