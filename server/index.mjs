#!/usr/bin/env node
/**
 * ZXKOL MCP 2.1 Stdio-to-Streamable-HTTP Bridge (Zero External Dependencies, Node >= 18)
 *
 * Allows any local stdio-based MCP host, Coze Skill runtime, .mcpb Desktop Extension,
 * or MCP store validator to connect seamlessly to the hosted ZXKOL MCP 2.1 Gateway
 * (https://zxkol.com/api/mcp).
 *
 * Configuration:
 *   - Env `ZXKOL_API_KEY` (or Coze `COZE_ZXKOL_API_KEY_<skill_id>`) or CLI `--api-key=zxk_live_...`
 *     (optional for `find` / `describe` / Resources / Prompts)
 *   - Env `ZXKOL_MCP_URL` (defaults to `https://zxkol.com/api/mcp`)
 */

import readline from 'node:readline'

const TEMPLATE_RE = /^(?:\$\{[^}]*\}|\{\{[^}]*\}\}|<[^>]+>)$/
const COZE_PLACEHOLDER_RE = /^COZE_[A-Z0-9_]+$/
const ZXKOL_KEY_FORMAT_RE = /^zxk_[A-Za-z0-9_-]{12,}$/

function cleanCandidateKey(raw) {
  if (typeof raw !== 'string') return ''
  let v = raw.trim()
  if (!v) return ''
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim()
  }
  v = v.replace(/^authorization\s*:\s*/i, '').trim()
  while (/^(?:bearer|token)\s+/i.test(v)) {
    v = v.replace(/^(?:bearer|token)\s+/i, '').trim()
  }
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim()
  }
  return v
}

function resolveBridgeApiKey(argv = process.argv, env = process.env) {
  const checkValue = (raw, sourceName) => {
    const cleaned = cleanCandidateKey(raw)
    if (!cleaned || TEMPLATE_RE.test(cleaned)) return ''
    if (
      COZE_PLACEHOLDER_RE.test(cleaned) ||
      (sourceName && cleaned === sourceName) ||
      cleaned === 'ZXKOL_API_KEY'
    ) {
      return ''
    }
    return cleaned
  }

  const cliKeyArg = argv
    .slice(2)
    .find(a => a.startsWith('--api-key=') || a.startsWith('--key='))
    ?.split('=')
    .slice(1)
    .join('=')
  if (cliKeyArg) {
    const fromCli = checkValue(cliKeyArg, '--api-key')
    if (fromCli) return fromCli
  }

  for (const name of ['ZXKOL_API_KEY', 'ZXKOL_KEY', 'ZXKOL_TOKEN', 'API_KEY']) {
    const candidate = checkValue(env[name], name)
    if (candidate) return candidate
  }

  for (const [name, val] of Object.entries(env)) {
    if (
      /^(?:COZE_.*(?:ZXKOL|API_KEY|KEY|TOKEN).*|.*ZXKOL.*(?:KEY|TOKEN).*)$/i.test(
        name
      )
    ) {
      const candidate = checkValue(val, name)
      if (candidate) return candidate
    }
  }

  for (const [, val] of Object.entries(env)) {
    const cleaned = cleanCandidateKey(val)
    if (ZXKOL_KEY_FORMAT_RE.test(cleaned)) return cleaned
  }

  return ''
}

const API_KEY = resolveBridgeApiKey()
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
  if (API_KEY) {
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

    if (!resp.ok) {
      let errMsg = `ZXKOL MCP HTTP ${resp.status}`
      try {
        const errJson = JSON.parse(text)
        if (errJson?.message) errMsg = `${errMsg}: ${errJson.message}`
      } catch {
        // ignore JSON parse error on non-200 body
      }
      if (parsed?.id !== undefined) {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: parsed.id,
            error: {
              code: -32001,
              message: errMsg
            }
          }) + '\n'
        )
      }
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
