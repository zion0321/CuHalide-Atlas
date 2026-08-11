const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const DATA = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
const RELEASE_DATE = '2026-08-11';

const xml = (v) => String(v).replace(/[<>&'\"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

async function pages(action, extra) {
  const items = [];
  let page = 1;
  for (;;) {
    const u = new URL(DATA);
    u.searchParams.set('action', action);
    u.searchParams.set('page', String(page));
    u.searchParams.set('page_size', '100');
    for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
    const r = await fetch(u, { headers: { accept: 'application/json', 'user-agent': 'CuHalide-Atlas-Sitemap/48' }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`${action} page ${page}: HTTP ${r.status}`);
    const data = await r.json();
    items.push(...(data.items || []));
    if (!data.pagination?.has_next) break;
    page += 1;
    if (page > 20) throw new Error(`${action} pagination exceeded safety bound`);
  }
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
      pages('articles', { release_status: 'Core - Verified' }),
      pages('structures', { eligibility: 'Core - Included' }),
    ]);
    const urls = [
      { loc: `${PUBLIC_ORIGIN}/`, priority: '1.0' },
      ...articles.map((x) => ({ loc: `${PUBLIC_ORIGIN}/article/${encodeURIComponent(x.record_id)}`, priority: '0.7' })),
      ...structures.map((x) => ({ loc: `${PUBLIC_ORIGIN}/structure/${encodeURIComponent(x.structure_id)}`, priority: '0.6' })),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${xml(u.loc)}</loc><lastmod>${RELEASE_DATE}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-CuHalide-Release', '3.0.2');
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
