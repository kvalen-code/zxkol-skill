#!/usr/bin/env bash
# Quick smoke test: list the tools the ZXKOL MCP server exposes.
# Usage: ZXKOL_API_KEY=zxk_live_... ./curl-test.sh
set -euo pipefail

: "${ZXKOL_API_KEY:?Set ZXKOL_API_KEY first (create one at https://zxkol.com/dashboard/api-keys)}"

curl -sS https://zxkol.com/api/mcp \
  -H "Authorization: Bearer ${ZXKOL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
