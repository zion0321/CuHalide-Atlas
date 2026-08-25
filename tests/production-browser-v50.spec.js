import { test, expect } from '@playwright/test';

const BASE = process.env.CUHALIDE_BASE_URL || 'http://127.0.0.1:4173';
const API_ONLY_PROJECT = 'desktop-chromium';

test.describe.configure({ mode: 'serial' });

async function getStructure(request, id) {
  const response = await request.get(`${BASE}/api/public-data?action=structure&id=${encodeURIComponent(id)}`);
  expect(response.status()).toBe(200);
  return (await response.json()).item;
}

async function askAgent(request, content) {
  const response = await request.post(`${BASE}/api/agent`, {
    data: { messages: [{ role: 'user', content }] },
    timeout: 90_000,
  });
  expect(response.status()).toBe(200);
  return response.json();
}

function skipRepeatedApiViewport(testInfo, reason) {
  test.skip(testInfo.project.name !== API_ONLY_PROJECT, reason);
}

test('pre-merge production backend rev.7 is ready', async ({ request }) => {
  const r = await request.get(`${BASE}/health.json`);
  expect(r.status()).toBe(200);
  const x = await r.json();
  expect(x.ok).toBe(true);
  expect(x.publication_state).toBe('prepublication-review');
  expect(x.current_curated.live_revision).toBe(7);
  expect(x.current_curated.counts).toMatchObject({
    structure_phase_rows: 946,
    core_included_structure_rows: 886,
    resolved_space_group_rows: 710,
    verified_space_group_rows: 684,
    verified_polar_rows: 97,
    strict_polar_rows: 87,
    strict_polar_articles: 54,
    rag_documents: 1329,
    rag_embedded: 1329,
  });
  expect(x.photophysics).toMatchObject({
    ok: true,
    version: '1.3.2',
    publication_policy: 'pass_a_curated_or_two_pass_verified',
    checks: {
      invalid_published_pass_a_gate: 0,
      ineligible_measurement_projection_leaks: 0,
      raw_primary_files_exposed: false,
      raw_evidence_locators_exposed: false,
      two_pass_status_preserved: true,
      conflicts_fail_closed: true,
    },
  });
});

