const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const DATA = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
const CONTENT_DATE = '2026-08-12';
const RELEASE = '3.0.2';
const CURRENT_REVISION = '1';
const PAGE_SIZE = 40;
const MAX_PAGES = 100;
const EXPECTED_ARTICLES = 348;
const EXPECTED_STRUCTURES = 859;
const EXPECTED_URLS = 1 + EXPECTED_ARTICLES + EXPECTED_STRUCTURES;

const xml = (v) => String(v).replace(/[<>&'\"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

async function pages(action, extra) {
  const items = [];
  let page = 1;
  let expectedTotal = null;
  let expectedPages = null;
  for (;;) {
    const u = new URL(DATA);
    u.searchParams.set('action', action);
    u.searchParams.set('page', String(page));
    u.searchParams.set('page_size', String(PAGE_SIZE));
    for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
    const r = await fetch(u, { headers: { accept: 'application/json', 'user-agent': 'CuHalide-Atlas-Sitemap/48.1' }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`${action} page ${page}: HTTP ${r.status}`);
    const data = await r.json();
    const chunk = Array.isArray(data.items) ? data.items : null;
    const pagination = data.pagination || {};
    const reportedPage = Number(pagination.page);
    const total = Number(pagination.total);
    const totalPages = Number(pagination.total_pages);
    if (!chunk) throw new Error(`${action} page ${page}: invalid items payload`);
    if (!Number.isInteger(reportedPage) || reportedPage !== page) throw new Error(`${action} page ${page}: pagination page mismatch`);
    if (!Number.isInteger(total) || total < 0) throw new Error(`${action} page ${page}: invalid total`);
    if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > MAX_PAGES) throw new Error(`${action} page ${page}: invalid total_pages ${totalPages}`);
    if (page === 1) { expectedTotal = total; expectedPages = totalPages; }
    else if (total !== expectedTotal || totalPages !== expectedPages) throw new Error(`${action} page ${page}: pagination totals changed during crawl`);
    items.push(...chunk);
    if (!pagination.has_next) {
      if (page !== expectedPages) throw new Error(`${action} ended on page ${page}, expected ${expectedPages}`);
      break;
    }
    if (chunk.length === 0) throw new Error(`${action} page ${page}: empty page reported has_next`);
    if (page >= expectedPages) throw new Error(`${action} page ${page}: has_next beyond reported total_pages`);
    page += 1;
    if (page > MAX_PAGES) throw new Error(`${action} pagination exceeded safety bound`);
  }
  if (items.length !== expectedTotal) throw new Error(`${action} sitemap row count ${items.length} does not match reported total ${expectedTotal}`);
  return items;
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }
  try {
    const [articles, structures] = await Promise.all([
      pages('articles', { release_status: 'Current canonical' }),
      pages('structures', { eligibility: 'Core - Included' }),
    ]);
    if (articles.length !== EXPECTED_ARTICLES) throw new Error(`Current canonical article sitemap denominator ${articles.length} != ${EXPECTED_ARTICLES}`);
    if (structures.length !== EXPECTED_STRUCTURES) throw new Error(`Current Core-Included structure sitemap denominator ${structures.length} != ${EXPECTED_STRUCTURES}`);
    const urls = [
      { loc: `${PUBLIC_ORIGIN}/`, priority: '1.0' },
      ...articles.map((x) => ({ loc: `${PUBLIC_ORIGIN}/article/${encodeURIComponent(x.record_id)}`, priority: '0.7' })),
      ...structures.map((x) => ({ loc: `${PUBLIC_ORIGIN}/structure/${encodeURIComponent(x.structure_id)}`, priority: '0.6' })),
    ];
    if (urls.length !== EXPECTED_URLS) throw new Error(`Sitemap cardinality ${urls.length} != ${EXPECTED_URLS}`);
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${xml(u.loc)}</loc><lastmod>${CONTENT_DATE}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-CuHalide-Release', RELEASE);
    res.setHeader('X-CuHalide-Current-Curated-Revision', CURRENT_REVISION);
    res.setHeader('X-CuHalide-Sitemap-URLs', String(EXPECTED_URLS));
    if (req.method === 'HEAD') return res.end();
    return res.end(body);
  } catch (error) {
    console.error('[sitemap]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end('Sitemap temporarily unavailable');
  }
}
