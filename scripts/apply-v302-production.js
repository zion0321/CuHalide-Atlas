const fs = require('fs');
const crypto = require('crypto');

function replaceOne(text, from, to, label) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: expected 1 occurrence, found ${n}`);
  return text.replace(from, to);
}
function replaceRegex(text, re, to, label) {
  const matches = text.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || [];
  if (matches.length !== 1) throw new Error(`${label}: expected 1 match, found ${matches.length}`);
  return text.replace(re, to);
}
function replaceAllRequired(text, from, to, label) {
  const n = text.split(from).length - 1;
  if (n < 1) throw new Error(`${label}: no occurrence found`);
  return text.split(from).join(to);
}

const indexPath = 'public/index.html';
let html = fs.readFileSync(indexPath, 'utf8');
html = replaceOne(html, '<meta name="cuhalide-release" content="3.0.1">', '<meta name="cuhalide-release" content="3.0.2">', 'release meta');
html = replaceOne(html, '<meta name="cuhalide-site-version" content="47">', '<meta name="cuhalide-site-version" content="48">', 'site version meta');
if (/<!-- CUHALIDE_SITE_V\d+_[^>]+ -->/.test(html)) html = html.replace(/<!-- CUHALIDE_SITE_V\d+_[^>]+ -->/, '<!-- CUHALIDE_SITE_V48_CURRENT_CURATED -->');
else html = html.replace('</body>', '<!-- CUHALIDE_SITE_V48_CURRENT_CURATED -->\n</body>');
html = replaceOne(html, '<span class="ver">Release 3.0.1</span>', '<span class="ver">Release 3.0.2</span>', 'release badge');
html = replaceRegex(html, /<p class="release-note">Frozen literature cutoff:[\s\S]*?<\/p>/,
  '<p class="release-note">Frozen literature cutoff: June 2026. Release 3.0.2 is a scientific hotfix over 3.0.1 that physically incorporates the four confirmed Record 13 dimensionality corrections. It adds no new literature and changes no frozen denominator. Rolling Current Curated additions are tracked separately.</p>', 'release note');
html = replaceOne(html,
  '<article class="panel"><p class="eyebrow">Interpretation note</p><h2>Denominators are explicit</h2><p class="fine">Article, structure, resolved-space-group and verified one-to-one subsets answer different questions. The interface labels each denominator rather than presenting them as interchangeable corpus sizes.</p></article>',
  '<article class="panel"><p class="eyebrow">Rolling curation</p><h2>Current Curated</h2><p class="fine" id="currentCuratedText">Loading current curated status…</p><p class="fine">New literature enters this layer only after primary article/SI/CIF review and QC. Frozen releases remain immutable.</p></article>',
  'Current Curated dashboard');
html = replaceOne(html,
  '<p>A read-only view of recently discovered publications that may fall within scope. Candidate metadata remains outside the frozen release until primary-source verification is complete.</p>',
  '<p>A read-only discovery queue for newly indexed publications. Candidates remain outside both the Frozen Release and Current Curated until primary article/SI/CIF evidence is reviewed and quality control passes.</p>',
  'Literature Watch intro');
html = replaceRegex(html, /<p class="fine">Public display is limited to title, year, journal, DOI and review status\.[\s\S]*?<\/div>/,
  '<p class="fine">Workflow: discovery → DOI deduplication → scope triage → primary article/SI/CIF acquisition → evidence extraction → QC → Current Curated → later formal release. Candidate abstracts, scores, reason codes and internal adjudication remain private.</p><div class="notice">Candidate metadata is a prompt for primary-source review, not scientific evidence for a frozen or live-curated claim.</div>',
  'Literature Watch workflow');
html = replaceRegex(html, /<details><summary>Smart RAG runtime boundary<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
  '<details><summary>Smart RAG runtime boundary</summary><p class="fine">Release 3.0.2 uses Smart RAG 9.12.0 with deterministic scientific guards, evidence-grain-safe retrieval and source-constrained claim validation. Fresh rag-benchmark-v1.6 passed 70/70 on release 3.0.2; Live Monitor candidate metadata remains isolated from model-supported frozen scientific claims.</p></details>',
  'Smart RAG methods');
html = replaceRegex(html, /<details><summary>Known release erratum<\/summary><p class="fine">[\s\S]*?<\/p><\/details>/,
  '<details><summary>Record 13 correction history</summary><p class="fine">Release 3.0.2 physically incorporates the four confirmed Record 13 structure-dimensionality corrections. Historical release 3.0.1 remains immutable and retains the errata record for auditability; the correction changes no article, structure, crystallographic or polar denominator.</p></details>',
  'Record 13 methods');
html = replaceOne(html, 'CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'CuHalide Atlas. Release 3.0.2 (11 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'citation text');
html = replaceRegex(html, /<p class="fine">Frozen literature cutoff: June 2026\. Include an access date[\s\S]*?<\/p>/,
  '<p class="fine">Frozen literature cutoff: June 2026. Release 3.0.2 incorporates the confirmed Record 13 dimensionality corrections; the 3.0.1 errata remain available as historical audit metadata. Include an access date if required by the target journal.</p>',
  'citation note');
html = replaceOne(html, 'Evidence-grounded Cu(I) halide knowledge portal · Release 3.0.1 · cutoff 2026-06', 'Evidence-grounded Cu(I) halide knowledge portal · Release 3.0.2 · cutoff 2026-06', 'footer release');
html = replaceOne(html, 'function renderHome(){const r=S.boot.release,o=S.boot.overview;', 'function renderHome(){const r=S.boot.release,o=S.boot.overview,cc=S.boot.current_curated||{};', 'renderHome binding');
html = replaceOne(html, "['Strict polar',r.strict_polar_rows],['Literature cutoff','2026-06']]", "['Strict polar',r.strict_polar_rows],['Literature cutoff','2026-06'],['Current curated through',cc.current_curated_through||'2026-08-11']]", 'release card current curated');
html = replaceOne(html,
  "$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12).map(x=>`<div class=\"sg\"><strong>${esc(x.space_group)}</strong><small>${x.structure_count} structures · ${x.article_count} articles</small></div>`).join('')}",
  "$('sgGrid').innerHTML=(o.space_groups||[]).slice(0,12).map(x=>`<div class=\"sg\"><strong>${esc(x.space_group)}</strong><small>${x.structure_count} structures · ${x.article_count} articles</small></div>`).join('');const cct=$('currentCuratedText');if(cct){const d=cc.current_curated_through||'not advanced';const rev=Number(cc.live_revision||0);cct.textContent=`Current Curated through ${d} · live revision ${rev}. Frozen base ${cc.base_release||r.version||'3.0.2'}.`}}",
  'renderHome current curated text');
