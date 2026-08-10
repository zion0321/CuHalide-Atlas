const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-smart-rag';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestBody(req) {
  if (req.body == null) return undefined;
  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body);
}

async function upstreamRequest(req, upstream) {
  const headers = {
    accept: req.headers.accept || 'application/json',
    'user-agent': req.headers['user-agent'] || 'CuHalide-Atlas-Vercel-Agent-Proxy/2.0',
  };
  if (req.method === 'POST') headers['content-type'] = req.headers['content-type'] || 'application/json';

  const attempts = req.method === 'POST' ? 1 : 2;
  const timeoutMs = req.method === 'POST' ? 120000 : 20000;
  let lastError;
  let lastResult;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(upstream, {
        method: req.method,
        headers,
        body: req.method === 'POST' ? requestBody(req) : undefined,
        redirect: 'follow',
        signal: controller.signal,
      });
      const body = req.method === 'HEAD' ? '' : await response.text();
      clearTimeout(timer);
      lastResult = { response, body };
      if (response.status < 500 || attempt === attempts - 1) return lastResult;
      await sleep(200);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < attempts - 1) await sleep(200);
    }
  }
  if (lastResult) return lastResult;
  throw lastError || new Error('Smart RAG backend request failed');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, HEAD, POST, OPTIONS');
    return res.end();
  }
  if (!['GET', 'HEAD', 'POST'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD, POST, OPTIONS');
    return res.end('Method Not Allowed');
  }

  try {
    const incoming = new URL(req.url, PUBLIC_ORIGIN);
    const upstream = new URL(UPSTREAM);
    for (const [key, value] of incoming.searchParams.entries()) upstream.searchParams.append(key, value);

    const { response, body } = await upstreamRequest(req, upstream);
    res.statusCode = response.status;
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    for (const header of ['x-cuhalide-release', 'x-cuhalide-rag-version']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    if (req.method === 'HEAD') return res.end();
    return res.end(body);
  } catch (error) {
    console.error('[cuhalide-agent-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({
      error: error?.name === 'AbortError' ? 'CuHalide Atlas Smart RAG backend timed out.' : 'CuHalide Atlas Smart RAG backend is temporarily unavailable.',
      release: '3.0.1',
    }));
  }
}
