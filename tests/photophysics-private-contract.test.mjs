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
  '20260819170527_retire_public_photophysics_prototype_v1.sql'
];

test('canonical photophysics schema history is versioned without private curation rows', () => {
  assert.ok(migrations.includes('20260818095943_create_photophysics_staging_v1.sql'));
  assert.ok(migrations.includes('20260818102716_strengthen_photophysics_staging_health_v2.sql'));
  assert.ok(migrations.includes('20260818133430_add_scintillation_performance_observation_v1.sql'));
  assert.equal(canonicalMigrationNames.length, 27, `expected 27 canonical schema/ontology migrations, found ${canonicalMigrationNames.length}`);
  for (const name of postAuditMigrationNames) assert.ok(migrations.includes(name), `missing production-versioned migration ${name}`);

  const shorthand = migrations.filter(name => /^20260819_(?:material_photophysics_layer|internal_photophysics_fk_indexes)|^20260820_photophysics_current_structure_registry/.test(name));
  assert.deepEqual(shorthand, [], `shorthand migration filenames must not coexist with production versions: ${shorthand.join(', ')}`);

  for (const name of canonicalMigrationNames) {
    const text = read(`supabase/migrations/${name}`);
    const disallowedInsert = /insert\s+into\s+atlas_internal\.cuhalide_photophysics_(?!property_dictionary_v1)/i.test(text);
    const disallowedUpdate = /update\s+atlas_internal\.cuhalide_photophysics_/i.test(text);
    const disallowedDelete = /delete\s+from\s+atlas_internal\.cuhalide_photophysics_/i.test(text);
    assert.equal(disallowedInsert, false, `${name} contains private curation INSERT`);
    assert.equal(disallowedUpdate, false, `${name} contains private curation UPDATE`);
    assert.equal(disallowedDelete, false, `${name} contains private curation DELETE`);
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

test('superseded public-schema prototype is frozen read-only and explicitly non-canonical', () => {
  const freeze = read('supabase/migrations/20260819170527_retire_public_photophysics_prototype_v1.sql');
  const doc = read('docs/MATERIAL_PHOTOPHYSICS_AUDIT_V1.md');
  for (const table of [
    'cuhalide_atlas_material_entities',
    'cuhalide_atlas_photophysics_measurements',
    'cuhalide_atlas_photophysics_mechanisms',
    'cuhalide_atlas_photophysics_evidence',
    'cuhalide_atlas_photophysics_review'
  ]) {
    assert.match(freeze, new RegExp(`revoke all on public\\.${table} from service_role`, 'i'));
    assert.match(freeze, new RegExp(`grant select on public\\.${table} to service_role`, 'i'));
  }
  assert.match(doc, /active curation model is the private `atlas_internal\.cuhalide_photophysics_\*_v1` schema/i);
  assert.match(doc, /deprecated and frozen read-only/i);
  assert.match(doc, /No public photophysics endpoint or bulk export is enabled/i);
});

test('runtime API does not expose the private photophysics staging schema', () => {
  const apiFiles = fs.readdirSync(root('api')).filter(name => name.endsWith('.js'));
  const exposed = apiFiles.filter(name => /atlas_internal\.cuhalide_photophysics|cuhalide_photophysics_(?:article_review|sample_state|measurement|band|value|evidence|conflict)_v1/i.test(read(`api/${name}`)));
  assert.deepEqual(exposed, [], `private photophysics schema referenced by public runtime: ${exposed.join(', ')}`);
});