if (html.includes('2026.06')) throw new Error('Stale 2026.06 display remains');
if (!html.includes('Display window 2006–2026')) throw new Error('2026 chart display contract missing');
if (!html.includes('CUHALIDE_SITE_V48_CURRENT_CURATED')) throw new Error('v48 marker missing');
fs.writeFileSync(indexPath, html);

let tests = fs.readFileSync('tests/production-browser.spec.js', 'utf8');
tests = replaceAllRequired(tests, "expect(health.release).toBe('3.0.1');", "expect(health.release).toBe('3.0.2');", 'health release test');
tests = replaceAllRequired(tests, "expect(health.site_version).toBe('47');", "expect(health.site_version).toBe('48');", 'site version test');
tests = replaceAllRequired(tests, "expect(health.meta_version).toBe('47.6');", "expect(health.meta_version).toBe('48.0');", 'meta version test');
tests = replaceAllRequired(tests, "expect(health.public_data.version).toBe('2.6.0');", "expect(health.public_data.version).toBe('2.7.0');", 'data version test');
tests = replaceAllRequired(tests, "expect(manifest.release).toBe('3.0.1');", "expect(manifest.release).toBe('3.0.2');", 'manifest release test');
tests = replaceAllRequired(tests, 'expect(record13.known_erratum).toBe(true);', 'expect(record13.known_erratum).toBe(false);', 'Record13 erratum test');
tests = replaceOne(tests,
  "    await expect(page.locator('#modalBody')).toContainText('Known release erratum');\n    await expect(page.locator('#modalBody')).toContainText('effective dimensionality = Unresolved');",
  "    await expect(page.locator('#modalBody')).not.toContainText('Known release erratum');\n    await expect(page.locator('#modalBody')).toContainText('Unresolved');",
  'Record13 browser modal');
