import crypto from 'node:crypto';

const PUBLIC_ORIGIN = 'https://cuhalide-atlas-v3.vercel.app';
const DATA = 'https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/cuhalide-atlas-public-data-v302-public';
const RELEASE = '3.0.2';
const SITE_VERSION = '48';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sha = (v) => `'sha256-${crypto.createHash('sha256').update(v).digest('base64')}'`;

async function getRecord(kind, id) {
  const u = new URL(DATA);
  u.searchParams.set('action', kind);
  u.searchParams.set('id', id);
  const r = await fetch(u, { headers: { accept: 'application/json', 'user-agent': 'CuHalide-Atlas-Record-Page/48' }, signal: AbortSignal.timeout(30000) });
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = null; }
  if (!r.ok || !data?.item) return null;
  return data.item;
}

function layout({ title, description, canonical, body, jsonLd }) {
  const style = `:root{color-scheme:light;--ink:#102b3b;--muted:#5c7079;--navy:#09283c;--teal:#1f7e74;--bg:#f4f7f9;--line:#d6e1e6}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.65 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}main{width:min(920px,calc(100% - 32px));margin:56px auto}.brand{font-weight:800;color:var(--navy);text-decoration:none}.eyebrow{margin:22px 0 8px;color:var(--teal);font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}h1{font:clamp(34px,5vw,54px)/1.08 Georgia,"Times New Roman",serif;color:var(--navy);margin:0 0 18px}.meta{color:var(--muted)}.card{margin-top:24px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px}.grid{display:grid;grid-template-columns:170px 1fr;gap:9px 18px}.grid dt{color:var(--muted)}.grid dd{margin:0;font-weight:650}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-block;border-radius:10px;padding:10px 14px;text-decoration:none;font-weight:800}.primary{background:var(--teal);color:#fff}.secondary{border:1px solid var(--line);background:#fff;color:var(--navy)}.fine{font-size:12px;color:var(--muted)}@media(max-width:640px){main{margin:34px auto}.grid{grid-template-columns:1fr}.grid dt{margin-top:8px}}`;
  const ld = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  const csp = `default-src 'none'; img-src 'self'; style-src ${sha(style)}; script-src ${sha(ld)}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="description" content="${esc(description)}"><meta name="cuhalide-release" content="${RELEASE}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="article"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${PUBLIC_ORIGIN}/og-image.svg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${PUBLIC_ORIGIN}/og-image.svg"><link rel="canonical" href="${esc(canonical)}"><title>${esc(title)} — CuHalide Atlas</title><style>${style}</style><script type="application/ld+json">${ld}</script></head><body><main><a class="brand" href="${PUBLIC_ORIGIN}/">CuHalide Atlas</a>${body}<p class="fine">Frozen release ${RELEASE}. Public record pages expose only the same field-whitelisted scientific information available through the query-and-view interface; primary PDF/SI/CIF and private curation evidence remain private.</p></main></body></html>`;
  return { html, csp };
}

function articlePage(x) {
  const canonical = `${PUBLIC_ORIGIN}/article/${encodeURIComponent(x.record_id)}`;
  const doi = x.doi_url || (x.doi ? `https://doi.org/${x.doi}` : '');
  const description = `${x.journal || 'Journal'} ${x.year || ''}. ${x.structure_summary || 'Curated Cu(I) halide article record.'}`.replace(/\s+/g, ' ').trim().slice(0, 280);
  const body = `<p class="eyebrow">Article record ${esc(x.record_id)}</p><h1>${esc(x.title)}</h1><p class="meta">${esc(x.authors)}${x.journal ? ` · ${esc(x.journal)}` : ''}${x.year ? ` · ${esc(x.year)}` : ''}</p><section class="card"><dl class="grid"><dt>DOI</dt><dd>${doi ? `<a href="${esc(doi)}" rel="noreferrer">${esc(x.doi)}</a>` : 'Not recorded'}</dd><dt>Halogen set</dt><dd>${esc(x.halogen || 'Unresolved')}</dd><dt>Dimensionality</dt><dd>${esc(x.dimensionality_class || 'Unresolved')}</dd><dt>Category</dt><dd>${esc(x.category || 'Unresolved')}</dd><dt>Scope</dt><dd>${esc(x.scope_status || 'Unresolved')}</dd><dt>Evidence</dt><dd>${esc(x.evidence_level || 'Unresolved')}</dd><dt>Release status</dt><dd>${esc(x.release_status || 'Unresolved')}</dd></dl><p>${esc(x.structure_summary || 'No public structural summary recorded.')}</p></section><div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#article/${esc(x.record_id)}">Open interactive record</a>${doi ? `<a class="btn secondary" href="${esc(doi)}" rel="noreferrer">Open DOI</a>` : ''}</div>`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'ScholarlyArticle', headline: x.title, name: x.title, identifier: x.doi || `CuHalide Atlas Record ${x.record_id}`, url: canonical, sameAs: doi || undefined, datePublished: x.year ? String(x.year) : undefined, isPartOf: { '@type': 'Dataset', name: 'CuHalide Atlas', version: RELEASE, url: PUBLIC_ORIGIN } };
  return layout({ title: x.title, description, canonical, body, jsonLd });
}

