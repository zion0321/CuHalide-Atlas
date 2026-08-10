#!/usr/bin/env python3
"""Compatibility runner for the CuHalide Atlas 3.0.1 package builder.

The original builder is intentionally kept unchanged. This runner replaces only
its coverage-protocol fetch with the dedicated, validated 210-row export, which
exposes the actual registered fields and does not invent a creation timestamp.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BUILDER_PATH = SCRIPT_DIR / "build_release_package.py"
PROTOCOL_URL = (
    "https://tyxnyjyrfzspwcfjpzus.supabase.co/functions/v1/"
    "cuhalide-atlas-release-export-v301-protocol"
)

spec = importlib.util.spec_from_file_location("cuhalide_release_builder", BUILDER_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Unable to load release builder: {BUILDER_PATH}")

builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
original_export = builder.export


def validated_export(action: str):
    if action == "coverage-protocol":
        return builder.fetch_json(PROTOCOL_URL)
    return original_export(action)


builder.export = validated_export

if __name__ == "__main__":
    try:
        raise SystemExit(builder.main())
    except builder.BuildError as exc:
        print(f"RELEASE BUILD FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1)
