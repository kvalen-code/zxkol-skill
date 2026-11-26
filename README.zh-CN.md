# 智选达人 (ZXKOL) — 面向 AI 智能体的全球社媒与商业数据网关 🌐

<p align="center"><a href="README.md">English</a> · <b>简体中文</b></p>

> 一句话直连全球 **34 大平台 · 286+ 标准化数据接口**。在 Claude Code、Codex、Cursor、OpenClaw 或任意 MCP 2.0 客户端中直接查询达人商业报价、爆款笔记视频、实时热榜、评论舆情、电商选品与广告投流情报。

<p align="center">
  <a href="https://github.com/kvalen-code/zxkol-skill/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/kvalen-code/zxkol-skill?style=social"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="MCP 2.1" src="https://img.shields.io/badge/MCP-2.1_Streamable_HTTP-7c3aed">
  <img alt="Platforms" src="https://img.shields.io/badge/覆盖平台-34-09C160">
  <img alt="Endpoints" src="https://img.shields.io/badge/标准接口-286%2B-2563eb">
</p>

<p align="center">
  <a href="https://zxkol.com"><img alt="智选达人 ZXKOL" src="assets/demo.png" width="800"></a>
</p>

**智选达人 (ZXKOL)** 将复杂的跨平台社媒与电商数据采集封装为即插即用的托管式 **MCP 2.0 Server + Agent Skill**：免维护爬虫与 Cookie、自带自有数据仓加速与多路智能容灾兜底，上游异常自动免扣费。

```text
用户:  并发对比今天抖音、小红书、微博的热榜，再找 5 位 10-50 万粉的抖音星图美妆达人看报价
Agent: → batch_call([douyin.hot.search, xiaohongshu.hot.list, weibo.hot.search])
       → creator_search(keyword="美妆", followerRange="10-50")
       ✓ 单轮并发拉取完成，首行附透明消费小票，自动输出结构化选号与热点报告
```

---

## ✨ v2.1 核心亮点

- **全网 34 大平台 · 286+ 标准化接口**：覆盖抖音（星图/巨量算数）、小红书（蒲公英）、微信公众号、微信视频号、微信搜一搜、B站、快手、微博、知乎、今日头条、淘宝/天猫、1688、闲鱼、抖音小店、TikTok（Shop/创意中心）、YouTube、Instagram、X (Twitter)、Reddit、Threads、LinkedIn、Bluesky、Telegram、Meta 广告库、Google 广告透明中心、Amazon、速卖通、App Store 等。
- **MCP 2.0 渐进式披露 + `batch_call` 五路并发**：`find` 与 `describe` 支持**免 Key 免费探索**；`batch_call` 单轮并发调用最多 5 个接口；超 20KB 大响应自动切片并通过 `read_more` 免费分段读取，保护模型上下文与客户端内存。
- **内置 MCP Resources & Prompts**：支持直接引用 `zxkol://catalog/platforms`、`zxkol://billing/rules`，以及一键调用 `kol-screening`、`viral-teardown`、`cross-platform-trends` 专业分析模板。
- **透明双轨计费**：优先扣减「通兑标准次数池」（常规接口 1 次/调，星图/蒲公英等高阶商业接口 5 次/调），次数不足自动由「人民币钱包」按实价抵扣；VIP 会员享充钱包 **8~9 折** 特权。

---

## 🛠 工具架构

### 1. MCP 2.0 六大核心原语（通达全部 34 平台 286+ 接口）

| 原语名称 | 计费规则 | 用途说明 |
| :--- | :--- | :--- |
| `find` | **免费（免 Key 可用）** | 中英文自然语言搜索 286+ 接口（支持按 `platform` 过滤）。 |
| `describe` | **免费（免 Key 可用）** | 查看指定 `endpoint_id` 的完整参数定义、返回实体模型及实时次数/人民币单价。 |
| `call` | 按接口实扣 | 调用任意标准化接口（推荐传 `view="compact"` 节省 60%+ Token），首行自带 `[消费小票]`。 |
| `batch_call` | 按成功子项扣费 | **单次并发执行 1~5 个接口调用**，适合多平台热榜对比或批量达人背调；失败子项不扣费。 |
| `read_more` | **免费（零扣费）** | 传 `cache_id` + `offset` 分段续读超过 20KB 的大响应（保留 15 分钟）。 |
| `account` | **免费** | 查询当前剩余通兑标准次数、高阶商业折算次数、钱包人民币余额及会员折扣。 |

### 2. 高层多平台语义聚合工具

| 工具名 | 用途 |
| :--- | :--- |
| `creator_search` | 抖音星图官方商业达人筛选（粉丝区间、报价档位、互动率、带货等级） |
| `douyin_star` | 抖音星图达人深度查询（`profile` 资料 / `audience` 受众画像 / `price` 报价 / `similar`） |
| `douyin_index` | 抖音巨量算数（关键词热度趋势、热词、品牌雷达、相似达人） |
| `content_search` | 多平台爆款视频与种草笔记并发搜索与字段归一化 |
| `hot_list` | 13+ 主流平台实时热搜榜一键获取 |
| `content_detail` | 单条视频/图文详情指标 |
| `comment_insight` | AI 评论区舆情分析（情感分布、用户痛点、购买触发点、选题建议） |
| `hashtag_search` / `hashtag_posts` | 话题标签热度检索与话题下头部爆款列表 |

---

## 🚀 2 分钟快速接入

### 1. 创建 API Key
1. 注册登录 **[zxkol.com](https://zxkol.com)**（新用户即赠免费体验通兑次数）。
2. 进入 **[控制中心 → API Keys](https://zxkol.com/dashboard/api-keys)** 点击「创建 API Key」，复制 `zxk_live_...`。

### 2. 一键安装 Skill 技能包（Claude Code / Codex / OpenClaw）
```bash
mkdir -p ~/.claude/skills/zxkol
curl -fsSL https://zxkol.com/skill.md -o ~/.claude/skills/zxkol/SKILL.md
```

### 3. 配置 MCP Server（`~/.claude/mcp.json`、项目 `.mcp.json` 或 `~/.cursor/mcp.json`）
```json
{
  "mcpServers": {
    "zxkol": {
      "type": "http",
      "url": "https://zxkol.com/api/mcp",
      "headers": {
        "Authorization": "Bearer zxk_live_你的密钥"
      }
    }
  }
}
```

---

## 📚 官方链接

- 🌐 **官网与对话工作台** — [https://zxkol.com](https://zxkol.com)
- 📄 **在线最新 Skill 源** — [https://zxkol.com/skill.md](https://zxkol.com/skill.md)
- 📖 **34 平台 API 文档** — [https://zxkol.com/docs/api](https://zxkol.com/docs/api)
- 🔌 **MCP 接入文档** — [https://zxkol.com/docs/mcp](https://zxkol.com/docs/mcp)
- 🧪 **在线接口调试台** — [https://zxkol.com/dashboard/playground](https://zxkol.com/dashboard/playground)
- 💳 **透明计费与会员** — [https://zxkol.com/pricing](https://zxkol.com/pricing)（实时价格 JSON：[`/prices.json`](https://zxkol.com/prices.json)）

---

## License

[MIT](LICENSE) — 适用于本仓库内的配置文件、示例与 Skill 描述文档；托管 API 与 MCP 数据网关服务遵循 [zxkol.com 服务条款](https://zxkol.com/terms)。
