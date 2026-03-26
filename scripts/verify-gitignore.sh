#!/usr/bin/env bash
set -euo pipefail

# Run from repo root regardless of caller CWD.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

failures=0

assert_ignored() {
  local path="$1"
  local expected_rule="$2"
  local out

  out="$(git check-ignore -v "$path" || true)"

  if [[ -z "$out" ]]; then
    echo "FAIL: expected ignored, but not ignored: $path"
    failures=$((failures + 1))
    return
  fi

  if [[ "$out" != *"$expected_rule"* ]]; then
    echo "FAIL: ignored path matched unexpected rule: $path"
    echo "      expected rule contains: $expected_rule"
    echo "      actual: $out"
    failures=$((failures + 1))
    return
  fi

  echo "PASS: ignored -> $path"
}

assert_not_ignored() {
  local path="$1"

  if git check-ignore -q "$path"; then
    echo "FAIL: expected tracked/allowed, but ignored: $path"
    failures=$((failures + 1))
    return
  fi

  echo "PASS: not ignored -> $path"
}

echo "Checking critical ignore rules..."
assert_ignored "/resources"
assert_ignored "node_modules/dummy.txt" "/node_modules"
assert_ignored ".next/dummy.txt" "/.next/"
assert_ignored ".env.local" ".env"
assert_ignored ".env.test" ".env"
assert_ignored "logs/dummy.txt" "logs/"
assert_ignored ".claude/settings.json" ".claude"

echo
echo "Checking critical files are not ignored..."
assert_not_ignored ".env.example"
assert_not_ignored ".env.test.example"
assert_not_ignored "scripts/verify-gitignore.sh"
assert_not_ignored ".github/workflows/gitignore-preflight.yml"

echo
echo "Checking for tracked files that should now be ignored..."
tracked_ignored="$(git ls-files -ci --exclude-standard)"
if [[ -n "$tracked_ignored" ]]; then
  echo "FAIL: tracked files are matching .gitignore rules:"
  echo "$tracked_ignored"
  failures=$((failures + 1))
else
  echo "PASS: no tracked files conflict with .gitignore"
fi

echo
if (( failures > 0 )); then
  echo "gitignore verification FAILED ($failures issue(s))"
  exit 1
fi

echo "gitignore verification PASSED"
