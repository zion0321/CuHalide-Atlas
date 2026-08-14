import crypto from 'node:crypto';
import siteHandler from './site.js';

const UI_VERSION = '48.4';
const CURRENT_REVISION = '3';
const CONTENT_DATE = '2026-08-14';
const LAST_MODIFIED = new Date(`${CONTENT_DATE}T00:00:00Z`).toUTCString();
const ICON_LINK = '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
const STYLE_LINK = '<link rel="stylesheet" href="/ui-v48-2.css?v=48.2">';
const SCRIPT_LINK = '<script src="/ui-v48-2.js?v=48.2" defer></script>';
const UI_MARKER = '<!-- CUHALIDE_UI_V48_4 -->';
const SCIENCE_MARKER = '<!-- CUHALIDE_SITE_V48_MOTIF_ATLAS -->';

function replaceOnce(body, from, to) {
  return typeof body === 'string' && body.includes(from) ? body.replace(from, to) : body;
}

function enhanceHtml(input) {
  if (typeof input !== 'string' || !input.includes('</head>') || !input.includes('</body>')) return input;
  if (input.includes('ui-v48-2.css') || input.includes('ui-v48-2.js')) throw new Error('UI assets already injected');

  let body = input;
  body = replaceOnce(body,
    '<a data-route="structures" href="#structures">Structures</a><a data-route="polar" href="#polar">Polar Set</a>',
    '<a data-route="structures" href="#structures">Structures</a><a href="/motifs">Motif Atlas</a><a data-route="polar" href="#polar">Polar Set</a>');
  body = replaceOnce(body,
    '<div class="actions"><a class="btn primary" href="#structures">Explore structures</a><a class="btn secondary" href="#rag">Ask Smart RAG</a></div>',
    '<div class="actions"><a class="btn primary" href="#structures">Explore structures</a><a class="btn secondary" href="/motifs">Open Motif Atlas</a><a class="btn secondary" href="#rag">Ask Smart RAG</a></div>');

  const replacements = [
    ['"dateModified":"2026-08-12"', `"dateModified":"${CONTENT_DATE}"`],
    ['<strong>Current Curated rev.1</strong> is separately curated through 2026-08-12 and adds 14 cutoff-period coverage backfills plus 2 post-cutoff articles after primary-evidence QC.', '<strong>Current Curated rev.3</strong> is separately curated through 2026-08-14 and contains 19 cutoff-period coverage backfills plus 8 post-cutoff additions after primary-evidence QC.'],
    ['<h2>Current Curated rev.1</h2>', '<h2>Current Curated rev.3</h2>'],
    ['Current canonical articles · n = 348 · Frozen Release = 332', 'Current canonical articles · n = 359 · Frozen Release = 332'],
    ['Current Core-Included structure rows · n = 859 · Frozen Release = 816', 'Current Core-Included structure rows · n = 887 · Frozen Release = 816'],
    ['Current resolved structure rows · n = 693 · Frozen Release = 650', 'Current resolved structure rows · n = 719 · Frozen Release = 650'],
    ['Current canonical · n=348', 'Current canonical · n=359'],
    ['Current Curated additions · n=16', 'Current Curated additions · n=27'],
    ['All current audit records · n=362', 'All current audit records · n=373'],
    ['Current Core-Included · n=859', 'Current Core-Included · n=887'],
    ['All current rows · n=921', 'All current rows · n=949'],
    ['Current Curated rev.1 additions', 'Current Curated rev.3 additions'],
    ['Frozen Release 3.0.2 plus primary-evidence-reviewed rev.1 additions', 'Frozen Release 3.0.2 plus primary-evidence-reviewed Current Curated additions through rev.3'],
    ['using a unified 1,283-document BGE-M3/RRF retrieval layer', 'using a unified 1,322-document BGE-M3/RRF retrieval layer'],
    ['Smart RAG 9.13.0 searches', 'Smart RAG 9.15.0 searches'],
    ['together with Current Curated rev.1', 'together with Current Curated rev.3'],
    ['currently rev.1, curated through 2026-08-12', 'currently rev.3, curated through 2026-08-14'],
    ['Current Curated rev.1 through 2026-08-12', 'Current Curated rev.3 through 2026-08-14'],
    ['all 921 current structure/phase rows', 'all 949 current structure/phase rows'],
    ["cc.current_curated_through||'2026-08-12'", "cc.current_curated_through||'2026-08-14'"],
    ['cc.live_revision??1', 'cc.live_revision??3'],
    ['cc.canonical_verified_articles||348', 'cc.canonical_verified_articles||359'],
    ['cc.core_included_structure_rows||859', 'cc.core_included_structure_rows||887'],
    ['cc.article_audit_records||362', 'cc.article_audit_records||373'],
    ['cc.structure_phase_rows||921', 'cc.structure_phase_rows||949'],
    ['cc.verified_space_group_rows||668', 'cc.verified_space_group_rows||694'],
    ["cc.current_curated_through||'2026-08-12'", "cc.current_curated_through||'2026-08-14'"],
    ['Number(cc.live_revision||1)', 'Number(cc.live_revision||3)'],
  ];
  for (const [from, to] of replacements) body = body.split(from).join(to);

  body = body.replace('</head>', `${ICON_LINK}\n${STYLE_LINK}\n</head>`)
    .replace('</body>', `${SCRIPT_LINK}\n${SCIENCE_MARKER}\n${UI_MARKER}\n</body>`);
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