test('v50 living portal exposes Current Curated rev.7', async ({ page, request }) => {
  const source = await request.get(`${BASE}/api/site`);
  expect(source.status()).toBe(200);
  const html = await source.text();
  expect(html).toContain('CUHALIDE_SITE_V50_CURRENT_CURATED_R7');
  expect(html).toContain('Current Curated rev.7');
  expect(html).toContain('Curated literature · n=369');
  expect(html).toContain('Core-Included · n=886');
  expect(html).toContain('All structure / phase rows · n=946');
  expect(html).toContain('Resolved structure rows · n = 710');

  const r = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  expect(r?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('19 Aug 2026');
  await expect(page.locator('body')).toContainText('946');
  await expect(page.locator('body')).toContainText('886');
});

test('runtime health is exact final rev.7 contract', async ({ request }) => {
  const r = await request.get(`${BASE}/health.json`);
  expect(r.status()).toBe(200);
  const x = await r.json();
  expect(x).toMatchObject({ ok: true, status: 'PASS', site_readiness: 'PASS', meta_version: '50.5', gateway_meta_version: '50.5', publication_state: 'prepublication-review' });
  expect(x.current_curated.live_revision).toBe(7);
  expect(x.current_curated.current_curated_through).toBe('2026-08-19');
  expect(x.current_curated.counts).toMatchObject({
    article_audit_records: 383,
    chemically_included_articles: 372,
    canonical_verified_articles: 369,
    structure_phase_rows: 946,
    core_included_structure_rows: 886,
    resolved_space_group_rows: 710,
    verified_space_group_rows: 684,
    verified_polar_rows: 97,
    strict_polar_rows: 87,
    strict_polar_articles: 54,
    rag_documents: 1329,
    rag_embedded: 1329,
    taxonomy_rows: 946,
  });
  expect(x.motif_atlas).toMatchObject({
    taxonomy_rows: 946,
    resolved: 628,
    unresolved: 318,
    unresolved_legacy_category_rows: 35,
  });
  expect(x.checks).toMatchObject({
    frozen_release_contract: true,
    current_curated_contract: true,
    motif_taxonomy_contract: true,
    photophysics_contract: true,
    photophysics_staged_publication: true,
    photophysics_private_evidence_guard: true,
    rag_embeddings_complete: true,
    local_motif_global_dimension_separation: true,
  });
  expect(x.checks).not.toHaveProperty('photophysics_two_pass_gate');
});

test('manifest sitemap and Motif Atlas agree with final rev.7', async ({ request, page }) => {
  const m = await request.get(`${BASE}/release-manifest.json`);
  expect(m.status()).toBe(200);
  const j = await m.json();
  expect(j.publication_state).toBe('prepublication-review');
  expect(j.current_curated).toMatchObject({
    revision: 7,
    curated_through: '2026-08-19',
    structure_phase_rows: 946,
    core_included_structure_rows: 886,
    resolved_space_group_rows: 710,
    verified_space_group_rows: 684,
    strict_polar_rows: 87,
    strict_polar_articles: 54,
    rag_documents: 1329,
    motif_resolved_rows: 628,
    motif_unresolved_rows: 318,
  });
  expect(j.runtime).toMatchObject({
    meta_version: '50.5',
    public_data_version: '2.16.0',
    photophysics_contract_version: '1.3.2',
    smart_rag_version: '9.19.0',
    research_assistant_version: '10.4.1',
  });
  expect(j.photophysics).toMatchObject({
    public_projection: 'pass-a-curated-or-two-pass-verified',
    verification_stage_explicit: true,
    two_pass_identity_preserved: true,
    measurement_conflicts_fail_closed: true,
    raw_primary_files: false,
    raw_evidence_locators: false,
    analysis_eligibility_explicit: true,
  });
  expect(j.frozen_release).toMatchObject({ version: '3.0.2', structure_phase_rows: 878, immutable: true });

  const s = await request.get(`${BASE}/sitemap.xml`);
  expect(s.status()).toBe(200);
  expect(s.headers()['x-cuhalide-sitemap-urls']).toBe('2');
  const xml = await s.text();
  expect((xml.match(/<url>/g) || []).length).toBe(2);
  expect(xml).toContain('CuHalide Atlas prepublication-review sitemap');
  expect(xml).toContain('https://cuhalide-atlas-v3.vercel.app/motifs');
  expect(xml).not.toContain('/article/');
  expect(xml).not.toContain('/structure/');

  const mr = await page.goto(`${BASE}/motifs`, { waitUntil: 'domcontentloaded' });
  expect(mr?.status()).toBe(200);
  await expect(page.locator('body')).toContainText('628');
  await expect(page.locator('body')).toContainText('318');
});

test('Research Assistant reports 10.4 / 9.19 and complete rev.7 RAG', async ({ request }) => {
  const r = await request.get(`${BASE}/api/agent`);
  expect(r.status()).toBe(200);
  const x = await r.json();
  expect(x.assistant_version).toBe('10.4.1');
  expect(x.version).toBe('9.19.0');
  expect(x.current_curated).toMatchObject({
    layer: 'current-curated-r7',
    live_revision: 7,
    curated_through: '2026-08-19',
    documents: 1329,
    embedded: 1329,
  });
});

test('final rev.7 structure-truth corrections are exposed at structure grain', async ({ request }, testInfo) => {
  skipRepeatedApiViewport(testInfo, 'Structure-grain API contract is viewport invariant; run once on desktop.');

  const r6a = await getStructure(request, 'CUH-006-S01');
  expect(r6a).toMatchObject({ dimensionality: '0D', space_group: 'P-1' });
  expect(r6a.motif_details?.formula).toBe('Cu2I4');
  const r6b = await getStructure(request, 'CUH-006-S02');
  expect(r6b).toMatchObject({ dimensionality: '0D', space_group: 'P2/c' });
  expect(r6b.motif_details?.formula).toBe('Cu2I4');

  const r60a = await getStructure(request, 'CUH-060-S01');
  expect(r60a).toMatchObject({ dimensionality: '0D', ccdc_cif: '2870870' });
  expect(r60a.motif_details?.formula).toBe('Cu3Br7');
  const r60c = await getStructure(request, 'CUH-060-S03');
  expect(r60c).toMatchObject({ dimensionality: '1D', ccdc_cif: '2870868' });
  expect(r60c.motif_details?.formula).toBe('Cu2Br4');

  const r91 = await getStructure(request, 'CUH-091-S02');
  expect(r91).toMatchObject({
    dimensionality: '1D',
    space_group: 'P21/n',
    ccdc_cif: '2350403',
    formula: 'C36 H36 Cu3 I6 N3',
  });
  expect(r91.motif_details?.formula).toBe('Cu3I6');

  const r104d = await getStructure(request, 'CUH-104-S04');
  expect(r104d.dimensionality).toBe('1D');
  expect(r104d.motif_details?.formula).toBe('Cu6I8');
  const r104e = await getStructure(request, 'CUH-104-S05');
  expect(r104e.dimensionality).toBe('2D');
  expect(r104e.motif_details?.formula).toBe('Cu4I6');

  const cl = await getStructure(request, 'CUH-128-S01');
  expect(cl).toMatchObject({ dimensionality: '0D', space_group: 'Pna21', polar: 'Yes' });
  expect(cl.motif_details?.formula).toBe('CuCl4');
  const br = await getStructure(request, 'CUH-128-S02');
  expect(br).toMatchObject({ dimensionality: '0D', space_group: 'P31c', polar: 'Yes' });
  expect(br.motif_details?.formula).toContain('Cu2Br7');

  const aio = await getStructure(request, 'CUH-154-S02');
  expect(aio.dimensionality).toBe('0D');
  expect(aio.motif_details?.formula).toBe('Cu3I5');
  const aio6 = await getStructure(request, 'CUH-154-S09');
  expect(aio6.dimensionality).toBe('0D');
  expect(aio6.motif_details?.formula).toBe('Cu6I8');

  const mixed = await getStructure(request, 'CUH-165-S02');
  expect(mixed.dimensionality).toBe('0D');
  expect(mixed.motif_details?.formula).toBe('Unresolved');

  const r170a = await getStructure(request, 'CUH-170-S01');
  expect(r170a).toMatchObject({ label: '[CuBr(L2)]n', dimensionality: '1D', space_group: 'P-1' });
  expect(r170a.motif_details?.formula).toBe('CuBr');
  const r170b = await getStructure(request, 'CUH-170-S02');
  expect(r170b).toMatchObject({ label: '[CuBr(L1)]n', dimensionality: '2D', space_group: 'P21/c' });
  expect(r170b.motif_details?.formula).toBe('CuBr');

  const r172a = await getStructure(request, 'CUH-172-S01');
  expect(r172a.dimensionality).toBe('1D');
  const r172e = await getStructure(request, 'CUH-172-S05');
  expect(r172e.dimensionality).toBe('2D');
  const r172g = await getStructure(request, 'CUH-172-S07');
  expect(r172g.dimensionality).toBe('3D');
  expect(r172g.motif_details?.formula).toBe('Unresolved');

  const hmta = await getStructure(request, 'CUH-185-S04');
  expect(hmta.dimensionality).toBe('0D');
  expect(hmta.motif_details?.formula).toBe('Cu2Br2');
  for (const id of ['CUH-185-S06', 'CUH-185-S07']) {
    const x = await getStructure(request, id);
    expect(x.dimensionality).toBe('1D');
    expect(x.motif_details?.formula).toBe('Cu2Br2');
  }

  for (const id of ['CUH-246-S01', 'CUH-246-S02']) {
    const x = await getStructure(request, id);
    expect(x.dimensionality).toBe('2D');
    expect(x.space_group).toBe('Aba2');
  }
  for (const id of ['CUH-246-S03', 'CUH-246-S04']) {
    const x = await getStructure(request, id);
    expect(x.dimensionality).toBe('0D');
    expect(x.motif_details?.formula).toBe('Cu4I8');
  }
  const chain = await getStructure(request, 'CUH-246-S05');
  expect(chain.dimensionality).toBe('1D');
  expect(chain.motif_details?.formula).toBe('Cu2I4');

  const pzacn = await getStructure(request, 'CUH-328-S01');
  expect(pzacn).toMatchObject({
    label: 'PZ-ACN',
    formula: 'C4H12Cu2I4N2',
    dimensionality: '1D',
    ccdc_cif: '2444174',
  });
  expect(pzacn.motif_details?.formula).toBe('Cu2I4');
  const pzhi = await getStructure(request, 'CUH-328-S02');
  expect(pzhi).toMatchObject({
    label: 'PZ-HI',
    formula: 'C8H26Cu2I6N4O',
    dimensionality: '0D',
    ccdc_cif: '2402042',
  });
  expect(pzhi.motif_details?.formula).toBe('Cu2I6');
});

test('local motif versus global dimensionality boundaries remain live', async ({ request }, testInfo) => {
  skipRepeatedApiViewport(testInfo, 'Deterministic structure-grain boundary is viewport invariant; run once on desktop.');

  const r377 = await getStructure(request, 'CUH-377-S05');
  expect(r377).toMatchObject({ structure_id: 'CUH-377-S05', dimensionality: '1D' });
  expect(r377.motif_details?.formula).toBe('Cu2I2');
  expect(r377.motif_details?.normalization_note).toContain('global connectivity is 1D');

  const r378 = await getStructure(request, 'CUH-378-S01');
  expect(r378).toMatchObject({ structure_id: 'CUH-378-S01', dimensionality: '1D' });
  expect(r378.motif_details?.formula).toBe('Cu4I4');
  expect(r378.motif_details?.normalization_note).toContain('global Cu-I connectivity is 1D');

  const r186 = await getStructure(request, 'CUH-186-S01');
  expect(r186).toMatchObject({ structure_id: 'CUH-186-S01', dimensionality: '3D' });
  expect(r186.motif_details?.formula).toBe('CuBr');
  expect(r186.motif_details?.normalization_note).toContain('not the global dimensionality');
});

test('review/perspective placeholders stay absent and export stays disabled', async ({ request }, testInfo) => {
  skipRepeatedApiViewport(testInfo, 'Deleted-placeholder and export contracts are viewport invariant; run once on desktop.');

  for (const id of ['CUH-244-S01', 'CUH-305-S01']) {
    const r = await request.get(`${BASE}/api/public-data?action=structure&id=${encodeURIComponent(id)}`);
    expect(r.status()).toBe(404);
    const x = await r.json();
    expect(x.error).toBe('structure not found');
    expect(x.current_curated_revision).toBe(7);
  }

  const e = await request.get(`${BASE}/api/export`);
  expect(e.status()).toBe(410);
});

test('rev.7 exact-count and identity boundaries remain deterministic', async ({ request }, testInfo) => {
  skipRepeatedApiViewport(testInfo, 'Read-only Assistant boundary queries are viewport invariant; run once on desktop.');
  test.setTimeout(240_000);

  const count = await askAgent(request, '当前 CuHalide Atlas 收录多少篇 canonical verified articles 和多少条结构？');
  expect(count.answer).toContain('369');
  expect(count.answer).toContain('946');

  const dppb = await askAgent(request, '1,2-bis(diphenylphosphino)benzene 也常叫 dppb 吗？不要和1,4-bis(diphenylphosphino)butane混淆。');
  expect(dppb.answer).toContain('CUH-382-S04');
  expect(dppb.answer).toContain('CUH-382-S05');
  expect(dppb.answer).toContain('1,4-bis(diphenylphosphino)butane');

  const glass = await askAgent(request, 'DOI 10.1021/acs.cgd.5c01789 的 2g 和 3g 是晶体结构吗？它们有空间群吗？');
  expect(glass.answer).toContain('amorphous');
  expect(glass.answer).toContain('CUH-105-S03');
});