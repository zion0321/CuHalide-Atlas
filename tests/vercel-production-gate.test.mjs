import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_CHECKS,
  evaluateProductionGate,
  latestGithubActionsChecks,
  selectMergedMainPullRequest,
} from '../scripts/vercel-production-gate.mjs';

const MERGE_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const HEAD_SHA = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

function mergedPr(overrides = {}) {
  return {
    number: 16,
    merged_at: '2026-08-12T12:00:00Z',
    merge_commit_sha: MERGE_SHA,
    base: { ref: 'main' },
    head: { sha: HEAD_SHA },
    ...overrides,
  };
}

function check(name, id, conclusion = 'success', app = 'github-actions') {
  return {
    id,
    name,
    status: 'completed',
    conclusion,
    app: { slug: app },
  };
}

function successfulChecks() {
  return REQUIRED_CHECKS.map((name, index) => check(name, 100 + index));
}

test('non-production deployments always continue', () => {
  const result = evaluateProductionGate({ vercelEnv: 'preview' });
  assert.equal(result.allowBuild, true);
});

test('production must come from main with a full SHA', () => {
  assert.equal(evaluateProductionGate({
    vercelEnv: 'production',
    commitRef: 'feature/test',
    commitSha: MERGE_SHA,
  }).allowBuild, false);

  assert.equal(evaluateProductionGate({
    vercelEnv: 'production',
    commitRef: 'main',
    commitSha: 'abc',
  }).allowBuild, false);
});

test('production commit must be the exact merge result of a merged PR into main', () => {
  assert.equal(selectMergedMainPullRequest([], MERGE_SHA), null);
  assert.equal(selectMergedMainPullRequest([
    mergedPr({ merged_at: null }),
    mergedPr({ base: { ref: 'other' } }),
    mergedPr({ merge_commit_sha: 'cccccccccccccccccccccccccccccccccccccccc' }),
  ], MERGE_SHA), null);

  assert.equal(selectMergedMainPullRequest([mergedPr()], MERGE_SHA)?.number, 16);
});

test('all four baseline and preview checks are required', () => {
  const checks = successfulChecks().filter((run) => run.name !== 'preview-lighthouse');
  const result = evaluateProductionGate({
    vercelEnv: 'production',
    commitRef: 'main',
    commitSha: MERGE_SHA,
    pulls: [mergedPr()],
    checkRuns: checks,
  });

  assert.equal(result.allowBuild, false);
  assert.deepEqual(result.failedOrMissingChecks, ['preview-lighthouse']);
});

test('checks from non-GitHub-Actions apps cannot satisfy the gate', () => {
  const checks = successfulChecks().map((run) => (
    run.name === 'preview-chromium' ? check(run.name, run.id, 'success', 'other-app') : run
  ));

  const result = evaluateProductionGate({
    vercelEnv: 'production',
    commitRef: 'main',
    commitSha: MERGE_SHA,
    pulls: [mergedPr()],
    checkRuns: checks,
  });

  assert.equal(result.allowBuild, false);
  assert.ok(result.failedOrMissingChecks.includes('preview-chromium'));
});

test('latest check result wins so a later failure cannot be masked by an older success', () => {
  const checks = [
    ...successfulChecks(),
    check('preview-lighthouse', 999, 'failure'),
  ];
  const latest = latestGithubActionsChecks(checks);
  assert.equal(latest.get('preview-lighthouse').conclusion, 'failure');

  const result = evaluateProductionGate({
    vercelEnv: 'production',
    commitRef: 'main',
    commitSha: MERGE_SHA,
    pulls: [mergedPr()],
    checkRuns: checks,
  });
  assert.equal(result.allowBuild, false);
});

test('verified merged PR with all required successful checks is allowed', () => {
  const result = evaluateProductionGate({
    vercelEnv: 'production',
    commitRef: 'main',
    commitSha: MERGE_SHA,
    pulls: [mergedPr()],
    checkRuns: successfulChecks(),
  });

  assert.equal(result.allowBuild, true);
  assert.equal(result.pullRequestNumber, 16);
  assert.equal(result.pullRequestHeadSha, HEAD_SHA);
});