tests = replaceOne(tests,
  '    expect(manifest.structure_halogen_runtime.source_conflict_rows).toBe(4);',
  "    expect(manifest.structure_halogen_runtime.source_conflict_rows).toBe(4);\n\n    const currentResponse = await request.get('/api/public-data?action=current-curated');\n    expect(currentResponse.status()).toBe(200);\n    const current = await json(currentResponse);\n    expect(current.current_curated.base_release).toBe('3.0.2');\n    expect(current.current_curated.live_revision).toBe(0);\n\n    const ragResponse = await request.get('/api/agent');\n    expect(ragResponse.status()).toBe(200);\n    const rag = await json(ragResponse);\n    expect(rag.release).toBe('3.0.2');\n    expect(rag.version).toBe('9.12.0');",
  'v302 HTTP contracts');
tests = replaceOne(tests,
  "    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });",
  "    await page.goto('/#home', { waitUntil: 'domcontentloaded' });\n    await expect(page.locator('#currentCuratedText')).toContainText('Current Curated through');\n    await expect(page.locator('#yearChart')).toContainText('2026');\n\n    await page.goto('/#articles', { waitUntil: 'domcontentloaded' });",
  'Current Curated UI browser test');
fs.writeFileSync('tests/production-browser.spec.js', tests);

let qa = fs.readFileSync('.github/workflows/production-browser-qa.yml', 'utf8');
const checkout = "      - name: Checkout\n        uses: actions/checkout@v4\n";
if (!qa.includes('Wait for release 3.0.2 production')) {
  qa = replaceOne(qa, checkout, checkout + `\n      - name: Wait for release 3.0.2 production\n        shell: bash\n        run: |\n          set -euo pipefail\n          for i in $(seq 1 90); do\n            body=\"$(curl --fail --silent --show-error --location \"$CUHALIDE_BASE_URL/\" || true)\"\n            health=\"$(curl --fail --silent --show-error --location \"$CUHALIDE_BASE_URL/health.json\" || true)\"\n            if [[ \"$body\" == *\"CUHALIDE_SITE_V48_CURRENT_CURATED\"* && \"$body\" == *\"content=\\\"3.0.2\\\"\"* && \"$health\" == *'\"status\":\"PASS\"'* && \"$health\" == *'\"release\":\"3.0.2\"'* ]]; then\n              echo 'Release 3.0.2 / site v48 is live and healthy.'\n              exit 0\n            fi\n            sleep 5\n          done\n          echo 'Timed out waiting for release 3.0.2 production.' >&2\n          exit 1\n`, 'QA deployment wait');
}
fs.writeFileSync('.github/workflows/production-browser-qa.yml', qa);

