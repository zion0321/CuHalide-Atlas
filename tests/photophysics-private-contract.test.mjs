import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = p => new URL(`../${p}`, import.meta.url);
const read = p => fs.readFileSync(root(p), 'utf8');
const migrations = fs.readdirSync(root('supabase/migrations')).filter(name => name.endsWith('.sql'));

const canonicalMigrationNames = migrations.filter(name => /^(?:20260818\d{6}_.+photophysics|20260818\d{6}_add_(?:device_performance|color_rendering|scintillation_performance))/.test(name));
const postAuditMigrationNames = [
  '20260819151647_material_photophysics_layer_v1.sql',
  '20260819152233_material_photophysics_layer_v1_1.sql',
  '20260819152845_material_photophysics_layer_v1_2.sql',
  '20260819153615_material_photophysics_layer_v1_3.sql',
  '20260819155320_material_photophysics_layer_v1_4.sql',
  '20260819155711_material_photophysics_layer_v1_5.sql',
  '20260819155923_material_photophysics_layer_v1_6.sql',
  '20260819160216_material_photophysics_layer_v1_7.sql',
  '20260819160303_material_photophysics_layer_v1_8.sql',
  '20260819161520_internal_photophysics_fk_indexes_v1.sql',
  '20260819164952_photophysics_current_structure_registry_r7.sql',
  '20260819170527_retire_public_photophysics_prototype_v1.sql',
  '20260820024437_photophysics_mechanism_registry_v1.sql',
  '20260820030453_extend_photophysics_mechanism_vocabulary_v1.sql',
  '20260820031911_extend_photophysics_decay_mechanism_v1.sql'
];

test('canonical photophysics schema history is versioned without private curation rows', () => {
  assert.ok(migrations.includes('20260818095943_create_photophysics_staging_v1.sql'));
  assert.ok(migrations.includes('20260818102716_strengthen_photophysics_staging_health_v2.sql'));
  assert.ok(migrations.includes('20260818133430_add_scintillation_performance_observation_v1.sql'));
  assert.equal(canonicalMigrationNames.length, 27, `expected 27 canonical schema/ontology migrations, found ${canonicalMigrationNames.length}`);
  for (const name of postAuditMigrationNames) assert.ok(migrations.includes(name), `missing production-versioned migration ${name}`);
  const shorthand = migrations.filter(name => /^20260819_(?:material_photophysics_layer|internal_photophysics_fk_indexes)|^20260820_(?!024437_photophysics_mechanism_registry_v1)/.test(name));
  assert.deepEqual(shorthand, [], `shorthand migration filenames must not coexist with production versions: ${shorthand.join(', ')}`);
  for (const name of canonicalMigrationNames) {
    const text = read(`supabase/migrations/${name}`);
    assert.equal(/insert\s+into\s+atlas_internal\.cuhalide_photophysics_(?!property_dictionary_v1)/i.test(text), false, `${name} contains private curation INSERT`);
    assert.equal(/update\s+atlas_internal\.cuhalide_photophysics_/i.test(text), false, `${name} contains private curation UPDATE`);
    assert.equal(/delete\s+from\s+atlas_internal\.cuhalide_photophysics_/i.test(text), false, `${name} contains private curation DELETE`);
  }
});

test('active structure mapping health is revision-independent and currently resolves rev.7', () => {
  const registry = read('supabase/migrations/20260819164952_photophysics_current_structure_registry_r7.sql');
  assert.match(registry, /cuhalide_current_structure_registry_v1/);
  assert.match(registry, /cuhalide_public_structures_current_r7/);
  assert.doesNotMatch(registry, /cuhalide_public_structures_current_r6/);
  assert.match(registry, /invalid_structure_exact_mappings/);
  assert.match(registry, /revoke all on atlas_internal\.cuhalide_current_structure_registry_v1 from public, anon, authenticated/i);
});

test('typed mechanism registry preserves evidence, claim polarity and fail-closed QC', () => {
  const mechanism = read('supabase/migrations/20260820024437_photophysics_mechanism_registry_v1.sql');
  assert.match(mechanism, /create table if not exists atlas_internal\.cuhalide_photophysics_mechanism_dictionary_v1/i);
  assert.match(mechanism, /create table if not exists atlas_internal\.cuhalide_photophysics_mechanism_v1/i);
  assert.match(mechanism, /claim_polarity[^\n]+supported[^\n]+consistent_with[^\n]+ruled_out[^\n]+unresolved/i);
  assert.match(mechanism, /claim_basis[^\n]+author_assignment[^\n]+experimentally_supported[^\n]+computationally_supported[^\n]+author_inference[^\n]+atlas_interpretation/i);
  assert.match(mechanism, /evidence_id bigint not null references atlas_internal\.cuhalide_photophysics_evidence_v1\(evidence_id\) on delete restrict/i);
  assert.match(mechanism, /Short Cu-Cu distance alone does not establish this mechanism\./);
  assert.match(mechanism, /broad emission alone is not sufficient\./i);
  assert.match(mechanism, /mechanism_evidence_mismatch/);
  assert.match(mechanism, /analysis_eligible_unresolved_mechanisms/);
  assert.match(mechanism, /revoke all on atlas_internal\.cuhalide_photophysics_mechanism_v1 from public, anon, authenticated/i);
  assert.equal(/(?:insert\s+into|update|delete\s+from)\s+atlas_internal\.cuhalide_photophysics_mechanism_v1\b/i.test(mechanism), false, 'mechanism migration must contain schema/ontology only, not private mechanism curation rows');
});

