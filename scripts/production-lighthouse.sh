#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${CUHALIDE_BASE_URL:-https://cuhalide-atlas-v3.vercel.app}"
OUT_DIR="${LIGHTHOUSE_OUT_DIR:-lighthouse-report}"
RUNS="${LIGHTHOUSE_RUNS:-3}"
TRACE_RETRIES="${LIGHTHOUSE_TRACE_RETRIES:-2}"
mkdir -p "$OUT_DIR"

if [ "$RUNS" -lt 3 ] || [ $((RUNS % 2)) -eq 0 ]; then
  echo "LIGHTHOUSE_RUNS must be an odd integer >= 3 so a robust median can be computed." >&2
  exit 1
fi

if [ "$TRACE_RETRIES" -lt 0 ]; then
  echo "LIGHTHOUSE_TRACE_RETRIES must be >= 0." >&2
  exit 1
fi

if [ -z "${CHROME_PATH:-}" ]; then
  export CHROME_PATH="$(node -e "const { chromium } = require('@playwright/test'); process.stdout.write(chromium.executablePath())")"
fi

if [ ! -x "$CHROME_PATH" ]; then
  echo "Chromium executable not found at $CHROME_PATH" >&2
  exit 1
fi

COMMON=(
  "${BASE_URL}/#home"
  --quiet
  --output=json
  --only-categories=performance,accessibility,best-practices,seo
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"
)

is_trace_capture_failure() {
  local log_file="$1"
  grep -Eqi 'NO_NAVSTART|recording the trace|trace.*navigation start|navigation start.*trace' "$log_file"
}

run_measurement() {
  local profile="$1"
  local run_index="$2"
  local output_path="$OUT_DIR/${profile}-${run_index}.json"
  local log_path="$OUT_DIR/${profile}-${run_index}.log"
  local attempt=1
  local max_attempts=$((TRACE_RETRIES + 1))
  local preset=()

  if [ "$profile" = "desktop" ]; then
    preset=(--preset=desktop)
  fi

  while [ "$attempt" -le "$max_attempts" ]; do
    rm -f "$output_path" "$log_path"
    echo "Lighthouse ${profile} run ${run_index}/${RUNS}, capture attempt ${attempt}/${max_attempts}"

    if npx --no-install lighthouse "${COMMON[@]}" "${preset[@]}" --output-path="$output_path" >"$log_path" 2>&1; then
      cat "$log_path"
      if [ ! -s "$output_path" ]; then
        echo "Lighthouse returned success without a report: $output_path" >&2
        return 1
      fi
      return 0
    fi

    cat "$log_path" >&2
    if is_trace_capture_failure "$log_path" && [ "$attempt" -lt "$max_attempts" ]; then
      echo "Transient Lighthouse trace-capture failure detected; retrying the same measurement without changing any quality threshold." >&2
      attempt=$((attempt + 1))
      sleep 1
      continue
    fi

    if is_trace_capture_failure "$log_path"; then
      echo "Lighthouse trace capture failed after ${max_attempts} attempts." >&2
    else
      echo "Lighthouse failed for a non-trace reason; refusing to retry or weaken the quality gate." >&2
    fi
    return 1
  done
}

# Lab performance scores are inherently noisy on shared CI runners. Three independent
# measurements are retained and the unchanged performance thresholds are evaluated on
# their median. Accessibility, best-practice and SEO floors remain mandatory on every
# valid report in assert-lighthouse.mjs. Only Lighthouse's own trace-capture failures
# (for example NO_NAVSTART) may be retried before a valid report exists.
for i in $(seq 1 "$RUNS"); do
  run_measurement mobile "$i"
  run_measurement desktop "$i"
done

node scripts/assert-lighthouse.mjs "$OUT_DIR" "$RUNS"
