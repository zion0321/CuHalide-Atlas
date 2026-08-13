const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const DATA = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
const CONTENT_DATE = '2026-08-13';
const RELEASE = '3.0.2';
const CURRENT_REVISION = '2';
const PAGE_SIZE = 40;
const MAX_PAGES = 100;
const FETCH_CONCURRENCY = 6;
const MAX_FETCH_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [350, 1100];
const EXPECTED_ARTICLES = 356;
const EXPECTED_STRUCTURES = 873;
const EXPECTED_URLS = 2 + EXPECTED_ARTICLES + EXPECTED_STRUCTURES;

const xml = (v) => String(v).replace(/[<>&'\"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isRetryableStatus = (status) => status === 429 || status >= 500;

function retryDelay(response, attempt) {
  const retryAfter = Number(response?.headers?.get?.('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter >= 0) return Math.min(5000, retryAfter * 1000);
  return RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)] || 1100;
}

function pageUrl(action, extra, page) {
  const u = new URL(DATA);
  u.searchParams.set('action', action);
  u.searchParams.set('page', String(page));
  u.searchParams.set('page_size', String(PAGE_SIZE));
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  return u;
}

async function fetchPage(url, action, page) {
  let lastError = null;
  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'CuHalide-Atlas-Sitemap/48.3' }, signal: AbortSignal.timeout(30000) });
      if (response.ok) return await response.json();
      lastError = new Error(`${action} page ${page}: HTTP ${response.status}`);
      if (!isRetryableStatus(response.status) || attempt === MAX_FETCH_ATTEMPTS - 1) throw lastError;
      await response.arrayBuffer().catch(() => null);
      await sleep(retryDelay(response, attempt));
    } catch (error) {
      lastError = error;
      const nonRetryableHttp = /HTTP\s+(\d+)/.exec(String(error?.message || ''));
      if (nonRetryableHttp && !isRetryableStatus(Number(nonRetryableHttp[1]))) throw error;
      if (attempt === MAX_FETCH_ATTEMPTS - 1) throw error;
      if (!response) await sleep(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)] || 1100);
    }
  }
  throw lastError || new Error(`${action} page ${page}: upstream request failed`);
}

function validatePage(data, action, page, expectedTotal = null, expectedPages = null) {
  const chunk = Array.isArray(data?.items) ? data.items : null;
  const pagination = data?.pagination || {};
  const reportedPage = Number(pagination.page);
  const total = Number(pagination.total);
  const totalPages = Number(pagination.total_pages);
  if (!chunk) throw new Error(`${action} page ${page}: invalid items payload`);
  if (!Number.isInteger(reportedPage) || reportedPage !== page) throw new Error(`${action} page ${page}: pagination page mismatch`);
  if (!Number.isInteger(total) || total < 0) throw new Error(`${action} page ${page}: invalid total`);
  if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > MAX_PAGES) throw new Error(`${action} page ${page}: invalid total_pages ${totalPages}`);
  if (expectedTotal != null && total !== expectedTotal) throw new Error(`${action} page ${page}: pagination total changed from ${expectedTotal} to ${total}`);
  if (expectedPages != null && totalPages !== expectedPages) throw new Error(`${action} page ${page}: pagination total_pages changed from ${expectedPages} to ${totalPages}`);
  const shouldHaveNext = page < totalPages;
  if (Boolean(pagination.has_next) !== shouldHaveNext) throw new Error(`${action} page ${page}: has_next inconsistent with total_pages ${totalPages}`);
  if (shouldHaveNext && chunk.length === 0) throw new Error(`${action} page ${page}: empty page reported before final page`);
  return { chunk, total, totalPages };
}

async function pages(action, extra) {
  // Fetch page 1 first to establish a single denominator/page-count snapshot.
  // Remaining pages are independent reads and can then be fetched with bounded
  // concurrency, retaining page-by-page retry and exact consistency checks.
  const firstData = await fetchPage(pageUrl(action, extra, 1), action, 1);
  const first = validatePage(firstData, action, 1);
  const chunks = new Array(first.totalPages);
  chunks[0] = first.chunk;

  if (first.totalPages > 1) {
    const pending = Array.from({ length: first.totalPages - 1 }, (_, index) => index + 2);
    let cursor = 0;
    const worker = async () => {
      for (;;) {
        const index = cursor;
        cursor += 1;
        if (index >= pending.length) return;
        const page = pending[index];
        const data = await fetchPage(pageUrl(action, extra, page), action, page);
        const validated = validatePage(data, action, page, first.total, first.totalPages);
        chunks[page - 1] = validated.chunk;
      }
    };
    const workers = Math.min(FETCH_CONCURRENCY, pending.length);
    await Promise.all(Array.from({ length: workers }, () => worker()));
  }

  if (chunks.some((chunk) => !Array.isArray(chunk))) throw new Error(`${action} sitemap pagination produced an incomplete page set`);
  const items = chunks.flat();
  if (items.length !== first.total) throw new Error(`${action} sitemap row count ${items.length} does not match reported total ${first.total}`);
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
      { loc: `${PUBLIC_ORIGIN}/motifs`, priority: '0.9' },
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
