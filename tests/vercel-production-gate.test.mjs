import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_CHECKS,
  evaluateProductionGate,
  findMergedMainPullRequestWithRetry,
  latestCommitStatuses,
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

function status(context = 'Vercel', id = 200, state = 'success', targetUrl = 'https://vercel.com/team/project/deployment') {
  return {
    id,
    context,
    state,
    target_url: targetUrl,
  };
}

function validInput(overrides = {}) {
  return {
    vercelEnv: 'production',
    commitRef: 'main',
    commitSha: MERGE_SHA,
    pulls: [mergedPr()],
    checkRuns: successfulChecks(),
    commitStatuses: [status()],
    ...overrides,
  };
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

test('merge association retries boundedly until GitHub exposes the merged PR', async () => {
  let fetchCalls = 0;
  let sleepCalls = 0;
  const result = await findMergedMainPullRequestWithRetry({
    commitSha: MERGE_SHA,
    attempts: 4,
    delayMs: 0,
    fetchPulls: async () => {
      fetchCalls += 1;
      return fetchCalls < 3 ? [] : [mergedPr()];
    },
    sleepFn: async () => {
      sleepCalls += 1;
    },
  });

  assert.equal(result.pullRequest?.number, 16);
  assert.equal(result.attempt, 3);
  assert.equal(fetchCalls, 3);
  assert.equal(sleepCalls, 2);
});

test('merge association retry remains fail-closed after the bounded window', async () => {
  let fetchCalls = 0;
  let sleepCalls = 0;
  const result = await findMergedMainPullRequestWithRetry({
    commitSha: MERGE_SHA,
    attempts: 3,
    delayMs: 0,
    fetchPulls: async () => {
      fetchCalls += 1;
      return [];
    },
    sleepFn: async () => {
      sleepCalls += 1;
    },
  });

  assert.equal(result.pullRequest, null);
  assert.equal(result.attempt, 3);
  assert.equal(fetchCalls, 3);
  assert.equal(sleepCalls, 2);
});

test('all four baseline and candidate checks are required', () => {
  const checks = successfulChecks().filter((run) => run.name !== 'preview-lighthouse');
  const result = evaluateProductionGate(validInput({ checkRuns: checks }));

  assert.equal(result.allowBuild, false);
  assert.deepEqual(result.failedOrMissingChecks, ['preview-lighthouse']);
});

test('checks from non-GitHub-Actions apps cannot satisfy the gate', () => {
  const checks = successfulChecks().map((run) => (
    run.name === 'preview-chromium' ? check(run.name, run.id, 'success', 'other-app') : run
  ));

  const result = evaluateProductionGate(validInput({ checkRuns: checks }));

  assert.equal(result.allowBuild, false);
  assert.ok(result.failedOrMissingChecks.includes('preview-chromium'));
});

test('latest GitHub Actions check result wins so a later failure cannot be masked by an older success', () => {
  const checks = [
    ...successfulChecks(),
    check('preview-lighthouse', 999, 'failure'),
  ];
  const latest = latestGithubActionsChecks(checks);
  assert.equal(latest.get('preview-lighthouse').conclusion, 'failure');

  const result = evaluateProductionGate(validInput({ checkRuns: checks }));
  assert.equal(result.allowBuild, false);
});

test('missing or failed Vercel deployment status blocks production', () => {
  assert.equal(evaluateProductionGate(validInput({ commitStatuses: [] })).allowBuild, false);
  assert.equal(evaluateProductionGate(validInput({ commitStatuses: [status('Vercel', 200, 'failure')] })).allowBuild, false);
  assert.equal(evaluateProductionGate(validInput({ commitStatuses: [status('Vercel', 200, 'pending')] })).allowBuild, false);
});

test('Vercel status must point to a vercel.com deployment result', () => {
  const result = evaluateProductionGate(validInput({
    commitStatuses: [status('Vercel', 200, 'success', 'https://example.invalid/fake-vercel-status')],
  }));
  assert.equal(result.allowBuild, false);
});

test('latest Vercel status wins so an older success cannot mask a newer failure', () => {
  const statuses = [
    status('Vercel', 200, 'success'),
    status('Vercel', 999, 'failure'),
  ];
  const latest = latestCommitStatuses(statuses);
  assert.equal(latest.get('Vercel').state, 'failure');

  const result = evaluateProductionGate(validInput({ commitStatuses: statuses }));
  assert.equal(result.allowBuild, false);
});

test('unrelated commit statuses do not satisfy the Vercel requirement', () => {
  const result = evaluateProductionGate(validInput({
    commitStatuses: [status('Other CI', 500, 'success')],
  }));
  assert.equal(result.allowBuild, false);
});

test('verified merged PR with all required QA and Vercel status is allowed', () => {
  const result = evaluateProductionGate(validInput());

  assert.equal(result.allowBuild, true);
  assert.equal(result.pullRequestNumber, 16);
  assert.equal(result.pullRequestHeadSha, HEAD_SHA);
});
