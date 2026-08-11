import fs from 'node:fs';
import path from 'node:path';

export default async function handler(req, res) {
  const file = path.join(process.cwd(), 'public', 'index.html');
  try {
    const html = fs.readFileSync(file, 'utf8');
    const checks = {
      exists: true,
      bytes: Buffer.byteLength(html),
      releaseMeta301: (html.match(/<meta name="cuhalide-release" content="3\.0\.1">/g) || []).length,
      siteMeta47: (html.match(/<meta name="cuhalide-site-version" content="47">/g) || []).length,
      releaseBadge301: (html.match(/<span class="ver">Release 3\.0\.1<\/span>/g) || []).length,
      currentPanelSource: html.includes('Interpretation note') && html.includes('Denominators are explicit'),
      year2026: html.includes('Display window 2006–2026'),
      stale202606: html.includes('2026.06'),
      renderHomeSource: html.includes('function renderHome(){const r=S.boot.release,o=S.boot.overview;'),
      sgGridSource: html.includes("$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12)")
    };
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify(checks));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ exists: false, error: String(error), file }));
  }
}