let readme = fs.readFileSync('README.md', 'utf8');
readme = replaceOne(readme, '- Public release: **3.0.1** — 10 August 2026', '- Public release: **3.0.2** — 11 August 2026', 'README release');
readme = replaceOne(readme, '- Scientific parent: **3.0.0**', '- Scientific parent: **3.0.1** · lineage root **3.0.0**', 'README parent');
readme = replaceOne(readme, '- Public site / data / Smart RAG / meta: **v47 / 2.6.0 / 9.10.0 / 47.6**', '- Public site / data / Smart RAG / meta: **v48 / 2.7.0 / 9.12.0 / 48.0**', 'README versions');
readme = replaceOne(readme, '- Known errata: [`ERRATA.md`](ERRATA.md)', '- Correction history: [`ERRATA.md`](ERRATA.md)', 'README errata label');
readme = replaceOne(readme, 'Release 3.0.1 is a bibliographic-only patch over scientific parent 3.0.0 and does not change the frozen scientific denominators.', 'Release 3.0.2 is a scientific hotfix over 3.0.1. It physically incorporates four confirmed Record 13 structure-dimensionality corrections, adds no new literature, and changes none of the frozen scientific denominators.', 'README description');
readme = replaceOne(readme, 'Public data 2.6.0 uses release-specific, field-whitelisted projections derived from the immutable 3.0.1 snapshot:', 'Public data 2.7.0 uses release-specific, field-whitelisted projections derived from the immutable 3.0.2 snapshot:', 'README data architecture');
readme = replaceAllRequired(readme, '`cuhalide_atlas_public_articles_v301`', '`cuhalide_atlas_public_articles_v302`', 'README article projection');
readme = replaceAllRequired(readme, '`cuhalide_atlas_public_structures_v301`', '`cuhalide_atlas_public_structures_v302`', 'README structure projection');
readme = replaceOne(readme, 'This runtime/index hardening does not silently rewrite the immutable 3.0.1 scientific archive.', 'Release 3.0.2 stores the corrected Record 13 structure documents physically; the historical 3.0.1 archive remains immutable.', 'README RAG note');
readme = replaceOne(readme, '## Record 13 erratum', '## Record 13 correction history', 'README record13 heading');
readme = replaceOne(readme, 'The erratum changes none of the frozen denominators above. Formal corrected scientific snapshot handling is reserved for 3.0.2.', 'Release 3.0.2 physically incorporates these four corrections. Historical 3.0.1 remains immutable with its errata metadata preserved for auditability. No frozen denominator changes.', 'README correction status');
readme = replaceRegex(readme, /### Final post-reindex validation[\s\S]*?historical \[`docs\/RAG_BENCHMARK_V14_2026-08-11\.md`\]\(docs\/RAG_BENCHMARK_V14_2026-08-11\.md\)\./,
`### Release-3.0.2 validation\n\nFresh **rag-benchmark-v1.6** passed **70/70** on release 3.0.2: exact 25/25, retrieval 25/25 and reasoning/scientific-boundary 20/20. Run ID: \`04bd93ec-cc3a-424b-9d8d-a1b08cec58ff\`. Paid overage was not authorized. The 3.0.2 RAG index is 1,224/1,224 embedded documents.\n\nThe v1.6 case set preserves v1.5 history. Literal release references were rebased to 3.0.2; frozen scientific fact/count targets did not change. RS08 intentionally uses deterministic candidate/frozen separation because Live Monitor metadata is not permitted to become model-supported frozen scientific evidence.\n\nSee [\`docs/RAG_BENCHMARK_V16_2026-08-11.md\`](docs/RAG_BENCHMARK_V16_2026-08-11.md).`, 'README benchmark');
readme = replaceOne(readme, 'A repository-retained Playwright/Chromium production gate has passed against the live v47 portal across desktop, tablet and mobile viewports.', 'A repository-retained, read-only Playwright/Chromium production gate validates the live v48 portal across desktop, tablet and mobile viewports.', 'README browser QA');
readme = replaceOne(readme, '> CuHalide Atlas. Release 3.0.1 (10 August 2026). https://cuhalide-atlas-v3.vercel.app/', '> CuHalide Atlas. Release 3.0.2 (11 August 2026). https://cuhalide-atlas-v3.vercel.app/', 'README citation');
if (!readme.includes('## Frozen Release, Current Curated and Literature Watch')) {
  readme = readme.replace('## Smart RAG', `## Frozen Release, Current Curated and Literature Watch\n\nThe maintenance model separates three layers: **Frozen Release** is immutable and citable; **Current Curated** contains primary-evidence-reviewed additions after QC; **Literature Watch** is metadata-only discovery. Candidate discovery never authorizes scientific inclusion.\n\nThe private curation state machine is \`DISCOVERED → DEDUPED → TRIAGED → NOTIFIED → PRIMARY_EVIDENCE_RECEIVED → EXTRACTED → QC_PASSED → LIVE_CURATED → FORMAL_RELEASE\`, with explicit rejected/blocked states. Main article/SI/CIF evidence is required as appropriate before promotion to Current Curated.\n\n## Smart RAG`);
}
fs.writeFileSync('README.md', readme);

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
if (!changelog.includes('## 3.0.2 — 2026-08-11')) {
  changelog = changelog.replace('# Changelog\n\n', `# Changelog\n\n## 3.0.2 — 2026-08-11\n\nScientific hotfix over 3.0.1. The immutable 3.0.1 archive is retained. Release 3.0.2 physically corrects the four confirmed Record 13 \`Structural Dimensionality\` values (CUH-013-S01 → Unresolved; S02/S03/S04 → 0D), changes no scientific denominator, and adds no new literature. Production advances to site v48 / public-data 2.7.0 / Smart RAG 9.12.0 / meta 48.0. The 3.0.2 RAG index is 1,224/1,224 embedded documents and rag-benchmark-v1.6 passed 70/70 (run \`04bd93ec-cc3a-424b-9d8d-a1b08cec58ff\`). A private Current Curated workflow and evidence-gated curation queue support rolling post-release updates.\n\n`);
}
fs.writeFileSync('CHANGELOG.md', changelog);

