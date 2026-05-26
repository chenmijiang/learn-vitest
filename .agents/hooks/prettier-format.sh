#!/usr/bin/env bash
# PostToolUse hook: run prettier on the edited file so lint-staged is a no-op on commit.
# Reads the hook input JSON on stdin. Best-effort — never blocks the agent.
set -uo pipefail

input="$(cat)"
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"

[ -z "$file_path" ] && exit 0
[ ! -f "$file_path" ] && exit 0

case "$file_path" in
  *.ts|*.tsx|*.md|*.json|*.css|*.html|*.yml|*.yaml)
    # Run from the repo root so prettier picks up .prettierrc + .prettierignore.
    repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
    cd "$repo_root"
    # --log-level warn keeps stdout quiet on success; ignore-unknown skips files prettier doesn't handle.
    bunx prettier --write --log-level warn --ignore-unknown "$file_path" 2>/dev/null || true
    ;;
esac

exit 0
