#!/usr/bin/env bash
set -euo pipefail

echo "=== Step 1: Lint ==="
npm run lint

echo "=== Step 2: Unit & Component Tests (with coverage) ==="
npx vitest run --project unit --coverage

echo "=== Step 3: Integration Tests (requires Docker) ==="
npx vitest run --project integration

echo "=== All CI checks passed ==="