const statusDoc = `# CuHalide Atlas production status — v48\n\nDate: 2026-08-11  \nFrozen scientific release: **3.0.2**  \nFrozen literature cutoff: **2026-06**\n\n## Production matrix\n\n| Component | Version |\n|---|---:|\n| Public site | 48 |\n| Public data | 2.7.0 |\n| Public Smart RAG | 9.12.0 |\n| Public metadata / health | 48.0 |\n| Release-3.0.2 internal RAG gateway | 9.12.0-public-internal |\n| Release-3.0.2 core adapter | 9.12.0-v302-core-adapter-internal |\n| Scientific-context health | rag-contract-health-v1.1.0 |\n| Bounded claims | qwen-claims-v9-1.3.3 |\n\n## Scientific hotfix\n\n3.0.2 physically incorporates the four confirmed Record 13 dimensionality corrections while preserving the immutable 3.0.1 archive. It adds no literature and changes no article, structure, space-group, verified, polar or strict-polar denominator.\n\n## Rolling curation\n\nFrozen Release, Current Curated and Literature Watch are separated. Newly discovered literature requires DOI deduplication, scope triage, primary article/SI/CIF evidence as appropriate, evidence extraction, structure-level mapping, QC, RAG update and live regression before Current Curated promotion. Literature Watch candidates remain metadata-only until that process is complete.\n\n## RAG gate\n\nFresh \`rag-benchmark-v1.6\` run \`04bd93ec-cc3a-424b-9d8d-a1b08cec58ff\` passed **70/70**: exact 25/25, retrieval 25/25, reasoning/scientific-boundary 20/20. The 3.0.2 RAG index contains 1,224/1,224 embeddings.\n`;
fs.writeFileSync('docs/PRODUCTION_STATUS_V48_2026-08-11.md', statusDoc);

const sha = s => `'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`;
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => sha(m[1]));
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !/\bsrc\s*=/i.test(m[1] || '')).map(m => sha(m[2]));
if (styles.length !== 1 || scripts.length < 1) throw new Error(`Unexpected CSP sources: styles=${styles.length}, scripts=${scripts.length}`);
const vercelPath = 'vercel.json';
const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
let cspRules = 0;
for (const rule of config.headers || []) {
  if (!['/', '/index.html'].includes(rule.source)) continue;
  const h = (rule.headers || []).find(x => x.key === 'Content-Security-Policy');
  if (!h) throw new Error(`Missing CSP for ${rule.source}`);
  h.value = h.value.replace(/style-src-elem [^;]+;/, `style-src-elem 'self' ${styles.join(' ')};`).replace(/script-src [^;]+;/, `script-src 'self' ${scripts.join(' ')};`);
  cspRules++;
}
if (cspRules !== 2) throw new Error(`Expected 2 CSP rules, found ${cspRules}`);
fs.writeFileSync(vercelPath, JSON.stringify(config, null, 2) + '\n');
console.log(JSON.stringify({release:'3.0.2',site:48,styles,scripts}, null, 2));
