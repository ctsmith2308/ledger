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

echo "Checking single-source .gitignore layout..."
if find apps -type f -name '.gitignore' | grep -q .; then
  echo "FAIL: found nested app .gitignore files; expected only root .gitignore"
  find apps -type f -name '.gitignore' -print
  failures=$((failures + 1))
else
  echo "PASS: no nested app .gitignore files"
fi

echo
echo "Checking critical ignore rules..."
assert_ignored "apps/ledger-api-core/node_modules/dummy.txt" "apps/*/node_modules/"
assert_ignored "apps/ledger-api-gateway/node_modules/dummy.txt" "apps/*/node_modules/"
assert_ignored "apps/ledger-frontend/node_modules/dummy.txt" "apps/*/node_modules/"
assert_ignored "apps/ledger-api-core/dist/dummy.js" "apps/ledger-api-core/dist/"
assert_ignored "apps/ledger-api-core/build/dummy.js" "apps/ledger-api-core/build/"
assert_ignored "apps/ledger-api-core/coverage/dummy.txt" "apps/ledger-api-core/coverage/"
assert_ignored "apps/ledger-api-core/.env" "apps/ledger-api-core/.env"
assert_ignored "apps/ledger-api-core/.env.local" "apps/ledger-api-core/.env.local"
assert_ignored "apps/ledger-frontend/.nuxt/dummy.txt" "apps/ledger-frontend/.nuxt/"
assert_ignored "apps/ledger-frontend/dist/dummy.js" "apps/ledger-frontend/dist/"
assert_ignored "apps/ledger-frontend/.env" "apps/ledger-frontend/.env"
assert_not_ignored "apps/ledger-frontend/.env.example"

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
