#!/usr/bin/env bash
# Quick smoke test for ZXKOL MCP 2.1 Server (supports keyless discovery & authenticated full toolset)
# Usage:
#   ./curl-test.sh                              # Keyless discovery mode (find / describe)
#   ZXKOL_API_KEY=zxk_live_... ./curl-test.sh   # Full authenticated toolset
set -euo pipefail

AUTH_ARGS=()
if [[ -n "${ZXKOL_API_KEY:-}" ]]; then
  AUTH_ARGS=(-H "Authorization: Bearer ${ZXKOL_API_KEY}")
fi

curl -sS https://zxkol.com/api/mcp \
  "${AUTH_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
