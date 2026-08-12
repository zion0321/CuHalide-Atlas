import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import siteHandler from '../api/site.js';
import dataHandler from '../api/data.js';
import publicDataHandler from '../api/public-data.js';
import agentHandler from '../api/agent.js';
import exportHandler from '../api/export.js';
import metaHandler from '../api/meta.js';
import recordHandler from '../api/record.js';
import sitemapHandler from '../api/sitemap.js';

const HOST = process.env.CUHALIDE_LOCAL_HOST || '127.0.0.1';
const PORT = Number(process.env.CUHALIDE_LOCAL_PORT || 4173);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const STATIC_FILES = new Map([
  ['/og-image.svg', { file: path.join(PUBLIC_DIR, 'og-image.svg'), type: 'image/svg+xml; charset=utf-8' }],
]);

function applyPlatformHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
}

function rewritten(req, value) {
  req.url = value;
  return req;
}

async function dispatch(req, res) {
  applyPlatformHeaders(res);
  const incoming = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = incoming.pathname;

  if (STATIC_FILES.has(pathname)) {
    const asset = STATIC_FILES.get(pathname);
    try {
      const body = fs.readFileSync(asset.file);
      res.statusCode = 200;
      res.setHeader('Content-Type', asset.type);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      if (req.method === 'HEAD') return res.end();
      return res.end(body);
    } catch {
      res.statusCode = 404;
      return res.end('Not Found');
    }
  }

  if (pathname === '/' || pathname === '/index.html' || pathname === '/api/site') {
    res.setHeader('X-CuHalide-Middleware', 'release-3.0.2-v48');
    return siteHandler(rewritten(req, incoming.search ? `/api/site${incoming.search}` : '/api/site'), res);
  }

  if (pathname === '/api/data') return dataHandler(req, res);
  if (pathname === '/api/public-data') return publicDataHandler(req, res);
  if (pathname === '/api/agent') return agentHandler(req, res);
  if (pathname === '/api/export') return exportHandler(req, res);
  if (pathname === '/api/meta') return metaHandler(req, res);
  if (pathname === '/api/sitemap') return sitemapHandler(req, res);

  if (pathname === '/robots.txt') return metaHandler(rewritten(req, '/api/meta?asset=robots'), res);
  if (pathname === '/release-manifest.json') return metaHandler(rewritten(req, '/api/meta?asset=manifest'), res);
  if (pathname === '/citation.txt' || pathname === '/citation.cff' || pathname === '/CITATION.cff') {
    return metaHandler(rewritten(req, '/api/meta?asset=citation'), res);
  }
  if (pathname === '/health.json') return metaHandler(rewritten(req, '/api/meta?asset=health'), res);
  if (pathname === '/sitemap.xml') return sitemapHandler(rewritten(req, '/api/sitemap'), res);

  const article = pathname.match(/^\/article\/(\d+)$/);
  if (article) {
    return recordHandler(rewritten(req, `/api/record?kind=article&id=${encodeURIComponent(article[1])}`), res);
  }

  const structure = pathname.match(/^\/structure\/(CUH-[A-Za-z0-9_-]+)$/i);
  if (structure) {
    return recordHandler(rewritten(req, `/api/record?kind=structure&id=${encodeURIComponent(structure[1])}`), res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.end('Not Found');
}

const server = http.createServer((req, res) => {
  Promise.resolve(dispatch(req, res)).catch((error) => {
    console.error('[local-candidate-server]', error);
    if (!res.headersSent) {
      applyPlatformHeaders(res);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    if (!res.writableEnded) res.end('Candidate server error');
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[local-candidate-server] listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`[local-candidate-server] ${signal}; shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
