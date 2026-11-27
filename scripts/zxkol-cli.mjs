#!/usr/bin/env node
/**
 * ZXKOL Skill Zero-Dependency CLI Helper (Node.js >= 18)
 * Directly invokes https://zxkol.com/api/mcp via JSON-RPC 2.0 over HTTPS.
 *
 * Usage:
 *   node scripts/zxkol-cli.mjs find <query> [platform]
 *   node scripts/zxkol-cli.mjs describe <endpoint_id>
 *   node scripts/zxkol-cli.mjs call <endpoint_id> [json_params]
 *   node scripts/zxkol-cli.mjs batch <json_calls_array>
 *   node scripts/zxkol-cli.mjs read_more <cache_id> <offset>
 *   node scripts/zxkol-cli.mjs account
 */

import { pathToFileURL } from 'node:url'

const ENDPOINT = (
  process.env.ZXKOL_MCP_URL || 'https://zxkol.com/api/mcp'
).trim()

const TEMPLATE_RE = /^(?:\$\{[^}]*\}|\{\{[^}]*\}\}|<[^>]+>)$/
const COZE_PLACEHOLDER_RE = /^COZE_[A-Z0-9_]+$/
const ZXKOL_KEY_FORMAT_RE = /^zxk_[A-Za-z0-9_-]{12,}$/

export function cleanCandidateKey(raw) {
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

export function resolveZxkolAuth(argv = process.argv, env = process.env) {
  const unexpandedVars = []
  const positionalArgs = []
  let cliRaw = ''

  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--api-key=')) {
      cliRaw = arg.slice('--api-key='.length)
    } else if (arg.startsWith('--key=')) {
      cliRaw = arg.slice('--key='.length)
    } else {
      positionalArgs.push(arg)
    }
  }

  const checkValue = (raw, sourceName) => {
    const cleaned = cleanCandidateKey(raw)
    if (!cleaned || TEMPLATE_RE.test(cleaned)) return ''
    if (
      COZE_PLACEHOLDER_RE.test(cleaned) ||
      (sourceName && cleaned === sourceName) ||
      cleaned === 'ZXKOL_API_KEY'
    ) {
      if (sourceName && !unexpandedVars.includes(sourceName)) {
        unexpandedVars.push(sourceName)
      }
      return ''
    }
    return cleaned
  }

  if (cliRaw) {
    const fromCli = checkValue(cliRaw, '--api-key')
    if (fromCli) {
      return { apiKey: fromCli, source: 'cli', unexpandedVars, positionalArgs }
    }
  }

  const directNames = ['ZXKOL_API_KEY', 'ZXKOL_KEY', 'ZXKOL_TOKEN', 'API_KEY']
  for (const name of directNames) {
    const candidate = checkValue(env[name], name)
    if (candidate) {
      return { apiKey: candidate, source: name, unexpandedVars, positionalArgs }
    }
  }

  // Support Coze dynamic skill credential variables (e.g. COZE_ZXKOL_API_KEY_<skill_id>)
  for (const [name, val] of Object.entries(env)) {
    if (
      /^(?:COZE_.*(?:ZXKOL|API_KEY|KEY|TOKEN).*|.*ZXKOL.*(?:KEY|TOKEN).*)$/i.test(
        name
      )
    ) {
      const candidate = checkValue(val, name)
      if (candidate) {
        return {
          apiKey: candidate,
          source: name,
          unexpandedVars,
          positionalArgs
        }
      }
    }
  }

  // Final fallback: discover any env var holding a valid zxk_... secret
  for (const [name, val] of Object.entries(env)) {
    const cleaned = cleanCandidateKey(val)
    if (ZXKOL_KEY_FORMAT_RE.test(cleaned)) {
      return { apiKey: cleaned, source: name, unexpandedVars, positionalArgs }
    }
  }

  return { apiKey: '', source: null, unexpandedVars, positionalArgs }
}

const KEYLESS_TOOLS = new Set(['find', 'describe'])

async function callMcpTool(name, args = {}, auth = resolveZxkolAuth()) {
  if (
    !auth.apiKey &&
    !KEYLESS_TOOLS.has(name) &&
    auth.unexpandedVars.length > 0
  ) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: 'coze_unexpanded_placeholder',
          unexpanded_env_vars: auth.unexpandedVars,
          message: `检测到环境变量 ${auth.unexpandedVars.join(', ')} 的值为未展开的变量名占位符而非真实密钥。请在扣子（Coze）技能设置中将 ZXKOL_API_KEY 配置为「开发者变量 / 默认值」（直接填入 zxk_live_... 密钥）并重新发布技能。`
        },
        null,
        2
      )
    )
    process.exit(1)
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream'
  }
  if (auth.apiKey) {
    headers.Authorization = `Bearer ${auth.apiKey}`
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args }
    })
  })

  const rawText = await res.text()
  let payload = null
  try {
    payload = rawText ? JSON.parse(rawText) : null
  } catch {
    console.error(
      `[zxkol-cli] HTTP ${res.status}: ${rawText.slice(0, 500) || res.statusText}`
    )
    process.exit(1)
  }

  if (!res.ok || typeof payload?.error === 'string') {
    console.error(
      JSON.stringify(
        payload ?? { status: res.status, error: res.statusText },
        null,
        2
      )
    )
    process.exit(1)
  }

  if (payload?.error) {
    console.error(JSON.stringify(payload.error, null, 2))
    process.exit(1)
  }

  const content = payload?.result?.content ?? []
  for (const item of content) {
    if (item.type === 'text') {
      console.log(item.text)
    } else {
      console.log(JSON.stringify(item, null, 2))
    }
  }
  if (payload?.result?.isError) {
    process.exit(1)
  }
}

async function main() {
  const auth = resolveZxkolAuth()
  const [cmd, arg1, arg2] = auth.positionalArgs
  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(
      'Usage: node zxkol-cli.mjs <find|describe|call|batch|read_more|account> [args...]'
    )
    process.exit(0)
  }

  switch (cmd) {
    case 'find':
      await callMcpTool(
        'find',
        {
          ...(arg1 ? { query: arg1 } : {}),
          ...(arg2 ? { platform: arg2 } : {})
        },
        auth
      )
      break
    case 'describe':
      if (!arg1) throw new Error('Missing endpoint_id')
      await callMcpTool('describe', { endpoint_id: arg1 }, auth)
      break
    case 'call': {
      if (!arg1) throw new Error('Missing endpoint_id')
      const params = arg2 ? JSON.parse(arg2) : {}
      await callMcpTool(
        'call',
        {
          endpoint_id: arg1,
          params,
          view: params.view || 'compact'
        },
        auth
      )
      break
    }
    case 'batch':
    case 'batch_call': {
      if (!arg1) throw new Error('Missing JSON array of calls')
      await callMcpTool('batch_call', { calls: JSON.parse(arg1) }, auth)
      break
    }
    case 'read_more':
      if (!arg1) throw new Error('Missing cache_id')
      await callMcpTool(
        'read_more',
        {
          cache_id: arg1,
          offset: Number(arg2 || 0)
        },
        auth
      )
      break
    case 'account':
      await callMcpTool('account', {}, auth)
      break
    default:
      // Allow calling any high-level tool by name, e.g. creator_search '{"keyword":"美妆"}'
      await callMcpTool(cmd, arg1 ? JSON.parse(arg1) : {}, auth)
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  main().catch(err => {
    console.error('[zxkol-cli]', err.message || err)
    process.exit(1)
  })
}
