# ZXKOL — Social Data for AI Agents 🌐

> One sentence, whole-web social data. Query creators, viral content, trending charts, and comment sentiment across **18+ social platforms** — straight from Claude, Cursor, or any MCP client.

<p align="center">
  <a href="https://github.com/kvalen-code/zxkol-skill/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/kvalen-code/zxkol-skill?style=social"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="MCP" src="https://img.shields.io/badge/Model_Context_Protocol-ready-7c3aed">
  <img alt="Platforms" src="https://img.shields.io/badge/platforms-18%2B-09C160">
</p>

**ZXKOL** turns "find me Douyin beauty creators with 100k–500k followers" into a single tool call — no scraping, no per-platform SDKs. It's a hosted [Model Context Protocol](https://modelcontextprotocol.io) server plus a drop-in skill: add one config block, get an API key, and your agent can pull KOL data, viral posts, hot lists, hashtag analytics, and AI comment insights from Douyin, TikTok, Xiaohongshu, Bilibili, YouTube, Instagram, and more.

```text
You:    Find Douyin beauty creators (100k–500k followers) and what's trending on Xiaohongshu right now.
Claude: → creator_search(keyword="beauty", followerRange="100-500k")
        → content_search(keyword="beauty", platforms=["xiaohongshu"])
        ✓ 12 creators + 8 trending notes, summarized.
```

---

## ✨ Features

- **One call, multi-platform** — high-level tools auto fan-out across platforms and normalize results for the LLM.
- **18+ platforms** — Douyin / TikTok / Xiaohongshu (RED) / Bilibili / Kuaishou / Weibo / YouTube / Instagram / Twitter(X) / Threads / Reddit / LinkedIn and more.
- **1000+ raw endpoints** — drop down to any specific endpoint via semantic `find_route` + `rest_call`.
- **AI comment insight** — sentiment, pain points, selling points, and content angles from a post's comments.
- **Works everywhere MCP works** — Claude Desktop, Claude Code, Cursor, Continue, Windsurf, Cody, and more.
- **Pay-as-you-go credits** — new accounts get **100 free credits**; cache hits are **half price**.

## 🛠 Tools

### High-level tools — one line, auto fan-out + normalization

| Tool | What it does | Platforms |
|---|---|---|
| `creator_search` | Find creators / KOLs (Douyin Xingtu official commercial data) | Douyin |
| `content_search` | Search viral content across platforms | 18 platforms |
| `hot_list` | Real-time hot lists / trending charts | 13 platforms |
| `content_detail` | Single post detail (stats, author, media) | 17 platforms |
| `comment_insight` | AI comment sentiment & insight analysis | 14 platforms |
| `hashtag_search` | Search hashtags / topics by keyword | 7+ platforms |
| `hashtag_posts` | Top posts under a hashtag | 7+ platforms |
| `douyin_index` | Douyin Index (keyword heat, brand radar, similar creators) | Douyin |
| `douyin_xingtu` | Douyin Xingtu KOL profile / audience / quote | Douyin |

### Power tools — direct access to 1000+ raw endpoints

| Tool | What it does |
|---|---|
| `find_route` | **Semantic search (top-5)** — pass a natural-language intent (EN/中文), get the best-matching route + required params |
| `list_routes` | Browse all routes with `platform` + `keyword` filters |
| `rest_call` | Call any endpoint by `route` id (e.g. `douyin/lives/room-products`) + `params` |

## 🚀 Quick start (2 minutes)

### 1. Get an API key

1. Sign up at **[zxkol.com](https://zxkol.com)** — new accounts get **100 free credits**.
2. Open **[Dashboard → API Keys](https://zxkol.com/dashboard/api-keys)** → **Create API Key**.
3. Copy your `zxk_live_...` key (shown once).

### 2. Add the MCP server

**Claude Desktop** — edit `~/.claude/mcp.json` (macOS/Linux) or `%USERPROFILE%\.claude\mcp.json` (Windows):

```json
{
  "mcpServers": {
    "zxkol": {
      "type": "http",
      "url": "https://zxkol.com/api/mcp",
      "headers": { "Authorization": "Bearer zxk_live_YOUR_KEY" }
    }
  }
}
```

**Cursor** — `~/.cursor/mcp.json`, same block. **Claude Code** — `.mcp.json` in your project root.

> More ready-to-paste configs in [`examples/`](examples/).

### 3. Ask

Restart your client and just ask — the tools appear automatically.

> "What's trending on Douyin today?" · "Analyze the comments on this TikTok video." · "Find Xiaohongshu mom-and-baby bloggers."

## 🧩 Use it as a Claude Code Skill

Prefer a skill over a raw MCP config? Drop [`SKILL.md`](SKILL.md) into `~/.claude/skills/zxkol/` (with [`mcp.json`](mcp.json) alongside). Claude Code will know *when* to reach for ZXKOL automatically.

## 💳 Pricing

- Credits are deducted per tool call from the key owner's balance.
- **Cache hits are half price** — repeated queries are nearly free.
- B2B (API-key) calls carry a 1.5× multiplier.
- Full pricing: **[zxkol.com/pricing](https://zxkol.com/pricing)**

## 📚 Links

- 🌐 Website — https://zxkol.com
- 📖 API docs — https://zxkol.com/docs/api
- 🔌 MCP guide — https://zxkol.com/docs/mcp
- 🗺 Coverage matrix (18 platforms / 26 capabilities / 1000+ endpoints) — https://zxkol.com/about/coverage

---

## ⭐ Star this repo

If ZXKOL saves you from writing yet another scraper, **drop a star** — it helps other builders find it.

---

<details>
<summary><b>中文说明（点击展开）</b></summary>

## 智选达人 (ZXKOL) — 给 AI Agent 的社媒数据

一句话查全网社媒数据。在 **Claude / Cursor / 任意 MCP 客户端**里，直接查达人、爆款、热榜、话题、评论舆情，覆盖**抖音、TikTok、小红书、B站、快手、微博、YouTube、Instagram** 等 18+ 平台。

### 工具一览

**高层工具（自动多平台 fan-out + 归一化）**：`creator_search` 找达人 · `content_search` 搜爆款 · `hot_list` 热榜 · `content_detail` 内容详情 · `comment_insight` AI 评论舆情 · `hashtag_search` / `hashtag_posts` 话题 · `douyin_index` 抖音指数 · `douyin_xingtu` 抖音星图。

**通用工具（直达 1000+ 原始接口）**：`find_route` 语义检索 · `list_routes` 浏览 · `rest_call` 通用调用。

### 三步接入

1. 注册 **[zxkol.com](https://zxkol.com)**（新用户送 **100 积分**）→ 进 **[控制台 → API 密钥](https://zxkol.com/dashboard/api-keys)** 创建 `zxk_live_...` key。
2. 把下面配置加到 `~/.claude/mcp.json`（Claude Desktop）/ `~/.cursor/mcp.json`（Cursor）/ 项目根 `.mcp.json`（Claude Code）：

```json
{
  "mcpServers": {
    "zxkol": {
      "type": "http",
      "url": "https://zxkol.com/api/mcp",
      "headers": { "Authorization": "Bearer zxk_live_你的key" }
    }
  }
}
```

3. 重启客户端，直接问即可。更多示例见 [`examples/`](examples/)。

### 计费

按工具调用扣积分，**缓存命中半价**，详见 [zxkol.com/pricing](https://zxkol.com/pricing)。

</details>

## License

[MIT](LICENSE) — applies to the config, docs, and skill manifest in this repo. The ZXKOL hosted service and data are subject to the [zxkol.com](https://zxkol.com) terms.
