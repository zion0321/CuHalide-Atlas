// Only used for idempotent health, state and bootstrap reads. Never returns stale data.
export async function fetchReadOnlyJson(url, init = {}, options = {}) {
  const fetcher = options.fetcher || fetch;
  const sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const deadline = Date.now() + (options.budgetMs || 18000);
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining < 100) break;
    try {
      const response = await fetcher(url, {...init, signal: AbortSignal.timeout(Math.min(attempt < 2 ? 6000 : 18000, remaining))});
      const body = await response.text();
      if (!response.ok) {
        const error = new Error(`Read-only data service HTTP ${response.status}`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      try { return body ? JSON.parse(body) : null; }
      catch { const error = new Error('Invalid JSON from read-only data service'); error.retryable = false; throw error; }
    } catch (error) {
      if (error?.retryable === false) throw error;
      lastError = error;
      if (attempt < 2 && deadline - Date.now() > 400) await sleep(150 * (attempt + 1));
    }
  }
  throw lastError || new Error('Read-only data service timed out');
}
