#!/bin/sh
# CI gate: fail if any legacy Apple/glass design tokens survive in src/.
# See .claude-steps/phase-8-redesign/step-45-cleanup-legacy.md (Phase 8.7).
set -e
PATTERN='apple-(blue|green|orange|red|indigo|purple|pink|teal|yellow)|--color-apple-|--font-size-apple-|--radius-apple-|--shadow-apple-|glass-(heavy|subtle|button|overlay)\b|glass\b|--color-bg|--color-surface|--color-fg'

# Prefer ripgrep, fall back to grep on build images without it (e.g. Amplify).
if command -v rg >/dev/null 2>&1; then
  MATCHES=$(rg -n -e "$PATTERN" src/ || true)
else
  MATCHES=$(grep -rnE "$PATTERN" src/ || true)
fi

if [ -n "$MATCHES" ]; then
  echo "Legacy Apple/glass token found — see Phase 8.7"
  echo "$MATCHES"
  exit 1
fi
