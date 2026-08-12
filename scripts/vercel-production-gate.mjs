const REPOSITORY = 'zion0321/CuHalide-Atlas';

export const REQUIRED_CHECKS = Object.freeze([
  'chromium-production',
  'lighthouse-production',
  'preview-chromium',
  'preview-lighthouse',
]);

function isFullSha(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || ''));
}

export function selectMergedMainPullRequest(pulls, commitSha) {
  if (!Array.isArray(pulls)) return null;
  return pulls.find((pr) => (
    pr &&
    pr.merged_at &&
    pr.base?.ref === 'main' &&
    pr.merge_commit_sha === commitSha
  )) || null;
}

export function latestGithubActionsChecks(checkRuns) {
  const latest = new Map();
  for (const run of Array.isArray(checkRuns) ? checkRuns : []) {
    if (!run?.name || run?.app?.slug !== 'github-actions') continue;
    const current = latest.get(run.name);
    if (!current || Number(run.id || 0) > Number(current.id || 0)) {
      latest.set(run.name, run);
    }
  }
  return latest;
}

export function evaluateProductionGate({
  vercelEnv,
  commitRef,
  commitSha,
  pulls = [],
  checkRuns = [],
}) {
  if (vercelEnv !== 'production') {
    return { allowBuild: true, reason: 'non-production deployment' };
  }

  if (commitRef !== 'main') {
    return { allowBuild: false, reason: `production deployment is not from main (${commitRef || 'missing ref'})` };
  }

  if (!isFullSha(commitSha)) {
    return { allowBuild: false, reason: 'missing or invalid VERCEL_GIT_COMMIT_SHA' };
  }

  const pullRequest = selectMergedMainPullRequest(pulls, commitSha);
  if (!pullRequest) {
    return { allowBuild: false, reason: 'commit is not the merge result of a merged PR into main' };
  }

  const headSha = pullRequest.head?.sha;
  if (!isFullSha(headSha)) {
    return { allowBuild: false, reason: `merged PR #${pullRequest.number} has no valid head SHA` };
  }

  const latestChecks = latestGithubActionsChecks(checkRuns);
  const failedOrMissingChecks = REQUIRED_CHECKS.filter((name) => {
    const run = latestChecks.get(name);
    return !run || run.status !== 'completed' || run.conclusion !== 'success';
  });

  if (failedOrMissingChecks.length) {
    return {
      allowBuild: false,
      reason: `merged PR #${pullRequest.number} is missing successful required checks: ${failedOrMissingChecks.join(', ')}`,
      pullRequestNumber: pullRequest.number,
      pullRequestHeadSha: headSha,
      failedOrMissingChecks,
    };
  }

  return {
    allowBuild: true,
    reason: `merged PR #${pullRequest.number} passed all required baseline and preview checks`,
    pullRequestNumber: pullRequest.number,
    pullRequestHeadSha: headSha,
  };
}

async function githubJson(path) {
  const url = `https://api.github.com/repos/${REPOSITORY}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CuHalide-Atlas-Vercel-Production-Gate',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    throw new Error(`GitHub API ${response.status} for ${path}; rate-limit remaining=${remaining ?? 'unknown'}, reset=${reset ?? 'unknown'}`);
  }

  return response.json();
}

async function run() {
  const vercelEnv = process.env.VERCEL_ENV || '';
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF || '';
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || '';

  if (vercelEnv !== 'production') {
    console.log(`[deployment-gate] allow: ${vercelEnv || 'non-Vercel'} deployment`);
    process.exitCode = 1;
    return;
  }

  if (commitRef !== 'main' || !isFullSha(commitSha)) {
    const decision = evaluateProductionGate({ vercelEnv, commitRef, commitSha });
    console.log(`[deployment-gate] ignore production build: ${decision.reason}`);
    process.exitCode = 0;
    return;
  }

  const pulls = await githubJson(`/commits/${commitSha}/pulls?per_page=100`);
  const pullRequest = selectMergedMainPullRequest(pulls, commitSha);
  if (!pullRequest) {
    console.log('[deployment-gate] ignore production build: commit is not the merge result of a merged PR into main');
    process.exitCode = 0;
    return;
  }

  const headSha = pullRequest.head?.sha || '';
  if (!isFullSha(headSha)) {
    console.log(`[deployment-gate] ignore production build: merged PR #${pullRequest.number} has no valid head SHA`);
    process.exitCode = 0;
    return;
  }

  const checksResponse = await githubJson(`/commits/${headSha}/check-runs?per_page=100`);
  const decision = evaluateProductionGate({
    vercelEnv,
    commitRef,
    commitSha,
    pulls,
    checkRuns: checksResponse.check_runs,
  });

  if (decision.allowBuild) {
    console.log(`[deployment-gate] allow production build: ${decision.reason}`);
    // Vercel Ignored Build Step semantics: exit 1 means continue the build.
    process.exitCode = 1;
    return;
  }

  console.log(`[deployment-gate] ignore production build: ${decision.reason}`);
  // Vercel Ignored Build Step semantics: exit 0 means skip the build.
  process.exitCode = 0;
}

const isDirectExecution = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isDirectExecution) {
  run().catch((error) => {
    // Fail closed for production: a GitHub API outage or rate-limit must not turn
    // an unverified main push into a production deployment.
    console.error(`[deployment-gate] ignore production build: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = process.env.VERCEL_ENV === 'production' ? 0 : 1;
  });
}
