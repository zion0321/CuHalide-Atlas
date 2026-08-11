#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${CUHALIDE_BASE_URL:-https://cuhalide-atlas-v3.vercel.app}"
OUT_DIR="${LIGHTHOUSE_OUT_DIR:-lighthouse-report}"
mkdir -p "$OUT_DIR"

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

npx --no-install lighthouse "${COMMON[@]}" --output-path="$OUT_DIR/mobile.json"
npx --no-install lighthouse "${COMMON[@]}" --preset=desktop --output-path="$OUT_DIR/desktop.json"

node scripts/assert-lighthouse.mjs "$OUT_DIR/mobile.json" "$OUT_DIR/desktop.json"
