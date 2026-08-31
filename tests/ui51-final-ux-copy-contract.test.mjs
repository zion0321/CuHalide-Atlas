import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ux=fs.readFileSync(new URL('../public/ui-ux-v1.js',import.meta.url),'utf8');

test('Site 51 final polish uses researcher-facing public language',()=>{
  for(const token of [
    'Start with the type of evidence you need.',
    'Inspect crystallography',
    'Compare formula, phase, dimensionality and space group with source-linked records.',
    'Compare measurements',
    'Ask across the Atlas',
    'Search covers curated literature and structures; source publications remain linked by DOI.',
    'Curated structure records · n = 890',
    'Reported photophysics',
    'Local Cu–X motif',
    'Linked photophysics',
    'Keep evidence at the right level',
    'Reset filters'
  ])assert.ok(ux.includes(token),`missing final public-copy token: ${token}`);
});

test('final-copy observers are idempotent and preserve privacy boundaries',()=>{
  assert.match(ux,/node&&node\.textContent!==value/);
  assert.match(ux,/MutationObserver/);
  assert.match(ux,/queueMicrotask\(polishArticleCards\)/);
  assert.match(ux,/queueMicrotask\(polishModal\)/);
  for(const forbidden of ['atlas_internal','source_file','evidence_locator','internal_sample_id','/api/export'])assert.ok(!ux.includes(forbidden),`private/internal surface leaked into UX bootstrap: ${forbidden}`);
});

test('scientific boundary language remains explicit after simplification',()=>{
  for(const token of [
    'Literature, structures and sample-resolved measurements stay separate so comparisons remain scientifically valid.',
    'photophysics is linked only where the evidence supports it.',
    'Polar does not mean ferroelectric.',
    'Photophysics is linked to a specific structure only when the source evidence establishes that connection.',
    'Publisher abstracts and primary source files are not redistributed; use the DOI link for the original publication.'
  ])assert.ok(ux.includes(token),`missing scientific-boundary copy: ${token}`);
});
