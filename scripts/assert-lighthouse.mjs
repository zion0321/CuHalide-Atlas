import fs from 'node:fs';
import path from 'node:path';

const [reportDir, runCountArg] = process.argv.slice(2);
const runCount = Number(runCountArg);
if (!reportDir || !Number.isInteger(runCount) || runCount < 3 || runCount % 2 === 0) {
  throw new Error('Usage: node scripts/assert-lighthouse.mjs <report-directory> <odd-run-count>=3');
}

const thresholds = {
  mobile: { performance: 0.75, accessibility: 1.00, 'best-practices': 0.95, seo: 0.90 },
  desktop: { performance: 0.85, accessibility: 1.00, 'best-practices': 0.95, seo: 0.90 },
};

const catastrophicPerformanceFloor = {
  mobile: 0.60,
  desktop: 0.70,
};

const maxMedianLcpMs = 4000;
const maxSingleLcpMs = 6000;
const maxMedianCls = 0.10;
const maxSingleCls = 0.15;

function load(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function finite(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Missing or invalid Lighthouse value: ${label}`);
  return n;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function seoQualityExcludingIntentionalNoindex(report) {
  const refs = report?.categories?.seo?.auditRefs || [];
  let earned = 0;
  let total = 0;
  for (const ref of refs) {
    if (ref?.id === 'is-crawlable') continue;
    const weight = Number(ref?.weight || 0);
    const score = report?.audits?.[ref?.id]?.score;
    if (!(weight > 0) || score === null || score === undefined) continue;
    const finiteScore = finite(score, `seo audit ${ref.id}`);
    earned += finiteScore * weight;
    total += weight;
  }
  if (!(total > 0)) throw new Error('No scored SEO audits remain after excluding intentional prepublication crawlability.');
  return earned / total;
}

function reportMetrics(report) {
  return {
    performance: finite(report?.categories?.performance?.score, 'performance'),
    accessibility: finite(report?.categories?.accessibility?.score, 'accessibility'),
    'best-practices': finite(report?.categories?.['best-practices']?.score, 'best-practices'),
    seo: seoQualityExcludingIntentionalNoindex(report),
    rawSeo: finite(report?.categories?.seo?.score, 'raw seo'),
    crawlable: finite(report?.audits?.['is-crawlable']?.score, 'is-crawlable'),
    lcp: finite(report?.audits?.['largest-contentful-paint']?.numericValue, 'largest-contentful-paint'),
    cls: finite(report?.audits?.['cumulative-layout-shift']?.numericValue, 'cumulative-layout-shift'),
    tbt: finite(report?.audits?.['total-blocking-time']?.numericValue, 'total-blocking-time'),
    consoleErrors: finite(report?.audits?.['errors-in-console']?.score, 'errors-in-console'),
  };
}

function checkDevice(name) {
  const failures = [];
  const runs = [];

  for (let i = 1; i <= runCount; i += 1) {
    const filePath = path.join(reportDir, `${name}-${i}.json`);
    const metrics = reportMetrics(load(filePath));
    runs.push(metrics);
    console.log(`${name} run ${i}:`, JSON.stringify({
      scores: {
        performance: metrics.performance,
        accessibility: metrics.accessibility,
        'best-practices': metrics['best-practices'],
        seo_quality_excluding_intentional_noindex: metrics.seo,
        lighthouse_raw_seo: metrics.rawSeo,
      },
      prepublication_is_crawlable_score: metrics.crawlable,
      lcp_ms: Math.round(metrics.lcp),
      cls: metrics.cls,
      tbt_ms: Math.round(metrics.tbt),
      console_errors_audit: metrics.consoleErrors,
    }));

    for (const category of ['accessibility', 'best-practices', 'seo']) {
      const minimum = thresholds[name][category];
      if (metrics[category] < minimum) failures.push(`run ${i} ${category}: ${metrics[category]} < ${minimum}`);
    }
    if (metrics.crawlable !== 0) failures.push(`run ${i} prepublication is-crawlable audit: ${metrics.crawlable} != 0`);
    if (metrics.consoleErrors !== 1) failures.push(`run ${i} errors-in-console audit: ${metrics.consoleErrors} != 1`);
    if (metrics.performance < catastrophicPerformanceFloor[name]) {
      failures.push(`run ${i} performance catastrophic floor: ${metrics.performance} < ${catastrophicPerformanceFloor[name]}`);
    }
    if (metrics.lcp > maxSingleLcpMs) failures.push(`run ${i} LCP: ${Math.round(metrics.lcp)} ms > ${maxSingleLcpMs} ms`);
    if (metrics.cls > maxSingleCls) failures.push(`run ${i} CLS: ${metrics.cls} > ${maxSingleCls}`);
  }

  const aggregate = {
    performance: median(runs.map((x) => x.performance)),
    seo: median(runs.map((x) => x.seo)),
    lcp: median(runs.map((x) => x.lcp)),
    cls: median(runs.map((x) => x.cls)),
    tbt: median(runs.map((x) => x.tbt)),
  };

  if (aggregate.performance < thresholds[name].performance) {
    failures.push(`median performance: ${aggregate.performance} < ${thresholds[name].performance}`);
  }
  if (aggregate.seo < thresholds[name].seo) failures.push(`median SEO quality: ${aggregate.seo} < ${thresholds[name].seo}`);
  if (aggregate.lcp > maxMedianLcpMs) failures.push(`median LCP: ${Math.round(aggregate.lcp)} ms > ${maxMedianLcpMs} ms`);
  if (aggregate.cls > maxMedianCls) failures.push(`median CLS: ${aggregate.cls} > ${maxMedianCls}`);

  console.log(`${name} median:`, JSON.stringify({
    performance: aggregate.performance,
    seo_quality_excluding_intentional_noindex: aggregate.seo,
    lcp_ms: Math.round(aggregate.lcp),
    cls: aggregate.cls,
    tbt_ms: Math.round(aggregate.tbt),
  }));

  return failures;
}

const failures = [
  ...checkDevice('mobile').map((x) => `mobile ${x}`),
  ...checkDevice('desktop').map((x) => `desktop ${x}`),
];

if (failures.length) {
  console.error('Lighthouse production gate failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Lighthouse production gate passed using ${runCount} independent measurements per device; crawlability is intentionally blocked during prepublication and all remaining scored SEO audits stay gated.`);
