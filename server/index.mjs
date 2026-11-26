#!/usr/bin/env node
/**
 * ZXKOL MCP 2.1 Stdio-to-Streamable-HTTP Bridge (Zero External Dependencies, Node >= 18)
 *
 * Allows any local stdio-based MCP host, .mcpb Desktop Extension, or MCP store validator
 * to connect seamlessly to the hosted ZXKOL MCP 2.1 Gateway (https://zxkol.com/api/mcp).
 *
 * Configuration:
 *   - Env `ZXKOL_API_KEY` or CLI `--api-key=zxk_live_...` (optional for `find` / `describe` / Resources / Prompts)
 *   - Env `ZXKOL_MCP_URL` (defaults to `https://zxkol.com/api/mcp`)
 */

import readline from 'node:readline'

const cliKeyArg = process.argv
  .slice(2)
  .find(a => a.startsWith('--api-key='))
  ?.split('=')[1]
const API_KEY = (cliKeyArg || process.env.ZXKOL_API_KEY || '').trim()
const MCP_URL = (
  process.env.ZXKOL_MCP_URL || 'https://zxkol.com/api/mcp'
).trim()

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
})

async function forwardJsonRpc(rawLine) {
  const trimmed = rawLine.trim()
  if (!trimmed) return

  let parsed
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return
  }

  const isNotification =
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    !('id' in parsed)

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream'
  }
  if (API_KEY && !API_KEY.startsWith('${')) {
    headers.Authorization = `Bearer ${API_KEY}`
  }

  try {
    const resp = await fetch(MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(parsed)
    })

    const text = await resp.text()
    if (isNotification || resp.status === 202 || !text.trim()) {
      return
    }

    // Compact JSON onto a single line as required by MCP stdio transport
    try {
      const json = JSON.parse(text)
      process.stdout.write(JSON.stringify(json) + '\n')
    } catch {
      // Handle SSE-formatted fallback if ever returned
      for (const line of text.split(/\r?\n/)) {
        if (line.startsWith('data:')) {
          const dataStr = line.slice(5).trim()
          if (dataStr) {
            process.stdout.write(JSON.stringify(JSON.parse(dataStr)) + '\n')
          }
        }
      }
    }
  } catch (err) {
    if (!isNotification && parsed?.id !== undefined) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: parsed.id,
          error: {
            code: -32603,
            message: `ZXKOL MCP bridge network error: ${err?.message || String(err)}`
          }
        }) + '\n'
      )
    }
  }
}

rl.on('line', line => {
  void forwardJsonRpc(line)
})
