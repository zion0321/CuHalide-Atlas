const ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const SB = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1';

async function request(url, options = {}) {
  const response = await fetch(url, { redirect: 'manual', ...options });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: response.status, headers: Object.fromEntries(response.headers.entries()), text, json };
}

function hasAnyKey(value, forbidden) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((x) => hasAnyKey(x, forbidden));
  for (const [key, v] of Object.entries(value)) {
    if (forbidden.has(key)) return true;
    if (hasAnyKey(v, forbidden)) return true;
  }
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }
  const tests = [];
  const add = (name, pass, details = {}) => tests.push({ name, pass: Boolean(pass), details });
  try {
    const root = await request(`${ORIGIN}/`);
    const scripts = [...root.text.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).filter((s) => s.trim());
    const syntaxErrors = [];
    scripts.forEach((script, index) => { try { new Function(script); } catch (error) { syntaxErrors.push({ index, error: String(error) }); } });
    add('site_v45_contract', root.status === 200 && root.text.includes('cuhalide-site-version" content="45"') && root.text.includes('CUHALIDE_SITE_V45_PUBLIC_KNOWLEDGE_PORTAL') && root.text.includes("const DATA='/api/public-data'"), { status: root.status });
    add('inline_scripts_compile', scripts.length >= 1 && syntaxErrors.length === 0, { scripts: scripts.length, syntaxErrors });
    add('downloads_removed', !root.text.includes('href="#downloads"') && !root.text.includes('Data downloads') && !root.text.includes('Generate download') && !root.text.includes('data-export') && !root.text.includes('DataDownload'), {});
    add('no_direct_supabase_browser_data', !root.text.includes('tyxnyjyrfzspwcfjpzus.supabase.co'), {});

    const bootstrap = await request(`${ORIGIN}/api/public-data?action=bootstrap`);
    add('public_bootstrap', bootstrap.status === 200 && bootstrap.json?.release?.version === '3.0.1' && bootstrap.json?.public_access?.bulk_export === false && bootstrap.json?.public_access?.exact_abstracts === false, { status: bootstrap.status });

    const articles = await request(`${ORIGIN}/api/public-data?action=articles&page=1&page_size=3`);
    const articleForbidden = new Set(['Original Abstract','Search Text','review_notes','abstract','source_payload','Scope / Conflict Notes']);
    add('article_list_whitelist', articles.status === 200 && articles.json?.items?.length <= 3 && articles.json?.pagination?.page_size === 3 && !hasAnyKey(articles.json?.items, articleForbidden), { status: articles.status, keys: Object.keys(articles.json?.items?.[0] || {}) });

    const article = await request(`${ORIGIN}/api/public-data?action=article&id=13`);
    add('article_detail_no_abstract', article.status === 200 && !hasAnyKey(article.json, articleForbidden) && !('abstract' in (article.json?.item || {})), { status: article.status, keys: Object.keys(article.json?.item || {}) });

    const structures = await request(`${ORIGIN}/api/public-data?action=structures&page=1&page_size=2&dimension=0D`);
    add('structure_server_pagination', structures.status === 200 && structures.json?.items?.length <= 2 && structures.json?.pagination?.page_size === 2, { total: structures.json?.pagination?.total });

    const s01 = await request(`${ORIGIN}/api/public-data?action=structure&id=CUH-013-S01`);
    add('record13_effective_erratum', s01.status === 200 && s01.json?.item?.dimensionality === 'Unresolved' && s01.json?.item?.known_erratum === true, { item: s01.json?.item });

    const polar = await request(`${ORIGIN}/api/public-data?action=polar&page=1&page_size=2`);
    add('strict_polar_contract', polar.status === 200 && polar.json?.pagination?.total === 67 && polar.json?.items?.length <= 2, { total: polar.json?.pagination?.total });

    const candidates = await request(`${ORIGIN}/api/public-data?action=candidates&limit=3`);
    const candidateForbidden = new Set(['abstract','relevance_score','review_notes','source_payload','pass_a_score','pass_b_score','reason_codes']);
    add('candidate_metadata_minimized', candidates.status === 200 && candidates.json?.items?.length <= 3 && !hasAnyKey(candidates.json?.items, candidateForbidden), { keys: Object.keys(candidates.json?.items?.[0] || {}) });

    const watchStatus = await request(`${ORIGIN}/api/public-data?action=status`);
    add('literature_watch_status_minimized', watchStatus.status === 200 && watchStatus.json?.literature_watch && !watchStatus.json?.candidate_counts && !watchStatus.text.includes('screened_in_scope'), {});

    const legacyData = await request(`${ORIGIN}/api/data?action=articles&page=1&page_size=5000`);
    add('legacy_data_is_public_lite', legacyData.status === 200 && legacyData.json?.pagination?.page_size <= 24 && !hasAnyKey(legacyData.json?.items, articleForbidden), { page_size: legacyData.json?.pagination?.page_size });

    const legacyExport = await request(`${ORIGIN}/api/export?action=package-index`);
    add('bulk_export_retired', legacyExport.status === 410 && legacyExport.json?.public_access === 'query-and-view', { status: legacyExport.status });

    const legacySite = await request(`${ORIGIN}/api/site`);
    add('legacy_site_redirected', legacySite.status === 307 && legacySite.headers.location === '/', { status: legacySite.status, location: legacySite.headers.location });

    const manifest = await request(`${ORIGIN}/manifest.webmanifest`);
    add('public_manifest_minimized', manifest.status === 200 && manifest.json?.public_access?.bulk_normalized_export === false && !manifest.json?.snapshots && !manifest.json?.coverage_audit && !manifest.json?.surrogate_audit && !manifest.json?.smart_rag, { keys: Object.keys(manifest.json || {}) });

    const health = await request(`${ORIGIN}/health.json`);
    add('public_health_pass', health.status === 200 && health.json?.ok === true && health.json?.status === 'PASS' && health.json?.site_version === '45' && health.json?.checks && Object.values(health.json.checks).every(Boolean), { health: health.json });

    const rag = await request(`${ORIGIN}/api/agent`);
    add('rag_public_contract_minimized', rag.status === 200 && rag.json?.version === '9.9.3' && !rag.json?.providers && !rag.json?.provider && !rag.json?.model && !rag.json?.trace && !rag.json?.index && !rag.json?.internal_chain, { keys: Object.keys(rag.json || {}) });

    const robots = await request(`${ORIGIN}/robots.txt`);
    add('robots_disallow_api', robots.status === 200 && robots.text.includes('Disallow: /api/'), {});

    const rawUrls = [
      `${SB}/cuhalide-atlas-data-v301-canary?action=articles&limit=1`,
      `${SB}/cuhalide-atlas-data-stable?action=articles&limit=1`,
      `${SB}/cuhalide-atlas-candidates-v2?action=candidates&limit=1`,
      `${SB}/cuhalide-atlas-release-export-v301?action=package-index`,
      `${SB}/cuhalide-atlas-site`
    ];
    const rawResults = await Promise.all(rawUrls.map((u) => request(u)));
    add('raw_supabase_private', rawResults.every((x) => x.status === 401), { statuses: rawResults.map((x) => x.status) });

    const discovery = await request(`${SB}/cuhalide-atlas?action=candidates`);
    add('discovery_raw_reads_retired', discovery.status === 410, { status: discovery.status });

    const blockedBulk = await request(`${ORIGIN}/api/public-data?action=verified`);
    add('public_bulk_action_blocked', blockedBulk.status === 403, { status: blockedBulk.status });

    const ok = tests.every((t) => t.pass);
    res.statusCode = ok ? 200 : 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.end(JSON.stringify({ ok, version: 'public-portal-selftest-v1', checked_at: new Date().toISOString(), passed: tests.filter((t) => t.pass).length, failed: tests.filter((t) => !t.pass).length, failures: tests.filter((t) => !t.pass).map((t) => t.name), tests }, null, 2));
  } catch (error) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ ok: false, error: String(error), tests }, null, 2));
  }
}
