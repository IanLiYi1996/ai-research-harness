#!/usr/bin/env bash
# seed.sh — pre-seed Memory by running the agent on a few papers.
# Run once before the booth opens.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PAPERS=("2104.09864" "1706.03762")  # RoPE, Attention Is All You Need

for id in "${PAPERS[@]}"; do
  echo "Seeding paper $id ..."
  "$HERE/demo.sh" "read arXiv $id and store the key insight" "seed-session" || true
  sleep 2
done
echo "Seed complete."
