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

const ENDPOINT = process.env.ZXKOL_MCP_URL || 'https://zxkol.com/api/mcp'
const API_KEY = process.env.ZXKOL_API_KEY || ''

async function callMcpTool(name, args = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream'
  }
  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`
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

  const payload = await res.json()
  if (payload.error) {
    console.error(JSON.stringify(payload.error, null, 2))
    process.exit(1)
  }

  const content = payload.result?.content ?? []
  for (const item of content) {
    if (item.type === 'text') {
      console.log(item.text)
    } else {
      console.log(JSON.stringify(item, null, 2))
    }
  }
  if (payload.result?.isError) {
    process.exit(1)
  }
}

async function main() {
  const [, , cmd, arg1, arg2] = process.argv
  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(
      'Usage: node zxkol-cli.mjs <find|describe|call|batch|read_more|account> [args...]'
    )
    process.exit(0)
  }

  switch (cmd) {
    case 'find':
      await callMcpTool('find', {
        ...(arg1 ? { query: arg1 } : {}),
        ...(arg2 ? { platform: arg2 } : {})
      })
      break
    case 'describe':
      if (!arg1) throw new Error('Missing endpoint_id')
      await callMcpTool('describe', { endpoint_id: arg1 })
      break
    case 'call': {
      if (!arg1) throw new Error('Missing endpoint_id')
      const params = arg2 ? JSON.parse(arg2) : {}
      await callMcpTool('call', {
        endpoint_id: arg1,
        params,
        view: params.view || 'compact'
      })
      break
    }
    case 'batch':
    case 'batch_call': {
      if (!arg1) throw new Error('Missing JSON array of calls')
      await callMcpTool('batch_call', { calls: JSON.parse(arg1) })
      break
    }
    case 'read_more':
      if (!arg1) throw new Error('Missing cache_id')
      await callMcpTool('read_more', {
        cache_id: arg1,
        offset: Number(arg2 || 0)
      })
      break
    case 'account':
      await callMcpTool('account', {})
      break
    default:
      // Allow calling any high-level tool by name, e.g. creator_search '{"keyword":"美妆"}'
      await callMcpTool(cmd, arg1 ? JSON.parse(arg1) : {})
  }
}

main().catch(err => {
  console.error('[zxkol-cli]', err.message || err)
  process.exit(1)
})