test('expanded mechanism vocabulary preserves mixed and ligand-localized assignments without forced remapping', () => {
  const vocabulary = read('supabase/migrations/20260820030453_extend_photophysics_mechanism_vocabulary_v1.sql');
  assert.match(vocabulary, /'MXLCT'/);
  assert.match(vocabulary, /'ligand_centered'/);
  assert.match(vocabulary, /'excimer'/);
  assert.match(vocabulary, /'intraligand_charge_transfer'/);
  assert.match(vocabulary, /do not decompose it into separate metal-centered and XLCT claims without evidence/i);
  assert.match(vocabulary, /Do not map this term to LLCT/i);
  assert.doesNotMatch(vocabulary, /cuhalide_photophysics_mechanism_v1\s*\(/i);
});

test('nonradiative relaxation requires an explicit facilitating context rather than low PLQY alone', () => {
  const decay = read('supabase/migrations/20260820031911_extend_photophysics_decay_mechanism_v1.sql');
  assert.match(decay, /'nonradiative_relaxation'/);
  assert.match(decay, /decay_pathway/);
  assert.match(decay, /facilitating structural\/solvent\/phonon factor must remain in assignment_text/i);
  assert.match(decay, /a low PLQY alone does not establish this mechanism/i);
  assert.doesNotMatch(decay, /cuhalide_photophysics_mechanism_v1\s*\(/i);
});

test('superseded public-schema prototype is frozen read-only and explicitly non-canonical', () => {
  const freeze = read('supabase/migrations/20260819170527_retire_public_photophysics_prototype_v1.sql');
  const doc = read('docs/MATERIAL_PHOTOPHYSICS_AUDIT_V1.md');
  for (const table of ['cuhalide_atlas_material_entities','cuhalide_atlas_photophysics_measurements','cuhalide_atlas_photophysics_mechanisms','cuhalide_atlas_photophysics_evidence','cuhalide_atlas_photophysics_review']) {
    assert.match(freeze, new RegExp(`revoke all on public\\.${table} from service_role`, 'i'));
    assert.match(freeze, new RegExp(`grant select on public\\.${table} to service_role`, 'i'));
  }
  assert.match(doc, /active curation model is the private `atlas_internal\.cuhalide_photophysics_\*_v1` schema/i);
  assert.match(doc, /deprecated and frozen read-only/i);
  assert.match(doc, /fail-closed, read-only public projection/i);
  assert.match(doc, /`pass_a_curated` means the primary-evidence Pass A curation gate is complete/i);
  assert.match(doc, /`two_pass_verified` \/ article `qc_passed` means an independent Pass B/i);
  assert.match(doc, /Pass A and Pass B agree after any controlled corrections/i);
  assert.match(doc, /exposes no raw primary files, source filenames, raw evidence locators or internal sample identifiers/i);
  assert.match(doc, /bulk export remains disabled/i);
});

test('runtime API does not expose the private photophysics staging schema', () => {
  const apiFiles = fs.readdirSync(root('api')).filter(name => name.endsWith('.js'));
  const exposed = apiFiles.filter(name => /atlas_internal\.cuhalide_photophysics|cuhalide_photophysics_(?:article_review|sample_state|measurement|band|value|evidence|conflict|mechanism|mechanism_dictionary)_v1/i.test(read(`api/${name}`)));
  assert.deepEqual(exposed, [], `private photophysics schema referenced by public runtime: ${exposed.join(', ')}`);
});

test('public record renderer reaches staged photophysics only through the whitelisted live-derived contract', () => {
  const record = read('api/record-current.js');
  const proxy = read('api/public-data.js');
  assert.match(record, /cuhalide-atlas-public-data-v3/);
  assert.match(record, /normalizePhotophysicsVersion/);
  assert.match(record, /overlay\.photophysics\.version/);
  assert.match(record, /Pass A curated/);
  assert.match(record, /Two-pass verified/);
  assert.match(record, /Pass B verification has not yet been completed/);
  assert.doesNotMatch(record, /evidence_locator|source_file|source_sha256|atlas_internal/i);
  assert.match(proxy, /PUBLIC_DATA_VERSION='2\.16\.0'/);
  assert.match(proxy, /snapshotPhotophysicsVersion/);
  assert.match(proxy, /normalizePhotophysicsVersion/);
  assert.match(proxy, /bodyVersion&&headerVersion&&bodyVersion!==headerVersion/);
  assert.match(proxy, /cuhalide-atlas-public-data-v3/);
  assert.doesNotMatch(`${record}\n${proxy}`,/PHOTOPHYSICS_CONTRACT='1\.3\.[123]'/);
});