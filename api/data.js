const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const RELEASE = '3.0.2';
const PUBLIC_DATA_VERSION = '2.7.0';
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
          'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Legacy-Data/48',
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
    res.setHeader('X-CuHalide-Release', response.headers.get('x-cuhalide-release') || RELEASE);
    res.setHeader('X-CuHalide-Public-Data-Version', response.headers.get('x-cuhalide-public-data-version') || PUBLIC_DATA_VERSION);
    res.setHeader('Warning', '299 - Legacy /api/data route exposes only the minimized public query contract.');
    if (req.method === 'HEAD') return res.end();
    return res.end(await response.text());
  } catch (error) {
    console.error('[cuhalide-legacy-data-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('X-CuHalide-Public-Access', 'query-and-view');
    res.setHeader('X-CuHalide-Release', RELEASE);
    res.setHeader('X-CuHalide-Public-Data-Version', PUBLIC_DATA_VERSION);
    return res.end(JSON.stringify({
      error: 'CuHalide Atlas public data service is temporarily unavailable.',
      release: RELEASE,
      public_access: 'query-and-view'
    }));
  }
}
