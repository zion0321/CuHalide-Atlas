#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${CUHALIDE_BASE_URL:-https://cuhalide-atlas-v3.vercel.app}"
OUT_DIR="${LIGHTHOUSE_OUT_DIR:-lighthouse-report}"
RUNS="${LIGHTHOUSE_RUNS:-3}"
mkdir -p "$OUT_DIR"

if [ "$RUNS" -lt 3 ] || [ $((RUNS % 2)) -eq 0 ]; then
  echo "LIGHTHOUSE_RUNS must be an odd integer >= 3 so a robust median can be computed." >&2
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

# Lab performance scores are inherently noisy on shared CI runners. Running an odd
# number of independent measurements and gating on their median preserves the same
# performance thresholds while preventing one unattributable runner stall from
# masquerading as a product regression. Accessibility, best-practice and SEO floors
# are still required on every individual run by assert-lighthouse.mjs.
for i in $(seq 1 "$RUNS"); do
  echo "Lighthouse mobile run ${i}/${RUNS}"
  npx --no-install lighthouse "${COMMON[@]}" --output-path="$OUT_DIR/mobile-${i}.json"
  echo "Lighthouse desktop run ${i}/${RUNS}"
  npx --no-install lighthouse "${COMMON[@]}" --preset=desktop --output-path="$OUT_DIR/desktop-${i}.json"
done

node scripts/assert-lighthouse.mjs "$OUT_DIR" "$RUNS"
