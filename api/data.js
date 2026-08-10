const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-data-stable';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, req) {
  let lastError;
  let lastResponse;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, {
        method: req.method,
        headers: {
          accept: req.headers.accept || 'application/json',
          'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Data-Proxy/2.0',
        },
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
  throw lastError || new Error('Data backend request failed');
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

    const response = await fetchWithRetry(upstream, req);
    res.statusCode = response.status;
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const action = (incoming.searchParams.get('action') || '').toLowerCase();
    const dynamic = ['status', 'health', 'bootstrap', 'candidates', 'errata'].includes(action);
    res.setHeader('Cache-Control', dynamic ? 'no-store' : (response.headers.get('cache-control') || 'public, max-age=60, s-maxage=300'));
    for (const header of ['etag', 'x-cuhalide-release']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-data-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({
      error: error?.name === 'AbortError' ? 'CuHalide Atlas data backend timed out.' : 'CuHalide Atlas data backend is temporarily unavailable.',
      release: '3.0.1',
    }));
  }
}
