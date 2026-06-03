#!/usr/bin/env bash
# smoke.sh — post-deploy sanity checks. Requires RUNTIME_ARN set.
set -euo pipefail
: "${RUNTIME_ARN:?set RUNTIME_ARN}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "== 1. digest a paper =="
"$HERE/demo.sh" "read arXiv 2104.09864 and store the key insight" "smoke-A" | tee /tmp/smoke1.txt
grep -iq "rope\|rotary\|position" /tmp/smoke1.txt && echo "PASS digest" || { echo "FAIL digest"; exit 1; }

echo "== 2. memory recall in a NEW session =="
"$HERE/demo.sh" "what have we studied about position embeddings?" "smoke-B" | tee /tmp/smoke2.txt
grep -iq "rope\|rotary\|2104.09864" /tmp/smoke2.txt && echo "PASS recall" || { echo "FAIL recall"; exit 1; }

echo "== 3. reproduce in sandbox =="
"$HERE/demo.sh" "reproduce a minimal check of the core claim and show the numbers" "smoke-C" | tee /tmp/smoke3.txt
grep -Eiq "[0-9]+\.[0-9]+|accuracy|result" /tmp/smoke3.txt && echo "PASS reproduce" || { echo "FAIL reproduce"; exit 1; }

echo "ALL SMOKE CHECKS PASSED"
