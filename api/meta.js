const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-meta-v302-stable';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, req) {
  let lastError;
  let lastResponse;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(url, {
        method: req.method,
        headers: { accept: req.headers.accept || '*/*', 'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Meta-Proxy/48.0' },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timer);
      lastResponse = response;
      if (response.status < 500 || attempt === 1) return response;
      try { await response.body?.cancel(); } catch {}
      await sleep(200);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt === 0) await sleep(200);
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError || new Error('Metadata backend request failed');
}

function contentTypeFor(requested, upstreamType) {
  if (requested === 'sitemap' || requested === 'sitemap.xml') return 'application/xml; charset=utf-8';
  if (requested === 'robots' || requested === 'robots.txt') return 'text/plain; charset=utf-8';
  if (requested === 'citation' || requested === 'citation.cff' || requested === 'cff') return 'text/plain; charset=utf-8';
  if (requested === 'manifest' || requested === 'release-manifest.json') return 'application/json; charset=utf-8';
  if (requested === 'health' || requested === 'health.json') return 'application/json; charset=utf-8';
  return upstreamType || 'application/octet-stream';
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }
  try {
    const incoming = new URL(req.url, PUBLIC_ORIGIN);
    const upstream = new URL(UPSTREAM);
    for (const [key, value] of incoming.searchParams.entries()) upstream.searchParams.append(key, value);
    const requested = (incoming.searchParams.get('action') || incoming.searchParams.get('asset') || 'health').toLowerCase();
    const response = await fetchWithRetry(upstream, req);
    res.statusCode = response.status;
    res.setHeader('Content-Type', contentTypeFor(requested, response.headers.get('content-type')));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', requested === 'health' || requested === 'health.json' ? 'no-store' : (response.headers.get('cache-control') || 'public, max-age=300, s-maxage=3600'));
    for (const header of ['etag', 'x-cuhalide-release', 'x-cuhalide-site-version', 'x-cuhalide-meta-version', 'x-cuhalide-rag-version']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-meta-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ error: error?.name === 'AbortError' ? 'CuHalide Atlas metadata backend timed out.' : 'CuHalide Atlas metadata backend is temporarily unavailable.', release: '3.0.2' }));
  }
}
