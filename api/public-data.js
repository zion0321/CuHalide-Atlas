const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
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
          'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Public-Data/2.7.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timer);
      lastResponse = response;
      if (response.status < 500 || attempt === 1) return response;
      try { await response.body?.cancel(); } catch {}
      await sleep(180);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt === 0) await sleep(180);
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError || new Error('Public data backend request failed');
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
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('X-CuHalide-Public-Access', 'query-and-view');
    for (const h of ['x-cuhalide-release', 'x-cuhalide-public-data-version']) {
      const v = response.headers.get(h);
      if (v) res.setHeader(h, v);
    }
    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-public-data-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({
      error: error?.name === 'AbortError' ? 'CuHalide Atlas public data backend timed out.' : 'CuHalide Atlas public data backend is temporarily unavailable.',
      release: '3.0.2',
    }));
  }
}
