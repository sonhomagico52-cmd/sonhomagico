#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"

echo "[1/4] TypeScript check"
(cd "$ROOT_DIR" && npm run check)

echo "[2/4] Production build"
(cd "$ROOT_DIR" && npm run build)

echo "[3/4] npm audit (production)"
(cd "$ROOT_DIR" && npm audit --omit=dev || true)

echo "[4/4] Container config validation"
(cd "$ROOT_DIR" && docker compose -f compose.yaml config >/dev/null)

echo "Security audit routine completed"