function structurePage(x) {
  const canonical = `${PUBLIC_ORIGIN}/structure/${encodeURIComponent(x.structure_id)}`;
  const description = `${x.formula || x.label || x.structure_id}; ${x.dimensionality || 'dimensionality unresolved'}; ${x.space_group ? `space group ${x.space_group}` : 'space group unresolved'}.`.slice(0, 280);
  const body = `<p class="eyebrow">Structure / phase record ${esc(x.structure_id)}</p><h1>${esc(x.label || x.structure_id)}</h1><p class="meta">Record ${esc(x.record_id)} · ${esc(x.article_title || '')}</p><section class="card"><dl class="grid"><dt>Formula</dt><dd>${esc(x.formula || 'Not recorded')}</dd><dt>Phase / condition</dt><dd>${esc(x.phase || 'Not recorded')}</dd><dt>Halogen</dt><dd>${esc(x.halogen || 'Unresolved')}</dd><dt>Halogen evidence</dt><dd>${esc(x.halogen_scope || 'unresolved')} · ${esc(x.halogen_confidence || 'Unresolved')}</dd><dt>Dimensionality</dt><dd>${esc(x.dimensionality || 'Unresolved')}</dd><dt>Space group</dt><dd>${esc(x.space_group || 'Unresolved')}</dd><dt>Point group</dt><dd>${esc(x.point_group || 'Unresolved')}</dd><dt>Crystal system</dt><dd>${esc(x.crystal_system || 'Unresolved')}</dd><dt>Polar</dt><dd>${esc(x.polar || 'Unresolved')}</dd><dt>SG / mapping confidence</dt><dd>${esc(x.sg_confidence || 'Unresolved')} / ${esc(x.mapping_confidence || 'Unresolved')}</dd></dl></section><div class="actions"><a class="btn primary" href="${PUBLIC_ORIGIN}/#structure/${encodeURIComponent(x.structure_id)}">Open interactive record</a>${x.doi_url ? `<a class="btn secondary" href="${esc(x.doi_url)}" rel="noreferrer">Open source DOI</a>` : ''}</div>`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Dataset', name: x.label || x.structure_id, identifier: x.structure_id, url: canonical, version: RELEASE, citation: x.doi_url || x.doi || undefined, isPartOf: { '@type': 'Dataset', name: 'CuHalide Atlas', version: RELEASE, url: PUBLIC_ORIGIN } };
  return layout({ title: x.label || x.structure_id, description, canonical, body, jsonLd });
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }
  const u = new URL(req.url, PUBLIC_ORIGIN);
  const kind = String(u.searchParams.get('kind') || '').toLowerCase();
  const id = String(u.searchParams.get('id') || '');
  const valid = kind === 'article' ? /^\d+$/.test(id) : kind === 'structure' ? /^CUH-[A-Za-z0-9_-]+$/i.test(id) : false;
  if (!valid) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Invalid record identifier');
  }
  try {
    const item = await getRecord(kind, id);
    if (!item) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Record not found');
    }
    const page = kind === 'article' ? articlePage(item) : structurePage(item);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    res.setHeader('Content-Security-Policy', page.csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-CuHalide-Release', RELEASE);
    res.setHeader('X-CuHalide-Site-Version', SITE_VERSION);
    if (req.method === 'HEAD') return res.end();
    return res.end(page.html);
  } catch (error) {
    console.error('[record-page]', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end('Record page temporarily unavailable');
  }
}
