import fs from 'node:fs';

const [mobilePath, desktopPath] = process.argv.slice(2);
if (!mobilePath || !desktopPath) throw new Error('Usage: node scripts/assert-lighthouse.mjs <mobile.json> <desktop.json>');

const thresholds = {
  mobile: { performance: 0.75, accessibility: 0.95, 'best-practices': 0.95, seo: 0.90 },
  desktop: { performance: 0.85, accessibility: 0.95, 'best-practices': 0.95, seo: 0.90 },
};

function load(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function check(name, report) {
  const failures = [];
  const scores = {};
  for (const [category, minimum] of Object.entries(thresholds[name])) {
    const score = Number(report?.categories?.[category]?.score);
    scores[category] = score;
    if (!Number.isFinite(score) || score < minimum) failures.push(`${category}: ${score} < ${minimum}`);
  }
  const lcp = Number(report?.audits?.['largest-contentful-paint']?.numericValue);
  const cls = Number(report?.audits?.['cumulative-layout-shift']?.numericValue);
  if (Number.isFinite(cls) && cls > 0.10) failures.push(`CLS: ${cls} > 0.10`);
  if (Number.isFinite(lcp) && lcp > 4000) failures.push(`LCP: ${Math.round(lcp)} ms > 4000 ms`);
  console.log(`${name}:`, JSON.stringify({ scores, lcp_ms: Number.isFinite(lcp) ? Math.round(lcp) : null, cls: Number.isFinite(cls) ? cls : null }));
  return failures;
}

const failures = [
  ...check('mobile', load(mobilePath)).map(x => `mobile ${x}`),
  ...check('desktop', load(desktopPath)).map(x => `desktop ${x}`),
];

if (failures.length) {
  console.error('Lighthouse production gate failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Lighthouse production gate passed.');
