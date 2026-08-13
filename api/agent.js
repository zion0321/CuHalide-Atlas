import crypto from 'node:crypto';

const UPSTREAM = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-smart-rag-v302-current-public';
const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const RAG_VERSION = '9.13.0';
const MAX_BODY_BYTES = 20_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestBody(req) {
  if (req.body == null) return undefined;
  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body);
}

function clientFingerprint(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim().slice(0, 96);
  const ua = String(req.headers['user-agent'] || '').slice(0, 240);
  return crypto.createHash('sha256').update(`cuhalide-v48-current-r1|${ip}|${ua}`).digest('hex');
}

function bodyContract(body) {
  if (body == null) return { ok: true };
  const raw = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  if (raw.byteLength > MAX_BODY_BYTES) return { ok: false, error: 'Request body too large.' };
  let parsed;
  try { parsed = typeof body === 'object' && !Buffer.isBuffer(body) ? body : JSON.parse(raw.toString('utf8')); }
  catch { return { ok: false, error: 'Invalid JSON request body.' }; }
  const messages = Array.isArray(parsed?.messages) ? parsed.messages : [];
  if (messages.length > 12) return { ok: false, error: 'Too many chat messages.' };
  if (messages.some((m) => typeof m?.content !== 'string' || m.content.length > 4000)) return { ok: false, error: 'Message content exceeds the public query limit.' };
  return { ok: true };
}

async function upstreamRequest(req, upstream) {
  const headers = {
    accept: req.headers.accept || 'application/json',
    'user-agent': `CuHalide-Atlas-Vercel-Agent-Proxy/${RAG_VERSION}`,
    'x-cuhalide-client': clientFingerprint(req),
  };
  if (req.method === 'POST') headers['content-type'] = req.headers['content-type'] || 'application/json';
  const attempts = req.method === 'POST' ? 1 : 2;
  const timeoutMs = req.method === 'POST' ? 120000 : 30000;
  let lastError;
  let lastResult;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(upstream, { method: req.method, headers, body: req.method === 'POST' ? requestBody(req) : undefined, redirect: 'follow', signal: controller.signal });
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
  if (req.method === 'POST') {
    const contract = bodyContract(req.body);
    if (!contract.ok) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.end(JSON.stringify({ error: contract.error, release: '3.0.2', version: RAG_VERSION }));
    }
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
    for (const header of ['x-cuhalide-release', 'x-cuhalide-rag-version', 'x-cuhalide-current-curated-revision']) {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    if (!res.getHeader('X-CuHalide-RAG-Version')) res.setHeader('X-CuHalide-RAG-Version', RAG_VERSION);
    if (!res.getHeader('X-CuHalide-Current-Curated-Revision')) res.setHeader('X-CuHalide-Current-Curated-Revision', '1');
    if (req.method === 'HEAD') return res.end();
    return res.end(body);
  } catch (error) {
    console.error('[cuhalide-agent-proxy]', error);
    res.statusCode = error?.name === 'AbortError' ? 504 : 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-CuHalide-RAG-Version', RAG_VERSION);
    res.setHeader('X-CuHalide-Current-Curated-Revision', '1');
    return res.end(JSON.stringify({ error: error?.name === 'AbortError' ? 'CuHalide Atlas Smart RAG backend timed out.' : 'CuHalide Atlas Smart RAG backend is temporarily unavailable.', release: '3.0.2', version: RAG_VERSION }));
  }
}
